import { Id, Loc, RecNode, TextSpan } from '../shared/cnodes';
import { mref, Matcher, id, list, multi, idt, sequence, idp, text, kwd, switch_, named, opt, table, tx } from './dsl';
import { textSpanToXML, XML } from './xml';

const pat_ = mref<Pat>('pat');
const sprpat_ = mref<SPat>('sprpat');

// Should all matcher be ... records?
// in order?
// that would be ... interesting.

const _pat: Matcher<Pat>[] = [
    id(null, (node) => ({ type: 'bound' as const, name: node.text, src: nodesSrc(node) })),
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
    list('smooshed', sequence<Pat, Pat>([kwd('..', () => ({})), pat_], true, idt), (inner, node) => ({ type: 'spread', inner, src: nodesSrc(node) })),
];

const block = list('curly', multi(mref<Stmt>('stmt'), true, idt), idt);

const expr_ = mref<Expr>('expr');
const sprexpr_ = mref<SExpr>('sprexpr');

// type Shown = {left:}

export type Src = { left: Loc; right?: Loc };

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
    | { type: 'bops'; left: Expr; rights: { op: Id<Loc>; right: Expr }[]; src: Src }
    // | ESmoosh
    | { type: 'record'; rows: RecordRow[]; src: Src }
    | { type: 'call'; target: Expr; args: SExpr[]; src: Src }
    | { type: 'uop'; op: Id<Loc>; target: Expr; src: Src }
    | { type: 'attribute'; target: Expr; attribute: Id<Loc>; src: Src }
    | { type: 'index'; target: Expr; items: SExpr[]; src: Src }
    | Fancy;
// type ESmoosh = { type: 'smooshed'; prefixes: Id<Loc>[]; base: Expr; suffixes: Suffix[]; src: Src };

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
        const res = aToXML(v[k], k);
        if (res === null) attrs[k] = v[k];
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

type Fancy =
    | { type: 'if'; cond: Expr; yes: Stmt[]; no?: Stmt[]; src: Src }
    | { type: 'case'; target: Expr; cases: { pat: Pat; body: Expr }[]; src: Src };

// export type Visitor = {
//     stmt: (s: Stmt) => void;
//     expr: (e: Expr) => void;
//     pat: (p: Pat) => void;
//     sexpr: (e: SExpr) => void;
// };

// export const visitSExpr = (expr: SExpr, v: Visitor) => {
//     if (expr.type === 'spread') {
//         v.sexpr(expr);
//         visitExpr(expr.inner, v);
//     } else {
//         visitExpr(expr, v);
//     }
// };

// export const visitExpr = (expr: Expr, v: Visitor) => {
//     v.expr(expr);
//     switch (expr.type) {
//         case 'array':
//         case 'tuple':
//             expr.items.forEach((child) => visitSExpr(child, v));
//             break;
//         case 'if':
//             visitExpr(expr.cond, v);
//             expr.yes.forEach((s) => visitStmt(s, v));
//             expr.no?.forEach((s) => visitStmt(s, v));
//             break;
//         case 'local':
//         case 'global':
//             return;
//     }
// };

// export const visitPat = (pat: Pat, v: Visitor) => {
//     v.pat(pat);
// };

// export const visitStmt = (stmt: Stmt, v: Visitor) => {
//     v.stmt(stmt);
//     switch (stmt.type) {
//         case 'expr':
//             return visitExpr(stmt.expr, v);
//         case 'let':
//             visitPat(stmt.pat, v);
//             visitExpr(stmt.value, v);
//             return;
//     }
// };

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
                    sequence<Suffix>([kwd('.', () => ({ type: 'attribute' })), named('attribute', id('attribute', idt))], false, idt),
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
                base = { type: 'attribute', target: base, attribute: suffix.attribute, src: mergeSrc(base.src, suffix.src) };
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

const _nosexpr: Matcher<Expr> = list(
    'smooshed',
    sequence<Smoosh>(_exmoosh, true, idt),
    (data, node) => parseSmoosh(data, node),
    //     {
    //     type: 'smooshed',
    //     ...data,
    //     src: nodesSrc(node),
    // }
);

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
