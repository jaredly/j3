import { isTag } from '../keyboard/handleNav';
import { js, TestParser } from '../keyboard/test-utils';
import { Id, ListKind, Loc, RecNode, TableKind, Text, TextSpan } from '../shared/cnodes';
import { MatchParent } from './dsl';
import {
    binops,
    Expr,
    kwds,
    mergeSrc,
    nodesSrc,
    partition,
    Pat,
    RecordRow,
    Right,
    SExpr,
    SPat,
    Stmt,
    stmtSpans,
    Suffix,
    suffixops,
    Type,
    unops,
} from './ts-types';

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

type AutoComplete = string;

export type Ctx = {
    ref<T>(name: string): T;
    rules: Record<string, Rule<any>>;
    scope?: null | Record<string, any>;
    kwds: string[];
    meta: Record<number, { kind?: string; placeholder?: string }>;
    autocomplete?: {
        loc: number;
        concrete: AutoComplete[];
        kinds: (string | null)[];
    };
};

type Rule<T> =
    | { type: 'or'; opts: Rule<T>[] }
    | { type: 'tx'; inner: Rule<any>; f: (ctx: Ctx, src: Src) => T }
    | { type: 'kwd'; kwd: string; meta?: string }
    | { type: 'ref'; name: string; bind?: string }
    | { type: 'seq'; rules: Rule<any>[] }
    | { type: 'group'; name: string; inner: Rule<T> }
    | { type: 'star'; inner: Rule<unknown> }
    | { type: 'opt'; inner: Rule<unknown> }
    | { type: 'any' }
    //
    | { type: 'id'; kind?: string | null }
    | { type: 'number'; just?: 'int' | 'float' }
    | { type: 'text'; embed: Rule<unknown> }
    | { type: 'list'; kind: ListKind<Rule<unknown>>; item: Rule<unknown> }
    | { type: 'table'; kind: TableKind; row: Rule<unknown> };

// const show = (rule: Rule<unknown>): string => {
//     switch (rule.type) {
//         case 'kwd':
//             return rule.kwd;
//         case 'ref':
//             return '$' + rule.name;
//         case 'seq':
//             return `seq(${rule.rules.map(show).join(' ')})`;
//         case 'star':
//             return `${show(rule.inner)}*`;
//         case 'opt':
//             return `${show(rule.inner)}?`;
//         case 'id':
//             return `id`;
//         case 'text':
//             return `text(${show(rule.embed)})`;
//         case 'list':
//             return `list[${isTag(rule.kind) ? show(rule.kind.node) : typeof rule.kind === 'string' ? rule.kind : JSON.stringify(rule.kind)}](${show(
//                 rule.item,
//             )})`;
//         case 'table':
//             return `table[${rule.kind}](${show(rule.row)})`;
//         case 'or':
//             return `(${rule.opts.map(show).join('|')})`;
//         case 'tx':
//             return show(rule.inner);
//         case 'group':
//             return show(rule.inner);
//     }
// };

let indent = 0;

export const match = (rule: Rule<any>, ctx: Ctx, parent: MatchParent, at: number): undefined | null | { value?: any; consumed: number } => {
    if (ctx.rules.comment) {
        const { comment, ...without } = ctx.rules;
        const cm = match_(ctx.rules.comment, { ...ctx, rules: without }, parent, at);
        if (cm) {
            for (let i = 0; i < cm.consumed; i++) {
                const node = parent.nodes[at + i];
                ctx.meta[node.loc[0].idx] = { kind: 'comment' };
            }
            at += cm.consumed;
        }
    }
    // console.log(`> `.padStart(2 + indent), show(rule));
    // indent++;
    const res = match_(rule, ctx, parent, at);
    // indent--;
    // console.log(`${res ? '<' : 'x'} `.padStart(2 + indent), show(rule));
    return res;
};

// TODO: track a pathhhh
export const match_ = (rule: Rule<any>, ctx: Ctx, parent: MatchParent, at: number): undefined | null | { value?: any; consumed: number } => {
    const node = parent.nodes[at];
    switch (rule.type) {
        case 'kwd':
            if (node?.type !== 'id' || node.text !== rule.kwd) return;
            ctx.meta[node.loc[0].idx] = { kind: rule.meta ?? 'kwd' };
            return { value: node, consumed: 1 };
        case 'id':
            if (node?.type !== 'id' || ctx.kwds.includes(node.text)) return;
            return { value: node, consumed: 1 };
        case 'number': {
            if (node?.type !== 'id') return;
            if (rule.just === 'float' && !node.text.includes('.')) return;
            const num = Number(node.text);
            if (!Number.isFinite(num)) return;
            if (rule.just === 'int' && !Number.isInteger(num)) return;
            ctx.meta[node.loc[0].idx] = { kind: 'number' };
            return { value: num, consumed: 1 };
        }
        case 'text':
            if (node?.type !== 'text') return;
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

        case 'table': {
            if (node?.type !== 'table') return;
            const res: any[] = [];
            for (let i = 0; i < node.rows.length; i++) {
                const m = match(rule.row, { ...ctx, scope: null }, { nodes: node.rows[i], loc: node.loc, sub: { type: 'table', row: i } }, 0);
                if (m) {
                    res.push(m.value);
                }
            }
            return { value: res, consumed: 1 };
        }

        case 'list': {
            if (node?.type !== 'list') return;
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
                    // console.log('rule kind', attributes, node.kind.attributes);
                    if (!attributes) return; // TODO recovery?
                } else if (node.kind.attributes) {
                    // attributes not matched? make an 'extra' error
                    return;
                }
            } else if (node.kind !== rule.kind) {
                return;
            }

            const res = match(rule.item, ctx, { nodes: node.children, loc: node.loc }, 0);
            return res ? { value: res.value, consumed: 1 } : res;
        }

        case 'opt': {
            // if (!node) return { consumed: 0 };
            const inner = match(rule.inner, ctx, parent, at);
            // console.log('matching opt', inner, rule.inner);
            if (!inner) return { consumed: 0 };
            return inner;
        }

        case 'any':
            if (!node) return;
            return { consumed: 1 };

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
                if (isBlank(parent.nodes[at])) {
                    at++;
                    continue;
                }
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
            const left = at < parent.nodes.length ? parent.nodes[at].loc : [];
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

const isBlank = (node: RecNode) => node.type === 'id' && node.text === '';

// const isSingle = (rule: Rule<any>, ctx: Ctx): boolean => {
//     switch (rule.type) {
//         case 'kwd':
//         case 'any':
//             return true;
//         case 'ref':
//             return isSingle(ctx.rules[rule.name], ctx);
//         case 'seq':
//             return rule.rules.length === 1 && isSingle(rule.rules[0], ctx);
//         case 'star':
//             return false;
//         case 'id':
//             return true;
//         case 'text':
//             return true;
//         case 'list':
//             return true;
//         case 'opt':
//             return false;
//         case 'or':
//             return rule.opts.every((opt) => isSingle(opt, ctx));
//         case 'tx':
//             return isSingle(rule.inner, ctx);
//         case 'group':
//             return isSingle(rule.inner, ctx);
//     }
// };

// regex stuff
const or = <T>(...opts: Rule<T>[]): Rule<T> => ({ type: 'or', opts });
const tx = <T>(inner: Rule<any>, f: (ctx: Ctx, src: Src) => T): Rule<T> => ({ type: 'tx', inner, f });
const ref = <T>(name: string, bind?: string): Rule<T> => ({ type: 'ref', name, bind });
const opt = <T>(inner: Rule<T>): Rule<T | null> => ({ type: 'opt', inner });
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
const int: Rule<number> = { type: 'number', just: 'int' };
const float: Rule<number> = { type: 'number', just: 'float' };
const number: Rule<number> = { type: 'number' };
const list = <T>(kind: ListKind<Rule<unknown>>, item: Rule<T>): Rule<T> => ({ type: 'list', kind, item });
const table = <T>(kind: TableKind, row: Rule<T>): Rule<T> => ({ type: 'table', kind, row });

const types: Record<string, Rule<Type>> = {
    'type ref': tx(group('id', id(null)), (ctx, src) => ({ type: 'ref', name: ctx.ref<Id<Loc>>('id').text, src })),
};

const parseSmoosh = (base: Expr, suffixes: Suffix[], prefixes: Id<Loc>[], src: Src): Expr => {
    if (!suffixes.length && !prefixes.length) return base;
    suffixes.forEach((suffix) => {
        switch (suffix.type) {
            case 'attribute':
                base = { type: 'attribute', target: base, attribute: suffix.attribute, src: mergeSrc(base.src, nodesSrc(suffix.attribute)) };
                return;
            case 'call':
                base = { type: 'call', target: base, args: suffix.items, src: mergeSrc(base.src, suffix.src) };
                return;
            case 'index':
                base = { type: 'index', target: base, items: suffix.items, src: mergeSrc(base.src, suffix.src) };
                return;
            case 'suffix':
                base = { type: 'uop', op: suffix.op, src: mergeSrc(base.src, suffix.src), target: base };
                return;
        }
    });
    for (let i = prefixes.length - 1; i >= 0; i--) {
        base = { type: 'uop', op: prefixes[i], target: base, src: mergeSrc(nodesSrc(prefixes[i]), base.src) };
    }
    return { ...base, src };
};

const exprs: Record<string, Rule<Expr>> = {
    'expr num': tx(group('value', number), (ctx, src) => ({ type: 'number', value: ctx.ref<number>('value'), src })),
    'expr var': tx(group('id', id(null)), (ctx, src) => ({ type: 'var', name: ctx.ref<Id<Loc>>('id').text, src })),
    'expr table': tx(
        group(
            'rows',
            table(
                'curly',
                or(
                    tx(seq(group('key', id(null)), ref('expr', 'value')), (ctx, src) => ({
                        type: 'row',
                        name: ctx.ref<Id<Loc>>('key').text,
                        src,
                        value: ctx.ref<Expr>('value'),
                    })),
                    list('smooshed', seq(kwd('...'), ref('expr', 'value'))),
                    tx(group('single', id(null)), (ctx, src) => {
                        const key = ctx.ref<Id<Loc>>('single');
                        return { type: 'row', name: key.text, src, nsrc: src, value: { type: 'var', name: key.text, src: nodesSrc(key) } };
                    }),
                ),
            ),
        ),
        (ctx, src) => ({ type: 'record', rows: ctx.ref<RecordRow[]>('rows'), src }),
    ),
    'expr!': list('smooshed', ref('expr..')),
    'expr jsx': tx(
        list(
            {
                type: 'tag',
                node: ref('expr', 'tag'),
                attributes: opt(ref('expr', 'attributes')),
            },
            group('items', star(ref('expr'))),
        ),
        (ctx, src) => {
            const attrs = ctx.ref<Expr | null>('attributes');
            return {
                type: 'jsx',
                src,
                attributes: attrs?.type === 'record' ? attrs.rows : undefined,
                children: ctx.ref<Expr[]>('items'),
                tag: ctx.ref<Expr>('tag'),
            };
        },
    ),
};

const pats: Record<string, Rule<Pat>> = {
    'pattern var': tx(group('id', id(null)), (ctx, src) => ({ type: 'var', name: ctx.ref<Id<Loc>>('id').text, src })),
    'pattern array': tx(list('square', group('items', star(ref('pat*')))), (ctx, src) => ({ type: 'array', src, values: ctx.ref<SPat[]>('items') })),
    'pattern default': tx(list('spaced', seq(ref('pat', 'inner'), kwd('=', 'punct'), ref('expr ', 'value'))), (ctx, src) => ({
        type: 'default',
        inner: ctx.ref<Pat>('inner'),
        value: ctx.ref<Expr>('value'),
        src,
    })),
    'pattern typed': tx(list('smooshed', seq(ref('pat', 'inner'), kwd(':', 'punct'), ref('type', 'annotation'))), (ctx, src) => ({
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
    return: tx(seq(kwd('return'), ref('expr ', 'value')), (ctx, src) => ({ type: 'return', value: ctx.ref<Expr>('value'), src })),
    throw: tx(seq(kwd('throw'), ref('expr ', 'target')), (ctx, src) => ({ type: 'throw', target: ctx.ref<Expr>('target'), src })),
    let: tx(seq(kwd('let'), ref('pat', 'pat'), kwd('=', 'punct'), ref('expr ', 'value')), (ctx, src) => ({
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
    comment: list('smooshed', seq(kwd('//', 'comment'), { type: 'any' })),
    block: list('curly', star(ref('stmt'))),
    ...stmts,
    '...expr': or(
        tx<SExpr>(seq(kwd('...'), ref('expr..', 'inner')), (ctx, src) => ({ type: 'spread', inner: ctx.ref<Expr>('inner'), src })),
        ref('expr'),
    ),
    'expr..': tx<Expr>(
        seq(
            group('prefixes', star(or(...unops.map((k) => kwd(k, 'uop'))))),
            ref('expr', 'base'),
            group(
                'suffixes',
                star(
                    or<Suffix>(
                        tx(seq(kwd('.'), group('attribute', id('attribute'))), (ctx, src) => ({
                            type: 'attribute',
                            attribute: ctx.ref<Id<Loc>>('attribute'),
                            src,
                        })),
                        tx(list('square', group('items', star(ref('...expr')))), (ctx, src) => ({
                            type: 'index',
                            items: ctx.ref<SExpr[]>('items'),
                            src,
                        })),
                        tx(list('round', group('items', star(ref('...expr')))), (ctx, src) => ({
                            type: 'call',
                            items: ctx.ref<SExpr[]>('items'),
                            src,
                        })),
                        tx(group('op', or(...suffixops.map((s) => kwd(s, 'uop')))), (ctx, src) => ({
                            type: 'suffix',
                            op: ctx.ref<Id<Loc>>('op'),
                            src,
                        })),
                    ),
                ),
            ),
        ),
        (ctx, src) => parseSmoosh(ctx.ref<Expr>('base'), ctx.ref<Suffix[]>('suffixes'), ctx.ref<Id<Loc>[]>('prefixes'), src),
    ),
    'pattern spread': tx(list('smooshed', seq(kwd('...'), ref('pat', 'inner'))), (ctx, src) => ({ type: 'spread', inner: ctx.ref<Pat>('inner') })),
    expr: or(...Object.keys(exprs).map((name) => ref(name)), list('spaced', ref('expr '))),
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
    fancy: or<Expr>(
        tx(seq(list('round', group('args', star(ref('pat')))), kwd('=>', 'punct'), group('body', or(ref('expr'), ref('block')))), (ctx, src) => ({
            type: 'fn',
            args: ctx.ref<Pat[]>('args'),
            src,
            body: ctx.ref<Expr | Stmt[]>('body'),
        })),
        ref('expr'),
    ),
    bop: or(...binops.map((m) => kwd(m, 'bop'))),
    ...exprs,
    ...pats,
    pat: or(...Object.keys(pats).map((name) => ref(name))),
    type: or(...Object.keys(types).map((name) => ref(name))),
    ...types,
    'pat*': or(ref('pattern spread'), ...Object.keys(pats).map((name) => ref(name))),
};

export const ctx: Ctx = {
    rules,
    ref(name) {
        if (!this.scope) throw new Error(`no  scope`);
        return this.scope[name];
    },
    kwds: kwds,
    meta: {},
};

export const parser: TestParser = {
    config: js,
    parse(node, cursor) {
        const c = {
            ...ctx,
            meta: {},
            autocomplete: cursor != null ? { loc: cursor, concrete: [], kinds: [] } : undefined,
        };
        const res = match({ type: 'ref', name: 'stmt' }, c, { nodes: [node], loc: [] }, 0);
        console.log('metas', c.meta);

        return {
            result: res?.value,
            ctx: { meta: c.meta },
            bads: [],
            goods: [],
        };
    },
    spans: stmtSpans,
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
