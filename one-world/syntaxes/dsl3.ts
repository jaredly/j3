import { Id, ListKind, Loc, Text, TextSpan } from '../shared/cnodes';
import { Expr, Pat, SPat, Stmt, Type } from './ts-types';

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
const ref = <T>(name: string, bind: string = name): Rule<T> => ({ type: 'ref', name, bind });
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

const rules = {
    id: id(null),
    stmt: or(
        list('spaced', stmtSpaced),
        tx<Stmt>(ref('expr', 'expr'), (ctx, src) => ({ type: 'expr', expr: ctx.ref<Expr>('expr'), src })),
    ),
    ...stmts,
    'pattern spread': tx(list('smooshed', seq(kwd('...'), ref('pat', 'inner'))), (ctx, src) => ({ type: 'spread', inner: ctx.ref<Pat>('inner') })),
    ...pats,
    pat: or(...Object.keys(pats).map((name) => ref(name))),
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
