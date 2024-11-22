import { Id, ListKind, Loc, RecNode, TableKind, TextSpan } from '../shared/cnodes';

// So, we need to provide a 'list of kwds' to be able to reject them from the `id` matcher

export type Matcher<Res> =
    | { type: 'id'; kind: string | null; f: (v: Id<Loc>) => Res } // if kind is provided, this is a toplevel ref
    | { type: 'kwd'; text: string; f: (v: string) => Res }
    | { type: 'text'; embeds: Matcher<any>; f: (v: TextSpan<any>[]) => Res }
    | { type: 'tx'; inner: Matcher<any>; f: (v: any) => Res }
    | { type: 'named'; name: string; inner: Matcher<any> } // turns a single into a multi, and a multi into a multi
    // | { type: 'add'; name: string; value: any; inner: Matcher }
    | {
          // What's our skip behavior?
          // maybe like 'off by 1 is allowed'?
          // so first we try to skip the offending node,
          // then we try to take a mulligan on the matcher?
          // maybe that's too complex, and for sequence we should
          // just play it straight for now
          type: 'sequence';
          items: Matcher<any>[];
          all?: boolean;
          f: (v: any) => Res;
      }
    | { type: 'multi'; item: Matcher<any>; all?: boolean; f: (v: any[]) => Res }
    | { type: 'list'; kind: ListKind<Matcher<any>>; children: Matcher<any>; f: (v: any) => Res }
    | { type: 'opt'; inner: Matcher<any>; f: (v: any | null) => Res }
    | { type: 'table'; kind: TableKind; row: Matcher<any>; f: (v: any) => Res }
    | { type: 'switch'; choices: Matcher<any>[]; f: (v: any) => Res }
    | { type: 'mref'; id: string };
//; f: (v: any) => any }
// | { type: 'kswitch'; choices: Record<string, Matcher>; f: (v: any) => any };

type Bag<T> = T | Bag<T>[];

const bagSize = (bag: Bag<unknown>): number => (Array.isArray(bag) ? bag.reduce((c, b) => c + bagSize(b), 0) : 1);

type MatchError = { type: 'mismatch' | 'extra'; matcher: Matcher<any>; node: RecNode } | { type: 'missing'; matcher: Matcher<any> };
type Data = { type: 'single'; value: any } | { type: 'named'; value: Record<string, any> };
type MatchRes<T> = { result: null | { data: T; consumed: number }; good: Bag<RecNode>; bad: Bag<MatchError> };

const single = (value: any): Data => ({ type: 'single', value });
const ndata = (name: string, value: any): Data => ({ type: 'named', value: { [name]: value } });

const fail = (matcher: Matcher<any>, node: RecNode): MatchRes<any> => ({ result: null, good: [], bad: [{ type: 'mismatch', matcher, node }] });
const one = <T>(data: T, node: RecNode, good: Bag<RecNode> = [], bad: Bag<MatchError> = []): MatchRes<T> => ({
    result: { data, consumed: 1 },
    good: [node, good],
    bad,
});

type Ctx = { matchers: Record<string, Matcher<any>>; kwds: string[] };

/** We need to:
 * - respond with data (& # consumed) OR indicate failure
 * - indicate ... the farthest we got? or at least a record of all Locs sucessfully processed
 * - indicate any errors, ideally in a structured fashion
 */
const match = <T>(matcher: Matcher<T>, ctx: Ctx, nodes: RecNode[], at: number): MatchRes<T> => {
    const good: Bag<RecNode> = [];
    const bad: Bag<MatchError> = [];

    // First, let's handle matchers that can handle out of scope
    switch (matcher.type) {
        case 'named': {
            const res = match(matcher.inner, ctx, nodes, at);
            return {
                ...res,
                result: res.result ? { data: { [matcher.name]: res.result.data } as T, consumed: res.result.consumed } : null,
            };
        }
        case 'sequence': {
            const init = at;
            let value: Record<string, any> = {};
            for (let i = 0; i < matcher.items.length; i++) {
                const res = match(matcher.items[i], ctx, nodes, at);
                good.push(res.good);
                bad.push(res.bad);
                if (!res.result) return { result: null, bad, good }; // TODO: recovery pls? or something. like, try the next node?
                at += res.result.consumed;
                if (!res.result.data || typeof res.result.data !== 'object') {
                    continue;
                }
                Object.assign(value, res.result.data);
            }
            if (matcher.all) {
                for (; at < nodes.length; at++) {
                    bad.push({ type: 'extra', node: nodes[at], matcher });
                }
            }
            return { result: { data: value as T, consumed: at - init }, good, bad };
        }
        case 'multi': {
            const init = at;
            let value: any[] = [];
            while (at < nodes.length) {
                const res = match(matcher.item, ctx, nodes, at);
                if (!res.result) {
                    if (matcher.all) {
                        bad.push(res.bad);
                        good.push(res.good);
                        at++;
                        continue;
                    }
                    break;
                }
                if (!res.result.consumed) throw new Error(`multi must consume`);
                at += res.result.consumed;
                value.push(res.result.data);
                good.push(res.good);
                bad.push(res.bad);
            }
            return { result: { data: value as T, consumed: at - init }, good, bad };
        }
        case 'opt': {
            const res = match(matcher.inner, ctx, nodes, at);
            return { ...res, result: res.result ?? { consumed: 0, data: null } };
        }
        case 'switch': {
            // Here's where we ... judge them?
            const misses: { good: Bag<RecNode>; bad: Bag<MatchError>; goods: number }[] = [];
            for (let choice of matcher.choices) {
                const res = match(choice, ctx, nodes, at);
                if (res.result) return res;
                misses.push({ good: res.good, bad: res.bad, goods: bagSize(res.good) });
            }
            misses.sort((a, b) => b.goods - a.goods);
            return { result: null, good: misses[0].good, bad: misses[0].bad };
        }
    }

    if (at >= nodes.length) {
        return { good: [], bad: { type: 'missing', matcher }, result: null };
    }

    // Then, we'll do "just one" matchers
    const node = nodes[at];
    switch (matcher.type) {
        case 'mref':
            return match(ctx.matchers[matcher.id], ctx, nodes, at);
        case 'tx': {
            const res = match(matcher.inner, ctx, nodes, at);
            return { ...res, result: res.result ? { ...res.result, data: matcher.f(res.result.data) } : null };
        }
        case 'id':
            if (node.type !== 'id') return fail(matcher, node);
            if (matcher.kind == null && !node.ref && !ctx.kwds.includes(node.text)) {
                return one(matcher.f(node), node);
            } else if (node.ref?.type === 'toplevel' && node.ref.kind === matcher.kind) {
                return one(matcher.f(node), node);
            }
            return fail(matcher, node);
        case 'kwd':
            if (node.type !== 'id' || node.ref) return fail(matcher, node);
            return one(matcher.f(node.text), node);
        case 'text':
            if (node.type !== 'text') return fail(matcher, node);
            const items: TextSpan<any>[] = [];
            node.spans.forEach((span) => {
                switch (span.type) {
                    case 'embed':
                        const res = match(matcher.embeds, ctx, [span.item], 0);
                        good.push(res.good);
                        bad.push(res.bad);
                        if (res.result) {
                            items.push({ ...span, item: res.result.data.value });
                        }
                        return;
                    default:
                        items.push(span);
                }
            });
            return one(matcher.f(items), node, good, bad);
        case 'list':
            if (node.type !== 'list' || node.kind !== matcher.kind) return fail(matcher, node);
            const inner = match(matcher.children, ctx, node.children, 0);
            return { ...inner, result: inner.result ? { data: matcher.f(inner.result.data), consumed: 1 } : null };
        case 'table': {
            if (node.type !== 'table' || node.kind !== matcher.kind) return fail(matcher, node);
            const rows = [];
            for (let row of node.rows) {
                const inner = match(matcher.row, ctx, row, 0);
                good.push(inner.good);
                bad.push(inner.bad);
                if (inner.result) {
                    rows.push(inner.result.data.value);
                }
            }
            return { good, bad, result: { consumed: 1, data: matcher.f(rows) } };
        }
    }
};

// So
// I feel like it would be harder to construct the right type of the output
// using the types (values) version, as opposed to the functions (combinators) version
// why is that? do we need GADTs to make it work? 🤔

const id = <T>(kind: string | null, f: (v: Id<Loc>) => T): Matcher<T> => ({ type: 'id', kind, f });
const kwd = <T>(text: string, f: (v: string) => T): Matcher<T> => ({ type: 'kwd', text, f });
const text = <E, T>(embeds: Matcher<E>, f: (v: TextSpan<E>[]) => T): Matcher<T> => ({ type: 'text', embeds, f });
// const add = (name: string, value: any, inner: Matcher): Matcher => ({ type: 'add', name, value, inner });
const sequence = <T, R = T>(items: Matcher<Partial<T> | null>[], all: boolean, f: (v: T) => R): Matcher<R> => ({ type: 'sequence', items, all, f });
const multi = <T, R = T[]>(item: Matcher<T>, all: boolean, f: (v: T[]) => R = (v) => v as R): Matcher<R> => ({ type: 'multi', item, all, f });
const list = <K, I, O>(kind: ListKind<Matcher<K>>, children: Matcher<I>, f: (v: I) => O): Matcher<O> => ({ type: 'list', kind, children, f });
const opt = <T, R>(inner: Matcher<T>, f: (v: T | null) => R): Matcher<R> => ({ type: 'opt', inner, f });
const table = <I, R>(kind: TableKind, row: Matcher<I>, f: (v: I[]) => R): Matcher<R> => ({ type: 'table', kind, row, f });
const switch_ = <C, R = C>(choices: Matcher<C>[], f: (v: C) => R): Matcher<R> => ({ type: 'switch', choices, f });
const mref = <R>(id: string): Matcher<R> => ({ type: 'mref', id });
const named = <A, N extends string, R = Record<N, A>>(name: N, inner: Matcher<A>): Matcher<R> => ({ type: 'named', name, inner });
const tx = <A, B>(inner: Matcher<A>, f: (a: A) => B): Matcher<B> => ({ type: 'tx', inner, f });

const pat_ = mref<Pat>('pat');
const sprpat_ = mref<SPat>('sprpat');

// Should all matcher be ... records?
// in order?
// that would be ... interesting.

const idt = <T>(x: T): T => x;
const idp = <T>(x: Partial<T>): T => x as T;

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

export const pat = switch_(_pat, idt);
export const sprpat = switch_(_spat, idt);

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
    | { type: 'record'; rows: RecordRow[] };
type ESmoosh = { type: 'smooshed'; prefixes: Id<Loc>[]; base: Expr; suffixes: Suffix[] };

type Suffix = { type: 'index'; items: SExpr } | { type: 'call'; items: SExpr } | { type: 'attribute'; attribute: Id<Loc> };
type RecordRow = { type: 'single'; inner: SExpr } | { type: 'row'; key: Id<Loc>; value: Expr };
type Stmt = { type: 'expr'; expr: Expr } | { type: 'let'; pat: Pat; value: Expr };

const binned_ = mref<Binned>('binned');

type Binned = { type: 'binned'; left: Expr; rights: { op: Id<Loc>; right: Expr }[] };
type Fancy = { type: 'if'; cond: Expr; yes: Stmt[]; no: Stmt[] } | { type: 'case'; target: Expr; cases: { pat: Pat; body: Expr }[] };

const fancy = switch_<Fancy, Fancy>(
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
    ],
    idt,
);

// const binops = ['<', '>', '<=', '>=', '!=', '==', '+', '-', '*', '/', '^', '%'];
const binned: Matcher<Expr> = sequence<{ left: Expr; rights: { op: Id<Loc>; right: Expr }[] }, Expr>(
    [named('left', fancy), named('rights', multi(sequence([named('op', id('binop', idt)), named('right', fancy)], false, idt), false, idt))],
    false,
    ({ left, rights }): Expr => {
        return rights.length ? { type: 'bops', left, rights } : left;
    },
);

const _exmoosh: Matcher<Omit<ESmoosh, 'type'>>[] = [
    named('prefixes', multi(id('unop', idt), false, idt)),
    named('base', expr_),
    named(
        'suffixes',
        multi(
            switch_(
                [
                    sequence<Suffix>([kwd('.', () => null), named('attr', id('attribute', idt))], false, idt),
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
    list('spaced', binned, idt),
];

export const expr = switch_([..._expr, _nosexpr], idt);
export const sprexpr = switch_([..._expr, _sprood], idt); // expr with spreads
