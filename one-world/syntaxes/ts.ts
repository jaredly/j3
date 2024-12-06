import { Src } from '../keyboard/handleShiftNav';
import { Id, Loc, RecNode } from '../shared/cnodes';
import { any, Ctx, id, idp, idt, kwd, list, Matcher, meta, mref, multi, named, opt, sequence, switch_, table, text, tx } from './dsl';
import {
    binops,
    ESmoosh,
    Expr,
    Fancy,
    Fn,
    kwds,
    partition,
    Pat,
    PCon,
    RecordRow,
    SExpr,
    SPat,
    Stmt,
    Suffix,
    suffixops,
    Type,
    unops,
} from './ts-types';

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
const binned_ = mref<Expr>('binned');
const fancy_ = mref<Expr>('fancy');

// Should all matcher be ... records?
// in order?
// that would be ... interesting.

const _pat: Matcher<Pat>[] = [
    // id('constructor', (node) => ({ type: 'constr', constr: node, src: nodesSrc(node), args: [] })),
    // TODO: allow multiple kinds here...
    id(null, (node) => ({ type: 'var', name: node.text, src: nodesSrc(node) })),
    list('square', multi(sprpat_, true, idt), (values, node) => ({ type: 'array', values, src: nodesSrc(node) })),
    list(
        'spaced',
        sequence<Extract<Pat, { type: 'default' }>>(
            [
                //
                named('inner', pat_),
                kwd('=', () => null),
                named('value', binned_),
            ],
            true,
            ({ inner, value }, node) => ({ type: 'default', inner, value, src: nodesSrc(node) }),
        ),
        idt,
    ),
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
            [
                named('args', list('round', multi(pat_, true, idt), idt)),
                kwd('=>', () => null),
                named('body', switch_<Stmt[] | Expr>([block, expr_], idt)),
            ],
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
                    kwd('switch', () => ({ type: 'case' })),
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
                    meta(
                        'uop',
                        switch_<Suffix>(
                            suffixops.map((op) => kwd(op, (node) => ({ type: 'suffix', op: node, src: nodesSrc(node) }))),
                            idt,
                        ),
                    ),
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
            case 'suffix':
                base = { type: 'uop', op: suffix.op, src: mergeSrc(base.src, suffix.src), target: base };
                return;
        }
    });
    for (let i = prefixes.length - 1; i >= 0; i--) {
        base = { type: 'uop', op: prefixes[i], target: base, src: mergeSrc(nodesSrc(prefixes[i]), base.src) };
    }
    return base;
};

export const mergeSrc = (one: Src, two?: Src): Src => ({ left: one.left, right: two?.right ?? two?.left ?? one.right });

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
    id('value', (node) => ({ type: 'var', name: node.text, src: { left: node.loc } })),
    text(sprexpr_, (spans, node) => ({ type: 'text', spans, src: { left: node.loc } })),
    list('square', multi(sprexpr_, true), (items, node) => ({ type: 'array', items, src: { left: node.loc } })),
    table(
        'curly',
        switch_<RecordRow, RecordRow>(
            [
                sequence<RecordRow>([id('attribute', (key) => ({ type: 'row', key })), named('value', expr_)], true, idt),
                tx(sprexpr_, (inner) => ({ type: 'single', inner })),
            ],
            idt,
        ),
        (rows, node) => ({ type: 'record', rows, src: { left: node.loc } }),
    ),
    list('round', multi(sprexpr_, true), (items, node) => ({ type: 'tuple', items, src: { left: node.loc } })),
    list('spaced', binned_, idt),
];

const stmtSpaced: Matcher<Stmt>[] = [
    sequence<Stmt, Stmt>(
        [
            meta(
                'kwd',
                kwd<Partial<Stmt>>('for', () => ({ type: 'for' })),
            ),
            list('round', sequence<any, any>([named('init', stmt_), named('cond', expr_), named('update', expr_)], true, idt), idt),
            named('body', switch_<Stmt[] | Stmt>([block, mref<Stmt>('stmtSpaced')], idt)),
        ],
        true,
        (v, node) => ({ ...v, src: nodesSrc(node) }),
    ),
    // meta('kwd', kwd('break', () => ({type: 'break'}))),
    // meta('kwd', kwd('break', () => ({type: 'continue'}))),
    sequence<Stmt, Stmt>(
        [
            meta(
                'kwd',
                kwd<Partial<Stmt>>('throw', () => ({ type: 'throw' })),
            ),
            named('target', binned_),
        ],
        true,
        (v, node) => ({ ...v, src: nodesSrc(node) }),
    ),
    sequence<Stmt, Stmt>(
        [
            meta(
                'kwd',
                kwd<Partial<Stmt>>('return', () => ({ type: 'return' })),
            ),
            named('value', binned_),
        ],
        true,
        (v, node) => ({ ...v, src: nodesSrc(node) }),
    ),
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
    tx(binned_, (expr) => ({ type: 'expr', expr, src: expr.src })),
];

export const matchers = {
    expr: switch_([..._expr, _nosexpr], idt),
    sprexpr: switch_([..._expr, _sprood], idt), // expr with spreads,
    pat: switch_(_pat, idt),
    sprpat: switch_(_spat, idt),
    type: switch_<Type>([id('type', (node) => ({ type: 'ref', name: node.text, src: nodesSrc(node) }))], idt),
    stmtSpaced: switch_<Stmt, Stmt>(stmtSpaced, idt),
    stmt: switch_<Stmt, Stmt>([list('spaced', switch_(stmtSpaced, idt), idt), tx(expr_, (expr) => ({ type: 'expr', expr, src: expr.src }))], idt),
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

export const ctx = (cursor?: number): Ctx => ({
    matchers,
    kwds,
    comment: meta('comment', list('smooshed', sequence<any>([kwd('//', () => ({ type: 'comment' })), multi(any(idt), true, idt)], true, idt), idt)),
    meta: {},
    autocomplete: cursor ? { loc: cursor, concrete: [], kinds: [] } : undefined,
});
