import { Id, Loc, TextSpan } from '../shared/cnodes';
import { mref, Matcher, id, list, multi, idt, sequence, idp, text, kwd, switch_, named, opt, table, tx } from './dsl';

const pat_ = mref<Pat>('pat');
const sprpat_ = mref<SPat>('sprpat');

// Should all matcher be ... records?
// in order?
// that would be ... interesting.

type PSpread = { type: 'spread'; inner: Pat };
type SPat = Pat | PSpread;
type Pat =
    | { type: 'bound'; name: string }
    | { type: 'array'; values: SPat[] }
    | PCon
    | {
          type: 'text';
          spans: TextSpan<Pat>[];
      };
type PCon = { type: 'constr'; constr: Id<Loc>; args: Pat[] };

const _pat: Matcher<Pat>[] = [
    id(null, (node) => ({ type: 'bound' as const, name: node.text })),
    list('square', multi(sprpat_, true, idt), (values) => ({ type: 'array', values })),
    list(
        'smooshed',
        sequence<PCon, PCon>(
            [
                //
                id('constructor', (node) => ({ type: 'constr', constr: node })),
                list('round', multi(pat_, true, idt), (args) => ({ args })),
            ],
            true,
            idp,
        ),
        idt,
    ),
    text(pat_, (spans) => ({ type: 'text', spans })),
];

const _spat: Matcher<SPat>[] = [
    ..._pat,
    list('smooshed', sequence<Pat, Pat>([kwd('..', () => ({})), pat_], true, idt), (inner) => ({ type: 'spread', inner })),
];

const uops = ['+', '-', '!', '~'];

const block = list('curly', multi(mref<Stmt>('stmt'), true, idt), idt);

const expr_ = mref<Expr>('expr');
const sprexpr_ = mref<SExpr>('sprexpr');

type SExpr = Expr | { type: 'spread'; inner: Expr };
type Expr =
    | { type: 'local'; name: string }
    | { type: 'global'; id: Id<Loc> }
    | { type: 'text'; spans: TextSpan<SExpr>[] }
    | { type: 'array'; items: SExpr[] }
    | { type: 'tuple'; items: SExpr[] }
    | { type: 'bops'; left: Expr; rights: { op: Id<Loc>; right: Expr }[] }
    | ESmoosh
    | { type: 'record'; rows: RecordRow[] }
    | Fancy;
type ESmoosh = { type: 'smooshed'; prefixes: Id<Loc>[]; base: Expr; suffixes: Suffix[] };

type Suffix = { type: 'index'; items: SExpr } | { type: 'call'; items: SExpr } | { type: 'attribute'; attribute: Id<Loc> };
type RecordRow = { type: 'single'; inner: SExpr } | { type: 'row'; key: Id<Loc>; value: Expr };
type Stmt = { type: 'expr'; expr: Expr } | { type: 'let'; pat: Pat; value: Expr };

const binned_ = mref<Expr>('binned');

type Fancy = { type: 'if'; cond: Expr; yes: Stmt[]; no: Stmt[] } | { type: 'case'; target: Expr; cases: { pat: Pat; body: Expr }[] };

const fancy = switch_<Expr, Expr>(
    [
        sequence<Fancy, Fancy>(
            [
                kwd('if', () => ({ type: 'if' })),
                named('cond', binned_),
                named('yes', block),
                opt(sequence<Partial<Fancy>, Partial<Fancy>>([kwd('else', () => null), named('no', block)], false, idt), idt),
            ],
            false,
            idt,
        ),
        sequence<Fancy, Fancy>(
            [
                kwd('case', () => ({ type: 'case' })),
                named('target', binned_),
                named('cases', table('curly', sequence([named('pat', pat_), named('body', expr_)], true, idt), idt)),
            ],
            false,
            idt,
        ),
        expr_,
    ],
    idt,
);

const binops = ['<', '>', '<=', '>=', '!=', '==', '+', '-', '*', '/', '^', '%'];
const unops = ['+', '-', '!'];
// const binned: Matcher<Expr> = sequence<{ left: Expr; rights: { op: Id<Loc>; right: Expr }[] }, Expr>(
//     [named('left', fancy), named('rights', multi(sequence([named('op', id('binop', idt)), named('right', fancy)], false, idt), false, idt))],
//     false,
//     ({ left, rights }): Expr => {
//         return rights.length ? { type: 'bops', left, rights } : left;
//     },
// );

const _exmoosh: Matcher<Omit<ESmoosh, 'type'>>[] = [
    named(
        'prefixes',
        multi(
            switch_(
                unops.map((n) => kwd(n, idt)),
                idt,
            ),
            false,
            idt,
        ),
    ),
    named('base', expr_),
    named(
        'suffixes',
        multi(
            switch_(
                [
                    sequence<Suffix>([kwd('.', () => ({ type: 'attribute' })), named('attr', id('attribute', idt))], false, idt),
                    list<0, SExpr, Suffix>('square', multi(sprexpr_, true), (items) => ({ type: 'index', items })),
                    list<0, SExpr, Suffix>('round', multi(sprexpr_, true), (items) => ({ type: 'call', items })),
                ],
                idt,
            ),
            true,
        ),
    ),
];

const _nosexpr: Matcher<Expr> = list('smooshed', sequence(_exmoosh, true, idt), (data) => ({
    type: 'smooshed',
    ...data,
}));

const _sprood: Matcher<SExpr> = list(
    'smooshed',
    sequence<Omit<ESmoosh, 'type'> & { spread: true | null }>(
        [
            named(
                'spread',
                opt(
                    kwd('..', () => true),
                    idt,
                ),
            ),
            ..._exmoosh,
        ],
        true,
        idt,
    ),
    ({ spread, ...data }) => (spread ? { type: 'spread', inner: { type: 'smooshed', ...data } } : { type: 'smooshed', ...data }),
);

const _expr: Matcher<Expr>[] = [
    id(null, (node) => ({ type: 'local', name: node.text })),
    id('value', (id) => ({ type: 'global', id })),
    text(sprexpr_, (spans) => ({ type: 'text', spans })),
    list('square', multi(sprexpr_, true), (items) => ({ type: 'array', items })),
    table(
        'curly',
        switch_<RecordRow, RecordRow>(
            [
                tx(sprexpr_, (inner) => ({ type: 'single', inner })),
                sequence<RecordRow>([id('attribute', (key) => ({ type: 'row', key })), named('value', expr_)], true, idt),
            ],
            idt,
        ),
        (rows) => ({
            type: 'record',
            rows,
        }),
    ),
    list('round', multi(sprexpr_, true), (items) => ({ type: 'tuple', items })),
    list('spaced', binned_, idt),
];

export const kwds = ['if', 'case', 'else', 'let', '=', '..', '.'];

export const matchers = {
    expr: switch_([..._expr, _nosexpr], idt),
    sprexpr: switch_([..._expr, _sprood], idt), // expr with spreads,
    pat: switch_(_pat, idt),
    sprpat: switch_(_spat, idt),
    stmt: switch_<Stmt, Stmt>(
        [
            list(
                'spaced',
                sequence<Stmt, Stmt>(
                    [kwd('let', () => ({ type: 'let' })), named('pat', pat_), kwd('=', () => null), named('value', binned_)],
                    true,
                    idt,
                ),
                idt,
            ),
            tx(expr_, (expr) => ({ type: 'expr', expr })),
        ],
        idt,
    ),
    binned: sequence<{ left: Expr; rights: { op: Id<Loc>; right: Expr }[] }, Expr>(
        [named('left', fancy), named('rights', multi(sequence([named('op', id('binop', idt)), named('right', fancy)], false, idt), false, idt))],
        false,
        ({ left, rights }): Expr => {
            return rights.length ? { type: 'bops', left, rights } : left;
        },
    ),
};
