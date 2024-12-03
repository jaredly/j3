import { Src } from '../keyboard/handleShiftNav';
import { Id, Loc, RecNode, TextSpan } from '../shared/cnodes';
import { any, Ctx, id, idp, idt, kwd, list, Matcher, meta, mref, multi, named, opt, sequence, switch_, table, text, tx } from './dsl';
import { XML } from './xml';

const pat_ = mref<Pat>('pat');
const sprpat_ = mref<SPat>('sprpat');

// Should all matcher be ... records?
// in order?
// that would be ... interesting.

const _pat: Matcher<Pat>[] = [
    id(null, (node) => ({ type: 'bound', name: node.text, src: nodesSrc(node) })),
    list('square', multi(sprpat_, true, idt), (values, node) => ({ type: 'array', values, src: nodesSrc(node) })),
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
                    kwd('..', () => ({})),
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
const sprexpr_ = mref<SExpr>('sprexpr');

// type Shown = {left:}

type PSpread = { type: 'spread'; inner: Pat; src: Src };
type SPat = Pat | PSpread;
type Pat =
    | { type: 'bound'; name: string; src: Src }
    | { type: 'array'; values: SPat[]; src: Src }
    | PCon
    | { type: 'text'; spans: TextSpan<Pat>[]; src: Src };
type PCon = { type: 'constr'; constr: Id<Loc>; args: Pat[]; src: Src };

type SExpr = Expr | { type: 'spread'; inner: Expr; src: Src };
type Expr =
    | { type: 'local'; name: string; src: Src }
    | { type: 'global'; id: Id<Loc>; src: Src }
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
    });
    return spans;
};

export const foldPat = <T>(pat: SPat, i: T, v: Visitor<T>): T => {
    i = v.pat(pat, i);
    switch (pat.type) {
        case 'array':
            pat.values.forEach((item) => {
                i = foldPat(item, i, v);
            });
            return i;
        case 'bound':
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
        case 'let':
            i = foldPat(stmt.pat, i, v);
            return foldExpr(stmt.value, i, v);
    }
};

export const foldExpr = <T>(expr: SExpr, i: T, v: Visitor<T>): T => {
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
    | { type: 'if'; cond: Expr; yes: Stmt[]; no?: Stmt[]; src: Src }
    | { type: 'case'; target: Expr; cases: { pat: Pat; body: Stmt[] | Expr }[]; src: Src };

type ESmoosh = { type: 'smooshed'; prefixes: Id<Loc>[]; base: Expr; suffixes: Suffix[]; src: Src };

type Suffix =
    | { type: 'index'; items: SExpr[]; src: Src }
    | { type: 'call'; items: SExpr[]; src: Src }
    | { type: 'attribute'; attribute: Id<Loc>; src: Src };
type RecordRow = { type: 'single'; inner: SExpr } | { type: 'row'; key: Id<Loc>; value: Expr };
type Stmt = { type: 'expr'; expr: Expr; src: Src } | { type: 'let'; pat: Pat; value: Expr; src: Src };

const aToXML = (v: any, name?: string): XML | XML[] | null => {
    if (Array.isArray(v)) {
        const sub = v.map((n) => aToXML(n, name));
        if (sub.every(Boolean)) {
            return sub as XML[];
        }
        return null;
    }
    if (!v || typeof v !== 'object') {
        return null;
    }
    if (Object.keys(v).length === 0) return null;
    const attrs: XML['attrs'] = {};
    const children: XML['children'] = {};
    Object.keys(v).forEach((k) => {
        if (k === 'type' || k === 'src') return;
        // if (k === 'type') return;
        const res = aToXML(v[k], k);
        if (res === null || k === 'src') attrs[k] = v[k];
        else children[k] = res;
    });
    const res: XML = { tag: v.type ?? name ?? '?', src: v.src };
    if (Object.keys(attrs).length) res.attrs = attrs;
    if (Object.keys(children).length) res.children = children;
    return res;
};

export const toXML = (v: any) => {
    const res = aToXML(v);
    if (!res || Array.isArray(res)) {
        console.log(v, res);
        throw new Error('why not');
    }
    return res;
};

const binned_ = mref<Expr>('binned');

const fancy = switch_<Expr, Expr>(
    [
        sequence<Fn, Fn>(
            [
                list(
                    'smooshed',
                    sequence<Fn, Fn>(
                        [
                            meta(
                                'kwd',
                                kwd('fn', () => ({ type: 'fn' })),
                            ),
                            named('args', list('round', multi(pat_, true, idt), idt)),
                        ],
                        true,
                        idt,
                    ),
                    idt,
                ),
                named('body', block),
            ],
            false,
            (data, node) => ({ ...data, src: nodesSrc(node) }),
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
        (rows, node) => ({ type: 'record', rows, src: { left: node.loc } }),
    ),
    list('round', multi(sprexpr_, true), (items, node) => ({ type: 'tuple', items, src: { left: node.loc } })),
    list('spaced', binned_, idt),
];

export const kwds = ['if', 'case', 'else', 'let', '=', '..', '.', 'fn'];

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
        target: { type: 'local', name: data.op.text, src: nodesSrc(data.op) },
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
    stmt: switch_<Stmt, Stmt>(
        [
            list(
                'spaced',
                sequence<Stmt, Stmt>(
                    [
                        meta(
                            'kwd',
                            kwd('let', () => ({ type: 'let' })),
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
};

export const ctx = (): Ctx => ({
    matchers,
    kwds,
    comment: meta('comment', list('smooshed', sequence<any>([kwd('//', () => ({ type: 'comment' })), multi(any(idt), true, idt)], true, idt), idt)),
    meta: {},
});
