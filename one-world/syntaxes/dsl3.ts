import { isTag } from '../keyboard/handleNav';
import { Id, ListKind, Loc, Text, TextSpan } from '../shared/cnodes';
import { MatchParent } from './dsl';
import { binops, Expr, partition, Pat, Right, SPat, Stmt, Type } from './ts-types';

/*

ok, I tried some things
but

now i'm back to thinking I want objects, not functions.

+
*
?
| or
seq
ref
^
$

*/

export type Src = { left: Loc; right?: Loc };

type Ctx = {
    ref<T>(name: string): T;
    rules: Record<string, Rule<any>>;
    scope?: null | Record<string, any>;
};

type Rule<T> =
    | { type: 'or'; opts: Rule<T>[] }
    | { type: 'tx'; inner: Rule<any>; f: (ctx: Ctx, src: Src) => T }
    | { type: 'kwd'; kwd: string; meta?: string }
    | { type: 'ref'; name: string; bind?: string }
    | { type: 'seq'; rules: Rule<any>[] }
    | { type: 'group'; name: string; inner: Rule<T> }
    | { type: 'star'; inner: Rule<unknown> } // *
    //
    | { type: 'id'; kind?: string | null }
    | { type: 'text'; embed: Rule<unknown> }
    | { type: 'list'; kind: ListKind<Rule<unknown>>; item: Rule<unknown> };

// TODO: track a pathhhh
export const match = (rule: Rule<any>, ctx: Ctx, parent: MatchParent, at: number): undefined | null | { value?: any; consumed: number } => {
    const node = parent.nodes[at];
    switch (rule.type) {
        case 'kwd':
            if (node.type !== 'id' || node.text !== rule.kwd) return;
        case 'id':
            if (node.type !== 'id') return;
            return { value: node, consumed: 1 };
        case 'text':
            if (node.type !== 'text') return;
            const spans: TextSpan<any>[] = [];
            for (let i = 0; i < node.spans.length; i++) {
                const span = node.spans[i];
                if (span.type === 'embed') {
                    const m = match(rule.embed, ctx, { nodes: [span.item], loc: node.loc, sub: { type: 'text', index: i } }, 0);
                    if (!m) return; // recovery
                    spans.push({ ...span, item: m.value });
                } else {
                    spans.push(span);
                }
            }
            return { value: spans, consumed: 1 };

        case 'list': {
            if (node.type !== 'list') return;
            if (isTag(node.kind)) {
                if (!isTag(rule.kind)) return;
                const tag = match(rule.kind.node, ctx, { nodes: [node.kind.node], loc: node.loc, sub: { type: 'xml', which: 'tag' } }, 0);
                if (!tag) return; // TODO recovery?
                if (rule.kind.attributes) {
                    const attributes = match(
                        rule.kind.attributes,
                        ctx,
                        { nodes: node.kind.attributes ? [node.kind.attributes] : [], loc: node.loc, sub: { type: 'xml', which: 'attributes' } },
                        0,
                    );
                    if (!attributes) return; // TODO recovery?
                } else if (node.kind.attributes) {
                    // attributes not matched? make an 'extra' error
                }
            }

            const res = match(rule.item, ctx, { nodes: node.children, loc: node.loc }, 0);
            return res ? { value: res.value, consumed: 1 } : res;
        }

        case 'ref': {
            // console.log('ref', rule.name);
            if (!ctx.rules[rule.name]) throw new Error(`no rule named '${rule.name}'`);
            const inner = match(ctx.rules[rule.name], { ...ctx, scope: null }, parent, at);
            if (!inner) return;
            if (rule.bind) {
                if (!ctx.scope) throw new Error(`not in a scoped context, cant bind ${rule.bind} for ${rule.name}`);
                ctx.scope[rule.bind] = inner.value;
                return { consumed: inner.consumed };
            }
            return inner;
        }
        case 'seq': {
            const start = at;
            for (let item of rule.rules) {
                const m = match(item, ctx, parent, at);
                if (!m) return; // err? err. errrr
                at += m.consumed;
            }
            return { consumed: at - start };
        }
        case 'star': {
            const start = at;
            const values: any[] = [];
            while (at < parent.nodes.length) {
                const m = match(rule.inner, ctx, parent, at);
                if (!m) break;
                values.push(m.value);
                at += m.consumed;
            }
            return { consumed: at - start, value: values };
        }
        case 'or': {
            for (let opt of rule.opts) {
                const m = match(opt, ctx, parent, at);
                if (m) return m;
            }
            return; // TODO errsss
        }
        case 'tx': {
            const ictx: Ctx = { ...ctx, scope: {} };
            const left = parent.nodes[at].loc;
            const m = match(rule.inner, ictx, parent, at);
            if (!m) return;
            const rat = at + m.consumed - 1;
            if (rat >= parent.nodes.length) throw new Error(`consume doo much ${at} ${rat} ${parent.nodes.length} ${m.consumed}`);
            // if (rat >= parent.nodes.length) console.error(`consume doo much ${at} ${rat} ${parent.nodes.length} ${m.consumed}`);
            const right = m.consumed > 1 && rat < parent.nodes.length ? parent.nodes[at + m.consumed - 1].loc : undefined;
            return { value: rule.f(ictx, { left, right }), consumed: m.consumed };
        }
        case 'group': {
            if (!ctx.scope) throw new Error(`group out of scope, must be within a tx()`);
            const m = match(rule.inner, { ...ctx, scope: null }, parent, at);
            if (!m) return;
            ctx.scope[rule.name] = m.value;
            return { consumed: m.consumed };
        }
    }
};

const isSingle = (rule: Rule<any>, ctx: Ctx): boolean => {
    switch (rule.type) {
        case 'kwd':
            return true;
        case 'ref':
            return isSingle(ctx.rules[rule.name], ctx);
        case 'seq':
            return rule.rules.length === 1 && isSingle(rule.rules[0], ctx);
        case 'star':
            return false;
        case 'id':
            return true;
        case 'text':
            return true;
        case 'list':
            return true;
        case 'or':
            return rule.opts.every((opt) => isSingle(opt, ctx));
        case 'tx':
            return isSingle(rule.inner, ctx);
        case 'group':
            return isSingle(rule.inner, ctx);
    }
};

// regex stuff
const or = <T>(...opts: Rule<T>[]): Rule<T> => ({ type: 'or', opts });
const tx = <T>(inner: Rule<any>, f: (ctx: Ctx, src: Src) => T): Rule<T> => ({ type: 'tx', inner, f });
const ref = <T>(name: string, bind?: string): Rule<T> => ({ type: 'ref', name, bind });
const seq = (...rules: Rule<any>[]): Rule<unknown> => ({ type: 'seq', rules });
const group = <T>(name: string, inner: Rule<T>): Rule<T> => ({ type: 'group', name, inner });
const star = <T>(inner: Rule<T>): Rule<T[]> => ({ type: 'star', inner });
const text = <T>(embed: Rule<T>): Rule<TextSpan<T>[]> => ({ type: 'text', embed });

// standard intermediate representation
// intermediate general representation
// - Id
// - Text
// - List
// - Table
const kwd = (kwd: string, meta?: string): Rule<unknown> => ({ type: 'kwd', kwd, meta });
const id = (kind?: string | null): Rule<unknown> => ({ type: 'id', kind });
const list = <T>(kind: ListKind<Rule<unknown>>, item: Rule<T>): Rule<T> => ({ type: 'list', kind, item });

const types: Record<string, Rule<Type>> = {
    'type ref': tx(group('id', id(null)), (ctx, src) => ({ type: 'ref', name: ctx.ref<Id<Loc>>('id').text, src })),
};

const exprs: Record<string, Rule<Expr>> = {
    'expr var': tx(group('id', id(null)), (ctx, src) => ({ type: 'var', name: ctx.ref<Id<Loc>>('id').text, src })),
};

const pats: Record<string, Rule<Pat>> = {
    'pattern var': tx(group('id', id(null)), (ctx, src) => ({ type: 'var', name: ctx.ref<Id<Loc>>('id').text, src })),
    'pattern array': tx(list('square', group('items', star(ref('pat*')))), (ctx, src) => ({ type: 'array', src, values: ctx.ref<SPat[]>('items') })),
    'pattern default': tx(list('spaced', seq(ref('pat', 'inner'), kwd('='), ref('expr ', 'value'))), (ctx, src) => ({
        type: 'default',
        inner: ctx.ref<Pat>('inner'),
        value: ctx.ref<Expr>('value'),
        src,
    })),
    'pattern typed': tx(list('smooshed', seq(ref('pat', 'inner'), kwd(':'), ref('type', 'annotation'))), (ctx, src) => ({
        type: 'typed',
        inner: ctx.ref<Pat>('inner'),
        ann: ctx.ref<Type>('annotation'),
        src,
    })),
    'pattern constructor': tx(
        list('smooshed', seq(group('constr', id('constructor')), list('round', group('args', star(ref('pat*')))))),
        (ctx, src) => ({ type: 'constr', constr: ctx.ref<Id<Loc>>('constr'), args: ctx.ref<Pat[]>('args'), src }),
    ),
    'pattern text': tx(group('spans', text(ref<Pat>('pat'))), (ctx, src) => ({ type: 'text', spans: ctx.ref<TextSpan<Pat>[]>('spans'), src })),
};

const stmts: Record<string, Rule<Stmt>> = {
    for: tx(
        seq(kwd('for'), list('round', seq(ref('stmt', 'init'), ref('expr', 'cond'), ref('expr', 'update'))), ref('block', 'body')),
        (ctx, src) => ({
            type: 'for',
            init: ctx.ref<Stmt>('init'),
            cond: ctx.ref<Expr>('cond'),
            update: ctx.ref<Expr>('update'),
            body: ctx.ref<Stmt[]>('body'),
            src,
        }),
    ),
    return: tx(seq(kwd('return'), ref('expr ', 'target')), (ctx, src) => ({ type: 'return', target: ctx.ref<Expr>('target'), src })),
    throw: tx(seq(kwd('throw'), ref('expr ', 'target')), (ctx, src) => ({ type: 'throw', target: ctx.ref<Expr>('target'), src })),
    let: tx(seq(kwd('let'), ref('pat'), kwd('='), ref('expr ', 'value')), (ctx, src) => ({
        type: 'let',
        pat: ctx.ref<Pat>('pat'),
        value: ctx.ref<Expr>('value'),
        src,
    })),
};

const stmtSpaced = or(...Object.keys(stmts).map((name) => ref(name)));

export const rules = {
    id: id(null),
    stmt: or(
        list('spaced', stmtSpaced),
        tx<Stmt>(ref('expr', 'expr'), (ctx, src) => ({ type: 'expr', expr: ctx.ref<Expr>('expr'), src })),
    ),
    ...stmts,
    'pattern spread': tx(list('smooshed', seq(kwd('...'), ref('pat', 'inner'))), (ctx, src) => ({ type: 'spread', inner: ctx.ref<Pat>('inner') })),
    expr: or(...Object.keys(exprs).map((name) => ref(name))),
    'expr ': tx<Expr>(
        seq(
            ref('fancy', 'left'),
            group(
                'rights',
                star(tx(seq(ref('bop', 'op'), ref('fancy', 'right')), (ctx, src) => ({ op: ctx.ref<Id<Loc>>('op'), right: ctx.ref<Expr>('right') }))),
            ),
        ),
        (ctx, src) => {
            const rights = ctx.ref<Right[]>('rights');
            const left = ctx.ref<Expr>('left');
            return rights.length ? { ...partition(left, rights), src } : left;
        },
    ),
    fancy: or(ref('expr')),
    bop: or(...binops.map((m) => kwd(m))),
    ...exprs,
    ...pats,
    pat: or(...Object.keys(pats).map((name) => ref(name))),
    type: or(...Object.keys(types).map((name) => ref(name))),
    ...types,
    'pat*': or(ref('pattern spread'), ...Object.keys(pats).map((name) => ref(name))),
};

/*

OK so I think what I want
is a parsing traceback

like
"here's the path to get here"
- both from the CST side
- and from the ... parse ... tree ... side?
andd we can introspect at each point, to
see why a given rule wasn't taken.
yeah.

that would be super cool

*/
