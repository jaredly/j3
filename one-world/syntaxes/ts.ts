/*

// const {a: b = 5, 'c': ms} = {c: 3}
// const [a = 5] = []
// const n = (n = 5, [[a, b] = [5, 4]], {m = 5}) => 5

type Expr =
    | { type: 'var'; name: string; src: Src }
    | { type: 'text'; spans: TextSpan<Expr>[]; src: Src }
    | { type: 'array' | 'tuple'; items: SExpr[]; src: Src }
    | { type: 'bops'; op: Id<Loc>; items: Expr[]; src: Src }
    | { type: 'record'; rows: RecordRow[]; src: Src }
    | { type: 'call'; target: Expr; args: SExpr[]; src: Src }
    | { type: 'uop'; op: Id<Loc>; target: Expr; src: Src }
    | { type: 'attribute'; target: Expr; attribute: Id<Loc>; src: Src }
    | { type: 'index'; target: Expr; items: SExpr[]; src: Src }
    | Fancy;
type SExpr = { type: 'spread'; inner: Expr; src: Src };
type RecordRow = { type: 'single'; inner: SExpr } | { type: 'row'; key: Id<Loc>; value: Expr };

type Fn = { type: 'fn'; args: Pat[]; body: Expr | Stmt[]; src: Src };
type Fancy =
    | Fn
    | { type: 'if'; cond: Expr; yes: Stmt[]; no?: Stmt[]; src: Src }
    | { type: 'switch'; target: Expr; cases: { pat: Pat; body: Stmt[] | Expr }[]; src: Src };

type Stmt = { type: 'expr'; expr: Expr; src: Src } | { type: 'let'; pat: Pat; value: Expr; src: Src } | { type: 'return'; expr?: Expr; src: Src };

const pat_ = mref<Pat>('pat');
const sprpat_ = mref<SPat>('sprpat');
const expr_ = mref<Expr>('expr');
const sprexpr_ = mref<SExpr>('sprexpr');

const exprCommon: Matcher<Expr>[] = [
    id(null, node => ({type: 'var', name: node.text, src: nodesSrc(node)})),
    text(expr_, (spans, node) => ({ type: 'text', spans, src: nodesSrc(node) })),
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
        (rows, node) => ({ type: 'record', rows, src: { left: node.loc } }),
    ),
    list('round', multi(sprexpr_, true), (items, node) => ({ type: 'tuple', items, src: { left: node.loc } })),
    // list('spaced', binned_, idt),
]

export const matchers = {

}
*/

import { Src } from '../keyboard/handleShiftNav';
import { Id, Loc, RecNode, TextSpan } from '../shared/cnodes';
import { any, Ctx, id, idp, idt, kwd, list, Matcher, meta, mref, multi, named, opt, sequence, switch_, table, text, tx } from './dsl';

type Pat =
    | { type: 'var'; name: string; src: Src }
    | { type: 'array'; values: SPat[]; src: Src }
    | { type: 'default'; inner: Pat; value: Expr; src: Src }
    | { type: 'record'; values: PRecordRow[]; src: Src }
    | { type: 'typed'; inner: Pat; ann: Type; src: Src }
    | PCon
    | { type: 'text'; spans: TextSpan<Pat>[]; src: Src };
type SPat = Pat | { type: 'spread'; inner: Pat; src: Src };

type Type =
    | { type: 'ref'; name: string; src: Src }
    | { type: 'app'; target: Type; args: Type[]; src: Src }
    | { type: 'fn'; args: { name: string; type: Type }[]; body: Type; src: Src };

type PRecordRow =
    | { type: 'spread'; inner: Pat; src: Src }
    | {
          type: 'row';
          name?: string; // if name is undef, then value should be var or default(var)
          nsrc: Src;
          value: Pat;
          src: Src;
      };
type PCon = { type: 'constr'; constr: Id<Loc>; args: Pat[]; src: Src };

/*

type PSpread = { type: 'spread'; inner: Pat; src: Src };
type SPat = Pat | PSpread;
type Pat =
    | { type: 'bound'; name: string; src: Src }
    | { type: 'array'; values: SPat[]; src: Src }
    | PCon
    | { type: 'text'; spans: TextSpan<Pat>[]; src: Src };
type PCon = { type: 'constr'; constr: Id<Loc>; args: Pat[]; src: Src };

*/

const type_ = mref<Type>('type');
const pat_ = mref<Pat>('pat');
const sprpat_ = mref<SPat>('sprpat');

// Should all matcher be ... records?
// in order?
// that would be ... interesting.

const _pat: Matcher<Pat>[] = [
    id(null, (node) => ({ type: 'var', name: node.text, src: nodesSrc(node) })),
    list('square', multi(sprpat_, true, idt), (values, node) => ({ type: 'array', values, src: nodesSrc(node) })),
    list(
        'smooshed',
        sequence<{ inner: Pat; ann: Type }, Pat>([named('inner', pat_), kwd(':', () => null), named('ann', type_)], true, ({ inner, ann }, node) => ({
            type: 'typed',
            inner,
            ann,
            src: nodesSrc(node),
        })),
        idt,
    ),
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
    text(pat_, (spans, node) => ({ type: 'text', spans, src: nodesSrc(node) })),
];

const _spat: Matcher<SPat>[] = [
    ..._pat,
    list(
        'smooshed',
        sequence<Pat, Pat>(
            [
                meta(
                    'punct',
                    kwd('...', () => ({})),
                ),
                pat_,
            ],
            true,
            idt,
        ),
        (inner, node) => ({ type: 'spread', inner, src: nodesSrc(node) }),
    ),
];

const block = list('curly', multi(mref<Stmt>('stmt'), true, idt), idt);

const expr_ = mref<Expr>('expr');
const stmt_ = mref<Stmt>('stmt');
const sprexpr_ = mref<SExpr>('sprexpr');

// async function m() {
//     let x = 2 + await new Number
// }

// type Shown = {left:}

type SExpr = Expr | { type: 'spread'; inner: Expr; src: Src };
type Expr =
    | { type: 'var'; name: string; src: Src }
    | { type: 'text'; spans: TextSpan<SExpr>[]; src: Src }
    | { type: 'array'; items: SExpr[]; src: Src }
    | { type: 'tuple'; items: SExpr[]; src: Src }
    // Is this how I want to do it?
    // OR do I make associativity more explicit?
    | { type: 'bops'; op: Id<Loc>; items: Expr[]; src: Src }
    // | ESmoosh
    | { type: 'record'; rows: RecordRow[]; src: Src }
    | { type: 'call'; target: Expr; args: SExpr[]; src: Src }
    | { type: 'uop'; op: Id<Loc>; target: Expr; src: Src }
    | { type: 'attribute'; target: Expr; attribute: Id<Loc>; src: Src }
    | { type: 'index'; target: Expr; items: SExpr[]; src: Src }
    | Fancy;

// Stmtssss
// Ok, so Exprs, Pats, and Stmts...

type Visitor<T> = {
    expr(expr: SExpr, v: T): T;
    stmt(stmt: Stmt, v: T): T;
    pat(pat: SPat, v: T): T;
    typ(typ: Type, v: T): T;
};

export const stmtSpans = (stmt: Stmt) => {
    const spans: Src[] = [];
    foldStmt<void>(stmt, undefined, {
        expr(expr, v) {
            spans.push(expr.src);
        },
        pat(pat, v) {
            spans.push(pat.src);
        },
        stmt(stmt, v) {
            spans.push(stmt.src);
        },
        typ(typ, v) {
            spans.push(typ.src);
        },
    });
    return spans;
};

export const foldType = <T>(typ: Type, i: T, v: Visitor<T>): T => {
    i = v.typ(typ, i);
    switch (typ.type) {
        case 'fn':
            typ.args.forEach((arg) => {
                i = foldType(arg.type, i, v);
            });
            i = foldType(typ.body, i, v);
            return i;
        case 'app':
            i = foldType(typ.target, i, v);
            typ.args.forEach((arg) => {
                i = foldType(arg, i, v);
            });
            return i;
    }
    return i;
};

export const foldPat = <T>(pat: SPat, i: T, v: Visitor<T>): T => {
    i = v.pat(pat, i);
    switch (pat.type) {
        case 'array':
            pat.values.forEach((item) => {
                i = foldPat(item, i, v);
            });
            return i;
        case 'typed':
            i = foldPat(pat.inner, i, v);
            i = foldType(pat.ann, i, v);
            return i;
        case 'default':
            i = foldPat(pat.inner, i, v);
            i = foldExpr(pat.value, i, v);
            return i;
        case 'record':
            pat.values.forEach((row) => {
                if (row.type === 'spread') {
                    i = foldPat(row.inner, i, v);
                } else {
                    i = foldPat(row.value, i, v);
                }
            });
            return i;
        case 'var':
            return i;
        case 'constr':
            pat.args.forEach((arg) => {
                i = foldPat(arg, i, v);
            });
            return i;
        case 'text':
            pat.spans.forEach((span) => {
                if (span.type === 'embed') {
                    i = foldPat(span.item, i, v);
                }
            });
            return i;
        case 'spread':
            return foldPat(pat.inner, i, v);
    }
};

export const foldStmt = <T>(stmt: Stmt, i: T, v: Visitor<T>): T => {
    i = v.stmt(stmt, i);

    switch (stmt.type) {
        case 'expr':
            return foldExpr(stmt.expr, i, v);
        case 'return':
            return stmt.value ? foldExpr(stmt.value, i, v) : i;
        case 'throw':
            return foldExpr(stmt.target, i, v);
        case 'let':
            i = foldPat(stmt.pat, i, v);
            return foldExpr(stmt.value, i, v);
        case 'for':
            i = foldExpr(stmt.init, i, v);
            i = foldExpr(stmt.cond, i, v);
            i = foldExpr(stmt.cond, i, v);
            stmt.body.forEach((s) => {
                i = foldStmt(s, i, v);
            });
            return i;
    }
};

export const foldExpr = <T>(expr: SExpr | Blank, i: T, v: Visitor<T>): T => {
    if (expr.type === 'blank') return i;
    i = v.expr(expr, i);

    switch (expr.type) {
        case 'spread':
            foldExpr(expr.inner, i, v);
            return i;
        case 'text':
            expr.spans.forEach((span) => {
                if (span.type === 'embed') {
                    i = foldExpr(span.item, i, v);
                }
            });
            return i;
        case 'array':
        case 'tuple':
        case 'bops':
            expr.items.forEach((item) => {
                i = foldExpr(item, i, v);
            });
            return i;
        case 'call':
            i = foldExpr(expr.target, i, v);
            expr.args.forEach((arg) => {
                i = foldExpr(arg, i, v);
            });
            return i;
        case 'uop':
        case 'attribute':
            i = foldExpr(expr.target, i, v);
            return i;
        case 'index':
            i = foldExpr(expr.target, i, v);
            expr.items.forEach((item) => {
                i = foldExpr(item, i, v);
            });
            return i;
        case 'fn':
            expr.args.forEach((pat) => {
                i = foldPat(pat, i, v);
            });
            expr.body.forEach((stmt) => {
                i = foldStmt(stmt, i, v);
            });
            return i;
        case 'if':
            i = foldExpr(expr.cond, i, v);
            expr.yes.forEach((stmt) => {
                i = foldStmt(stmt, i, v);
            });
            expr.no?.forEach((stmt) => {
                i = foldStmt(stmt, i, v);
            });
            return i;
        case 'case':
            i = foldExpr(expr.target, i, v);
            expr.cases.forEach((kase) => {
                i = foldPat(kase.pat, i, v);
                if (Array.isArray(kase.body)) {
                    kase.body.forEach((stmt) => {
                        i = foldStmt(stmt, i, v);
                    });
                } else {
                    i = foldExpr(kase.body, i, v);
                }
            });
            return i;
        case 'record':
            expr.rows.forEach((row) => {
                if (row.type === 'single') {
                    i = foldExpr(row.inner, i, v);
                } else {
                    i = foldExpr(row.value, i, v);
                }
            });
        default:
            return i;
    }
};

type Fn = { type: 'fn'; args: Pat[]; body: Stmt[]; src: Src };
type Fancy =
    | Fn
    | { type: 'new'; target: Expr; src: Src }
    | { type: 'await'; target: Expr; src: Src }
    | { type: 'if'; cond: Expr; yes: Stmt[]; no?: Stmt[]; src: Src }
    | { type: 'case'; target: Expr; cases: { pat: Pat; body: Stmt[] | Expr }[]; src: Src };

type ESmoosh = { type: 'smooshed'; prefixes: Id<Loc>[]; base: Expr; suffixes: Suffix[]; src: Src };

type Suffix =
    | { type: 'index'; items: SExpr[]; src: Src }
    | { type: 'call'; items: SExpr[]; src: Src }
    | { type: 'attribute'; attribute: Id<Loc>; src: Src };
type RecordRow = { type: 'single'; inner: SExpr } | { type: 'row'; key: Id<Loc>; value: Expr };
type Stmt =
    | { type: 'expr'; expr: Expr; src: Src }
    | { type: 'throw'; target: Expr; src: Src }
    | { type: 'return'; value?: Expr; src: Src }
    | { type: 'for'; init: Expr | Blank; cond: Expr | Blank; update: Expr | Blank; src: Src; body: Stmt[] }
    | { type: 'let'; pat: Pat; value: Expr; src: Src };

type Blank = { type: 'blank'; src: Src };

const binned_ = mref<Expr>('binned');
const fancy_ = mref<Expr>('fancy');

const fancy = switch_<Expr, Expr>(
    [
        sequence<Fancy, Fancy>(
            [
                meta(
                    'kwd',
                    kwd('new', () => ({ type: 'new' })),
                ),
                named('target', fancy_),
            ],
            false,
            (v, node) => ({ ...v, src: nodesSrc(node) }),
        ),
        sequence<Fancy, Fancy>(
            [
                meta(
                    'kwd',
                    kwd('await', () => ({ type: 'await' })),
                ),
                named('target', fancy_),
            ],
            false,
            (v, node) => ({ ...v, src: nodesSrc(node) }),
        ),
        sequence<Fn, Fn>(
            [named('args', list('round', multi(pat_, true, idt), idt)), kwd('=>', () => null), named('body', block)],
            false,
            (data, node) => ({ ...data, type: 'fn', src: nodesSrc(node) }),
        ),
        sequence<Fancy, Fancy>(
            [
                meta(
                    'kwd',
                    kwd('if', () => ({ type: 'if' })),
                ),
                named('cond', binned_),
                named('yes', block),
                opt(
                    sequence<Partial<Fancy>, Partial<Fancy>>(
                        [
                            meta(
                                'kwd',
                                kwd('else', () => null),
                            ),
                            named('no', block),
                        ],
                        false,
                        idt,
                    ),
                    idt,
                ),
            ],
            false,
            (f, nodes) => ({ ...f, src: nodesSrc(nodes) }),
        ),
        sequence<Fancy, Fancy>(
            [
                meta(
                    'kwd',
                    kwd('case', () => ({ type: 'case' })),
                ),
                named('target', binned_),
                named(
                    'cases',
                    table(
                        'curly',
                        sequence([named('pat', pat_), named('body', switch_<Expr | Stmt[], Expr | Stmt[]>([block, expr_], idt))], true, idt),
                        idt,
                    ),
                ),
            ],
            false,
            (f, nodes) => ({ ...f, src: nodesSrc(nodes) }),
        ),
        expr_,
    ],
    idt,
);

const unops = ['+', '-', '!', '~'];

const _exmoosh: Matcher<Omit<ESmoosh, 'type'>>[] = [
    named(
        'prefixes',
        multi(
            meta(
                'uop',
                switch_(
                    unops.map((n) => kwd(n, idt)),
                    idt,
                ),
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
                    sequence<Suffix>(
                        [
                            meta(
                                'punct',
                                kwd('.', () => ({ type: 'attribute' })),
                            ),
                            named('attribute', id('attribute', idt)),
                        ],
                        false,
                        idt,
                    ),
                    list<0, SExpr[], Suffix>('square', multi(sprexpr_, true), (items, node) => ({ type: 'index', items, src: nodesSrc(node) })),
                    list<0, SExpr[], Suffix>('round', multi(sprexpr_, true), (items, node) => ({ type: 'call', items, src: nodesSrc(node) })),
                ],
                idt,
            ),
            true,
        ),
    ),
];

type Smoosh = {
    base: Expr;
    suffixes: Suffix[];
    prefixes: Id<Loc>[];
};

const parseSmoosh = ({ base, suffixes, prefixes }: Smoosh, node: RecNode): Expr => {
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
        }
    });
    for (let i = prefixes.length - 1; i >= 0; i--) {
        base = { type: 'uop', op: prefixes[i], target: base, src: mergeSrc(nodesSrc(prefixes[i]), base.src) };
    }
    return base;
};

const mergeSrc = (one: Src, two?: Src): Src => ({ left: one.left, right: two?.right ?? two?.left ?? one.right });

const _nosexpr: Matcher<Expr> = list('smooshed', sequence<Smoosh>(_exmoosh, true, idt), (data, node) => parseSmoosh(data, node));

const _sprood: Matcher<SExpr> = list(
    'smooshed',
    sequence<Omit<ESmoosh, 'type'> & { spread: true | null }>(
        [
            named(
                'spread',
                opt(
                    meta(
                        'punct',
                        kwd('..', () => true),
                    ),
                    idt,
                ),
            ),
            ..._exmoosh,
        ],
        true,
        idt,
    ),
    ({ spread, ...data }, node): SExpr =>
        spread ? { type: 'spread', inner: parseSmoosh(data, node), src: nodesSrc(node) } : parseSmoosh(data, node),
);

export const nodesSrc = (nodes: RecNode | RecNode[]): Src =>
    Array.isArray(nodes)
        ? nodes.length === 1
            ? { left: nodes[0].loc }
            : {
                  left: nodes[0].loc,
                  right: nodes[nodes.length - 1].loc,
              }
        : { left: nodes.loc };

const _expr: Matcher<Expr>[] = [
    id(null, (node) => ({ type: 'var', name: node.text, src: { left: node.loc } })),
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
        (rows, node) => ({ type: 'record', rows, src: { left: node.loc } }),
    ),
    list('round', multi(sprexpr_, true), (items, node) => ({ type: 'tuple', items, src: { left: node.loc } })),
    list('spaced', binned_, idt),
];

export const kwds = ['for', 'return', 'new', 'await', 'throw', 'if', 'case', 'else', 'let', 'const', '=', '..', '.', 'fn'];

const binops = ['<', '>', '<=', '>=', '!=', '==', '+', '-', '*', '/', '^', '%'];
const precedence = [['!=', '=='], ['>', '<', '>=', '<='], ['%'], ['+', '-'], ['*', '/'], ['^']];

const opprec: Record<string, number> = {};
precedence.forEach((row, i) => {
    row.forEach((n) => (opprec[n] = i));
});

type Data = { type: 'tmp'; left: Expr | Data; op: Id<Loc>; prec: number; right: Expr | Data };

const add = (data: Data | Expr, op: Id<Loc>, right: Expr): Data => {
    const prec = opprec[op.text];
    if (data.type !== 'tmp' || prec <= data.prec) {
        return { type: 'tmp', left: data, op, prec, right };
    } else {
        return { ...data, right: add(data.right, op, right) };
    }
};

const dataToExpr = (data: Data | Expr): Expr => {
    if (data.type !== 'tmp') return data;
    const left = dataToExpr(data.left);
    const right = dataToExpr(data.right);
    return {
        type: 'call',
        target: { type: 'var', name: data.op.text, src: nodesSrc(data.op) },
        args: [left, right],
        src: mergeSrc(left.src, right.src),
    };
};

// This is probably the same algorithm as the simple precedence parser
// https://en.wikipedia.org/wiki/Simple_precedence_parser
const partition = (left: Expr, rights: { op: Id<Loc>; right: Expr }[]) => {
    let data: Data | Expr = left;
    rights.forEach(({ op, right }) => {
        data = add(data, op, right);
    });
    return dataToExpr(data);
};

export const matchers = {
    expr: switch_([..._expr, _nosexpr], idt),
    sprexpr: switch_([..._expr, _sprood], idt), // expr with spreads,
    pat: switch_(_pat, idt),
    sprpat: switch_(_spat, idt),
    type: switch_<Type>([id(null, (node) => ({ type: 'ref', name: node.text, src: nodesSrc(node) }))], idt),
    stmt: switch_<Stmt, Stmt>(
        [
            list(
                'spaced',
                sequence<Stmt, Stmt>(
                    [
                        meta(
                            'kwd',
                            kwd<Partial<Stmt>>('for', () => ({ type: 'for' })),
                        ),
                        list('round', sequence<any, any>([named('init', stmt_), named('cond', expr_), named('update', expr_)], true, idt), idt),
                        named('body', block),
                    ],
                    false,
                    (v, node) => ({ ...v, src: nodesSrc(node) }),
                ),
                idt,
            ),
            list(
                'spaced',
                sequence<Stmt, Stmt>(
                    [
                        meta(
                            'kwd',
                            kwd<Partial<Stmt>>('throw', () => ({ type: 'throw' })),
                        ),
                        named('target', fancy_),
                    ],
                    false,
                    (v, node) => ({ ...v, src: nodesSrc(node) }),
                ),
                idt,
            ),
            list(
                'spaced',
                sequence<Stmt, Stmt>(
                    [
                        meta(
                            'kwd',
                            kwd<Partial<Stmt>>('return', () => ({ type: 'return' })),
                        ),
                        named('value', fancy_),
                    ],
                    false,
                    (v, node) => ({ ...v, src: nodesSrc(node) }),
                ),
                idt,
            ),
            list(
                'spaced',
                sequence<Stmt, Stmt>(
                    [
                        meta(
                            'kwd',
                            switch_(
                                [
                                    //
                                    kwd<Partial<Stmt>>('let', () => ({ type: 'let' })),
                                    kwd<Partial<Stmt>>('const', () => ({ type: 'let' })),
                                ],
                                idt,
                            ),
                        ),
                        named('pat', pat_),
                        meta(
                            'punct',
                            kwd('=', () => null),
                        ),
                        named('value', binned_),
                    ],
                    true,
                    idt,
                ),
                (res, node) => ({ ...res, src: nodesSrc(node) }),
            ),
            tx(expr_, (expr) => ({ type: 'expr', expr, src: expr.src })),
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
                                meta(
                                    'bop',
                                    switch_(
                                        binops.map((n) => kwd(n, idt)),
                                        idt,
                                    ),
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
        ({ left, rights }): Expr => {
            return rights.length ? partition(left, rights) : left;
        },
    ),
    fancy,
};

export const ctx = (): Ctx => ({
    matchers,
    kwds,
    comment: meta('comment', list('smooshed', sequence<any>([kwd('//', () => ({ type: 'comment' })), multi(any(idt), true, idt)], true, idt), idt)),
    meta: {},
});
