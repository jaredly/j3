import { Id, Loc, RecNode, TextSpan } from '../shared/cnodes';
import { mref, Matcher, id, list, multi, idt, sequence, idp, text, kwd, switch_, named, opt, table, tx } from './dsl';

const pat_ = mref<Pat>('pat');
const sprpat_ = mref<SPat>('sprpat');

// Should all matcher be ... records?
// in order?
// that would be ... interesting.

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

const block = list('curly', multi(mref<Stmt>('stmt'), true, idt), idt);

const expr_ = mref<Expr>('expr');
const sprexpr_ = mref<SExpr>('sprexpr');

// type Shown = {left:}

type Src = { left: Loc; right?: Loc };

type PSpread = { type: 'spread'; inner: Pat };
type SPat = Pat | PSpread;
type Pat = { type: 'bound'; name: string } | { type: 'array'; values: SPat[] } | PCon | { type: 'text'; spans: TextSpan<Pat>[] };
type PCon = { type: 'constr'; constr: Id<Loc>; args: Pat[] };

type SExpr = Expr | { type: 'spread'; inner: Expr };
type Expr =
    | { type: 'local'; name: string; src: Src }
    | { type: 'global'; id: Id<Loc>; src: Src }
    | { type: 'text'; spans: TextSpan<SExpr>[]; src: Src }
    | { type: 'array'; items: SExpr[]; src: Src }
    | { type: 'tuple'; items: SExpr[]; src: Src }
    | { type: 'bops'; left: Expr; rights: { op: Id<Loc>; right: Expr }[]; src: Src }
    | ESmoosh
    | { type: 'record'; rows: RecordRow[]; src: Src }
    | Fancy;
type ESmoosh = { type: 'smooshed'; prefixes: Id<Loc>[]; base: Expr; suffixes: Suffix[]; src: Src };

type Suffix = { type: 'index'; items: SExpr } | { type: 'call'; items: SExpr } | { type: 'attribute'; attribute: Id<Loc> };
type RecordRow = { type: 'single'; inner: SExpr } | { type: 'row'; key: Id<Loc>; value: Expr };
type Stmt = { type: 'expr'; expr: Expr; src: Src } | { type: 'let'; pat: Pat; value: Expr; src: Src };

type XML = { tag: string; attrs: Record<string, any>; children: Record<string, XML | XML[]> };

// const toXML = (value: SExpr | Stmt | Pat): XML => {
//     switch (value.type) {
//         case 'let':
//             return { tag: 'let', attrs: { src: value.src }, children: { pat: toXML(value.pat) } };
//     }
// };

const binned_ = mref<Expr>('binned');

type Fancy =
    | { type: 'if'; cond: Expr; yes: Stmt[]; no: Stmt[]; src: Src }
    | { type: 'case'; target: Expr; cases: { pat: Pat; body: Expr }[]; src: Src };

export type Visitor = {
    stmt: (s: Stmt) => void;
    expr: (e: Expr) => void;
    pat: (p: Pat) => void;
    sexpr: (e: SExpr) => void;
};

export const visitSExpr = (expr: SExpr, v: Visitor) => {
    if (expr.type === 'spread') {
        v.sexpr(expr);
        visitExpr(expr.inner, v);
    } else {
        visitExpr(expr, v);
    }
};

export const visitExpr = (expr: Expr, v: Visitor) => {
    v.expr(expr);
    switch (expr.type) {
        case 'array':
        case 'tuple':
            expr.items.forEach((child) => visitSExpr(child, v));
            break;
        case 'if':
            visitExpr(expr.cond, v);
            expr.yes.forEach((s) => visitStmt(s, v));
            expr.no.forEach((s) => visitStmt(s, v));
            break;
        case 'local':
        case 'global':
            return;
    }
};

export const visitPat = (pat: Pat, v: Visitor) => {
    v.pat(pat);
};

export const visitStmt = (stmt: Stmt, v: Visitor) => {
    v.stmt(stmt);
    switch (stmt.type) {
        case 'expr':
            return visitExpr(stmt.expr, v);
        case 'let':
            visitPat(stmt.pat, v);
            visitExpr(stmt.value, v);
            return;
    }
};

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
            (f, nodes) => ({ ...f, src: nodesSrc(nodes) }),
        ),
        sequence<Fancy, Fancy>(
            [
                kwd('case', () => ({ type: 'case' })),
                named('target', binned_),
                named('cases', table('curly', sequence([named('pat', pat_), named('body', expr_)], true, idt), idt)),
            ],
            false,
            (f, nodes) => ({ ...f, src: nodesSrc(nodes) }),
        ),
        expr_,
    ],
    idt,
);

const binops = ['<', '>', '<=', '>=', '!=', '==', '+', '-', '*', '/', '^', '%'];
const unops = ['+', '-', '!', '~'];

// const uops = ['+', '-', '!', '~'];
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
    ({ spread, ...data }, nodes) =>
        spread ? { type: 'spread', inner: { type: 'smooshed', ...data }, src: nodesSrc(nodes) } : { type: 'smooshed', ...data, src: nodesSrc(nodes) },
);

const nodesSrc = (nodes: RecNode | RecNode[]): Src =>
    Array.isArray(nodes)
        ? nodes.length === 1
            ? { left: nodes[0].loc }
            : {
                  left: nodes[0].loc,
                  right: nodes[nodes.length - 1].loc,
              }
        : { left: nodes.loc };

const _expr: Matcher<Expr>[] = [
    id(null, (node) => ({ type: 'local', name: node.text, src: { left: node.loc } })),
    // id('value', (id) => ({ type: 'global', id, src })),
    text(sprexpr_, (spans, node) => ({ type: 'text', spans, src: { left: node.loc } })),
    list('square', multi(sprexpr_, true), (items, node) => ({ type: 'array', items, src: { left: node.loc } })),
    table(
        'curly',
        switch_<RecordRow, RecordRow>(
            [
                tx(sprexpr_, (inner) => ({ type: 'single', inner })),
                sequence<RecordRow>([id('attribute', (key) => ({ type: 'row', key })), named('value', expr_)], true, idt),
            ],
            idt,
        ),
        (rows, node) => ({
            type: 'record',
            rows,
            src: { left: node.loc },
        }),
    ),
    list('round', multi(sprexpr_, true), (items, node) => ({ type: 'tuple', items, src: { left: node.loc } })),
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
        [
            named('left', fancy),
            named(
                'rights',
                multi(
                    sequence(
                        [
                            named(
                                'op',
                                switch_(
                                    binops.map((n) => kwd(n, idt)),
                                    idt,
                                ),
                            ),
                            named('right', fancy),
                        ],
                        false,
                        idt,
                    ),
                    false,
                    idt,
                ),
            ),
        ],
        false,
        ({ left, rights }, nodes): Expr => {
            if (!nodes.length) throw new Error(`binned didnt consume somehow`);
            return rights.length
                ? {
                      type: 'bops',
                      left,
                      rights,
                      src: nodesSrc(nodes),
                  }
                : left;
        },
    ),
};
