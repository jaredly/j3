import { Id, Loc, TextSpan, ListKind, TableKind, RecNode, Style, Node } from '../shared/cnodes';

// So, we need to provide a 'list of kwds' to be able to reject them from the `id` matcher

export type Matcher<Res> =
    | { type: 'any'; f: (v: RecNode) => Res }
    | { type: 'id'; kind: string | null; f: (v: Id<Loc>) => Res } // if kind is provided, this is a toplevel ref
    | { type: 'kwd'; text: string; f: (v: Id<Loc>) => Res }
    | { type: 'text'; embeds: Matcher<any>; f: (v: TextSpan<any>[], node: RecNode) => Res }
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
          f: (v: any, nodes: RecNode[]) => Res;
      }
    | { type: 'multi'; item: Matcher<any>; all?: boolean; f: (v: any[], nodes: RecNode[]) => Res }
    | { type: 'list'; kind: ListKind<Matcher<any>>; children: Matcher<any>; f: (v: any, node: RecNode) => Res }
    | { type: 'opt'; inner: Matcher<any>; f: (v: any | null) => Res }
    | { type: 'table'; kind: TableKind; row: Matcher<any>; f: (v: any, node: RecNode) => Res }
    | { type: 'switch'; choices: Matcher<any>[]; f: (v: any) => Res }
    | { type: 'meta'; inner: Matcher<Res>; kind: string }
    | { type: 'mref'; id: string };
//; f: (v: any) => any }
// | { type: 'kswitch'; choices: Record<string, Matcher>; f: (v: any) => any };
export const show = (matcher: Matcher<any>): string => {
    switch (matcher.type) {
        case 'named':
            return `Named(${matcher.name})`;
        case 'id':
            return matcher.kind ? `Id(${matcher.kind})` : `Id`;
        case 'kwd':
            return `Kwd(${matcher.text})`;
        case 'sequence':
            return `Seq(${matcher.items.map(show).join(', ')})`;
        case 'multi':
            return `Multi(${show(matcher.item)})`;
        case 'list':
            return `List(${matcher.kind}, ${show(matcher.children)})`;
        case 'opt':
            return `Opt(${show(matcher.inner)})`;
        case 'mref':
            return `Ref(${matcher.id})`;
        default:
            return matcher.type;
    }
};
type Bag<T> = T | Bag<T>[];
const bagSize = (bag: Bag<unknown>): number => (Array.isArray(bag) ? bag.reduce((c, b) => c + bagSize(b), 0) : 1);
export const foldBag = <T, R>(i: R, bag: Bag<T>, f: (i: R, v: T) => R): R => {
    if (Array.isArray(bag)) {
        return bag.reduce((i, b) => foldBag(i, b, f), i);
    }
    return f(i, bag);
};

export type MatchError =
    | { type: 'mismatch' | 'extra'; matcher: Matcher<any>; node: RecNode }
    | {
          type: 'missing';
          matcher: Matcher<any>;
          at: number;
          parent: Loc;
          sub: MatchParent['sub'];
      };
type Data = { type: 'single'; value: any } | { type: 'named'; value: Record<string, any> };
type MatchRes<T> = { result: null | { data: T; consumed: number }; good: Bag<RecNode>; bad: Bag<MatchError> };
// const single = (value: any): Data => ({ type: 'single', value });
// const ndata = (name: string, value: any): Data => ({ type: 'named', value: { [name]: value } });
const fail = (matcher: Matcher<any>, node: RecNode): MatchRes<any> => ({
    result: null,
    good: [],
    bad: [{ type: 'mismatch', matcher, node }],
});
const one = <T>(data: T, node: RecNode, good: Bag<RecNode> = [], bad: Bag<MatchError> = []): MatchRes<T> => ({
    result: { data, consumed: 1 },
    good: [node, good],
    bad,
});

export type Ctx = {
    matchers: Record<string, Matcher<any>>;
    kwds: string[];
    comment?: Matcher<any>;
    strictIds?: boolean;
    meta: Record<number, { kind?: string; placeholder?: string }>;
};

/** We need to:
 * - respond with data (& # consumed) OR indicate failure
 * - indicate ... the farthest we got? or at least a record of all Locs sucessfully processed
 * - indicate any errors, ideally in a structured fashion
 */
const white = (n: number) => Array(n).join('| ');
let indent = 0;

export type MatchParent = { nodes: RecNode[]; loc: Loc; sub?: { type: 'text'; index: number } | { type: 'table'; row: number } };

export const match = <T>(matcher: Matcher<T>, ctx: Ctx, parent: MatchParent, at: number, endOfExhaustive?: boolean): MatchRes<T> => {
    // console.log(white(indent), 'enter', show(matcher));
    // indent++;
    const res = match_(matcher, ctx, parent, at, endOfExhaustive);
    // if (res.result && res.result.consumed) {
    //     // ctx.spans.push([parent.nodes[at].loc, parent.nodes[at + res.result.consumed - 1].loc]);
    //     const span = { start: parent.nodes[at].loc, end: res.result.consumed > 1 ? parent.nodes[at + res.result.consumed - 1].loc : undefined };
    //     res.spans = res.spans ? [res.spans, span] : span;
    //     console.log(res.spans);
    // }
    // res.result?.consumed
    // indent--;
    // if (res.result) {
    //     console.log(white(indent), 'match success', show(matcher), res.result.consumed);
    //     if (res.result.consumed) {
    //         console.log(nodes.slice(at, at + res.result.consumed));
    //         console.log(res.result.data);
    //     }
    // } else {
    //     console.log(white(indent), 'match fail', show(matcher));
    // }
    return res;
};

export type Span = { start: Loc; end?: Loc };

const isBlank = (node: RecNode) => node.type === 'id' && node.text === '';

export const match_ = <T>(matcher: Matcher<T>, ctx: Ctx, parent: MatchParent, at: number, endOfExhaustive?: boolean): MatchRes<T> => {
    const good: Bag<RecNode> = [];
    const bad: Bag<MatchError> = [];
    const spans: Bag<Span> = [];

    if (!matcher) {
        throw new Error('no matcher');
    }

    // ah need to know if we're in a comment matcher right now folkx
    if (ctx.comment) {
        while (true) {
            const res = match(ctx.comment, { ...ctx, comment: undefined }, parent, at, endOfExhaustive);
            if (res.result?.consumed) {
                at += res.result.consumed;
            } else {
                break;
            }
        }
    }

    // First, let's handle matchers that can handle out of scope
    switch (matcher.type) {
        case 'named': {
            if (at < parent.nodes.length && isBlank(parent.nodes[at])) {
                const loc = parent.nodes[at].loc[0].idx;
                if (!ctx.meta[loc]) ctx.meta[loc] = { placeholder: matcher.name };
            }
            const res = match(matcher.inner, ctx, parent, at, endOfExhaustive);
            return {
                ...res,
                result: res.result ? { data: { [matcher.name]: res.result.data } as T, consumed: res.result.consumed } : null,
            };
        }
        case 'meta': {
            const res = match(matcher.inner, ctx, parent, at, endOfExhaustive);
            if (res.result) {
                for (let i = 0; i < res.result.consumed; i++) {
                    const node = parent.nodes[at + i];
                    if (node.loc.length === 1) {
                        // TODO merge somehow idk
                        ctx.meta[node.loc[0].idx] = { kind: matcher.kind };
                    }
                }
            }
            return res;
        }
        case 'sequence': {
            const init = at;
            let value: Record<string, any> = {};
            for (let i = 0; i < matcher.items.length; i++) {
                const res = match(matcher.items[i], ctx, parent, at, i === matcher.items.length - 1 && (matcher.all || endOfExhaustive));
                // console.log('iinnner', nodes[at], matcher.items[i].type, res.good);
                good.push(res.good);
                bad.push(res.bad);
                if (!res.result) return { result: null, bad, good }; // TODO: recovery pls? or something. like, try the next node?
                at += res.result.consumed;
                if (!res.result.data || typeof res.result.data !== 'object') {
                    // console.log('nota thing', res.result);
                    continue;
                }
                Object.assign(value, res.result.data);
            }
            if (matcher.all || endOfExhaustive) {
                for (; at < parent.nodes.length; at++) {
                    bad.push({ type: 'extra', node: parent.nodes[at], matcher });
                }
            }
            return { result: { data: matcher.f(value, parent.nodes.slice(init, at)), consumed: at - init }, good, bad };
        }
        case 'multi': {
            const init = at;
            let value: any[] = [];
            while (at < parent.nodes.length) {
                const res = match(matcher.item, ctx, parent, at);
                if (!res.result) {
                    if (matcher.all || endOfExhaustive) {
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
            return { result: { data: matcher.f(value, parent.nodes.slice(init, at)), consumed: at - init }, good, bad };
        }
        case 'opt': {
            const res = match(matcher.inner, ctx, parent, at, endOfExhaustive);
            return res.result
                ? { ...res, result: { ...res.result, data: matcher.f(res.result.data) } }
                : { result: { data: matcher.f(null), consumed: 0 }, good: [], bad: res.bad };
        }
        case 'switch': {
            // Here's where we ... judge them?
            const misses: { good: Bag<RecNode>; bad: Bag<MatchError>; goods: number }[] = [];
            for (let choice of matcher.choices) {
                const res = match(choice, ctx, parent, at, endOfExhaustive);
                if (res.result) {
                    return { ...res, result: { data: matcher.f(res.result.data), consumed: res.result.consumed } };
                }
                misses.push({ good: res.good, bad: res.bad, goods: bagSize(res.good) });
            }
            misses.sort((a, b) => b.goods - a.goods);
            if (!misses[0].goods) {
                return { result: null, good: [], bad: misses.map((m) => m.bad) };
            }
            return { result: null, good: misses[0].good, bad: misses[0].bad };
        }
        case 'mref':
            if (at < parent.nodes.length && isBlank(parent.nodes[at])) {
                const loc = parent.nodes[at].loc[0].idx;
                if (!ctx.meta[loc]) ctx.meta[loc] = { placeholder: matcher.id };
            }
            return match(ctx.matchers[matcher.id], ctx, parent, at, endOfExhaustive);
        case 'tx': {
            const res = match(matcher.inner, ctx, parent, at, endOfExhaustive);
            return { ...res, result: res.result ? { ...res.result, data: matcher.f(res.result.data) } : null };
        }
    }

    if (at >= parent.nodes.length) {
        return { good: [], bad: { type: 'missing', matcher, at, parent: parent.loc, sub: parent.sub }, result: null };
    }

    // Then, we'll do "just one" matchers
    const node = parent.nodes[at];
    switch (matcher.type) {
        case 'any':
            return { result: { data: matcher.f(node), consumed: 1 }, bad: [], good: [] };
        case 'id':
            if (node.type !== 'id' || ctx.kwds.includes(node.text)) return fail(matcher, node);
            // TODO: this is ... so that we'll keep going with placeholders and stuff
            // if (node.text === '') return fail(matcher, node);
            if (!ctx.strictIds) return one(matcher.f(node), node);
            if (matcher.kind == null && !node.ref && !ctx.kwds.includes(node.text)) {
                return one(matcher.f(node), node);
            } else if (node.ref?.type === 'toplevel' && node.ref.kind === matcher.kind) {
                return one(matcher.f(node), node);
            }
            return fail(matcher, node);
        case 'kwd':
            if (node.type !== 'id' || node.ref || node.text !== matcher.text) return fail(matcher, node);
            return one(matcher.f(node), node);
        case 'text':
            if (node.type !== 'text') return fail(matcher, node);
            const items: TextSpan<any>[] = [];
            node.spans.forEach((span, i) => {
                switch (span.type) {
                    case 'embed':
                        const res = match(matcher.embeds, ctx, { nodes: [span.item], loc: node.loc, sub: { type: 'text', index: i } }, 0);
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
            return one(matcher.f(items, node), node, good, bad);
        case 'list':
            if (node.type !== 'list' || node.kind !== matcher.kind) return fail(matcher, node);
            const inner = match(matcher.children, ctx, { nodes: node.children, loc: node.loc }, 0, true);
            return {
                bad: inner.bad,
                good: [inner.good, node],
                result: inner.result ? { data: matcher.f(inner.result.data, node), consumed: 1 } : null,
            };
        case 'table': {
            if (node.type !== 'table' || node.kind !== matcher.kind) return fail(matcher, node);
            const rows = [];
            for (let row = 0; row < node.rows.length; row++) {
                const inner = match(matcher.row, ctx, { nodes: node.rows[row], loc: node.loc, sub: { type: 'table', row } }, 0);
                good.push(inner.good);
                bad.push(inner.bad);
                if (inner.result) {
                    rows.push(inner.result.data.value);
                }
            }
            good.push(node);
            return { good, bad, result: { consumed: 1, data: matcher.f(rows, node) } };
        }
    }
};
// So
// I feel like it would be harder to construct the right type of the output
// using the types (values) version, as opposed to the functions (combinators) version
// why is that? do we need GADTs to make it work? 🤔
export const id = <T>(kind: string | null, f: (v: Id<Loc>) => T): Matcher<T> => ({ type: 'id', kind, f });
export const kwd = <T>(text: string, f: (v: Id<Loc>) => T): Matcher<T> => ({ type: 'kwd', text, f });
export const text = <E, T>(embeds: Matcher<E>, f: (v: TextSpan<E>[], node: RecNode) => T): Matcher<T> => ({ type: 'text', embeds, f });
// const add = (name: string, value: any, inner: Matcher): Matcher => ({ type: 'add', name, value, inner });
export const sequence = <T, R = T>(items: Matcher<Partial<T> | null>[], all: boolean, f: (v: T, nodes: RecNode[]) => R): Matcher<R> => ({
    type: 'sequence',
    items,
    all,
    f,
});
export const multi = <T, R = T[]>(item: Matcher<T>, all: boolean, f: (v: T[], nodes: RecNode[]) => R = (v) => v as R): Matcher<R> => ({
    type: 'multi',
    item,
    all,
    f,
});
export const list = <K, I, O>(kind: ListKind<Matcher<K>>, children: Matcher<I>, f: (v: I, node: RecNode) => O): Matcher<O> => ({
    type: 'list',
    kind,
    children,
    f,
});
export const opt = <T, R>(inner: Matcher<T>, f: (v: T | null) => R): Matcher<R> => ({ type: 'opt', inner, f });
export const table = <I, R>(kind: TableKind, row: Matcher<I>, f: (v: I[], node: RecNode) => R): Matcher<R> => ({ type: 'table', kind, row, f });
export const switch_ = <C, R = C>(choices: Matcher<C>[], f: (v: C) => R): Matcher<R> => ({ type: 'switch', choices, f });
export const mref = <R>(id: string): Matcher<R> => ({ type: 'mref', id });
export const named = <A, N extends string, R = Record<N, A>>(name: N, inner: Matcher<A>): Matcher<R> => ({ type: 'named', name, inner });
export const tx = <A, B>(inner: Matcher<A>, f: (a: A) => B): Matcher<B> => ({ type: 'tx', inner, f });
export const idt = <T>(x: T): T => x;
export const idp = <T>(x: Partial<T>): T => x as T;
export const any = <T>(f: (v: RecNode) => T): Matcher<T> => ({ type: 'any', f });
export const meta = <T>(kind: string, inner: Matcher<T>): Matcher<T> => ({ type: 'meta', inner, kind });

export type ParseResult<T> = {
    result: T | undefined;
    goods: RecNode[];
    bads: MatchError[];
    ctx: Ctx;
};

export const parse = <T>(matcher: Matcher<T>, node: RecNode, ctx: Ctx): ParseResult<T> => {
    const res = match(matcher, ctx, { nodes: [node], loc: [] }, 0, true);
    const goods = foldBag([] as RecNode[], res.good, (ar, n) => (ar.push(n), ar));
    const bads = foldBag([] as MatchError[], res.bad, (ar, n) => ((n.type !== 'missing' ? !goods.includes(n.node) : true) ? (ar.push(n), ar) : ar));
    if (res.result?.consumed === 0) throw new Error('node not consumed');

    return { result: res.result?.data, goods, bads, ctx };
};
