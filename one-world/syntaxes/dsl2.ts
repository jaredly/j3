import { Src } from '../keyboard/handleShiftNav';
import { Id, Loc, RecNode } from '../shared/cnodes';
import { Bag, Ctx, MatchParent } from './dsl';
import { binops, Expr, partition, Stmt } from './ts-types';

type AutoComplete = string;

export type Matcher<Res> = {
    match: (ctx: Ctx, parent: MatchParent, at: number, endOfExhaustive?: boolean) => MatchRes<Res>;
    complete(): { kinds: (string | null)[]; concrete: AutoComplete[] };
};

export type MatchRes<T> = { result: null | { data: T; consumed: number }; good: Bag<RecNode>; bad: Bag<MatchError> };
export type MatchError =
    | { type: 'mismatch' | 'extra'; matcher: Matcher<any>; node: RecNode }
    | {
          type: 'missing';
          matcher: Matcher<any>;
          at: number;
          parent: Loc;
          sub: MatchParent['sub'];
      };

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

export const id = (kind: string | null): Matcher<Id<Loc>> => {
    const matcher: Matcher<Id<Loc>> = {
        match: (ctx, parent, at) => {
            const node = parent.nodes[at];
            if (!node) return { result: null, good: [], bad: [{ type: 'missing', matcher, parent: parent.loc, at, sub: parent.sub }] };
            if (node.type !== 'id') return fail(matcher, node);
            return one(node, node);
        },
        complete() {
            return { kinds: [kind], concrete: [] };
        },
    };
    return matcher;
};

// export const switch_ = <T>(matchers: Matcher<null | Partial<T>>[]) => {
// }

// dreamcode for a sec

type MRes<T> = (parent: MatchParent, at: number) => { type: 'finished'; result: T; consumed: number } | { type: 'failed' } | MRes<T>;
type Next<T> = <R>(inner: (v: T) => MRes<R>) => MRes<R>;

type Start = { at: number; parent: MatchParent; loc: Loc };

const start =
    <T>(inner: (finish: <I>(f: (src: Src) => I) => MRes<I>) => MRes<T>): MRes<T> =>
    (parent, at) =>
        inner((f) => finish({ parent, at, loc: parent.nodes[at].loc }, f))(parent, at);

const finish =
    <T>(start: Start, f: (src: Src) => T): MRes<T> =>
    (parent: MatchParent, at: number) => {
        const node = parent.nodes[at - 1];
        return { type: 'finished', result: f({ left: start.loc, right: at > start.at ? node.loc : undefined }), consumed: at - start.at };
    };

const kwd =
    <T>(kwd: string, next: (node: Id<Loc>) => MRes<T>): MRes<T> =>
    (parent, at) => {
        const node = parent.nodes[at];
        if (!node || node.type !== 'id' || node.ref || node.text !== kwd) return { type: 'failed' };
        // TODO: iff it's blank, maybe return, like, an 'incomplete'?
        return next(node)(parent, at + 1);
    };
const just =
    <T>(result: T): MRes<T> =>
    (parent, at) => ({ type: 'finished', consumed: 1, result });

const multi =
    <I, T>(inner: MRes<I>, next: (v: I[]) => MRes<T>): MRes<T> =>
    (parent, at) => {
        const values: I[] = [];
        while (at < parent.nodes.length) {
            const v = inner(parent, at);
            if (typeof v === 'function') {
                throw new Error('incomplete?');
            }
            if (v.type === 'failed') {
                break;
            }
            values.push(v.result);
            if (v.consumed === 0) {
                throw new Error(`multi inner must consume`);
            }
            at += v.consumed;
        }
        return next(values)(parent, at);
    };

const switch_ =
    <I>(options: MRes<I>[]) =>
    <T>(next: (v: I) => MRes<T>): MRes<T> =>
    (parent, at) => {
        for (let opt of options) {
            const res = opt(parent, at);
            if (typeof res === 'object' && res.type === 'finished') {
                return next(res.result)(parent, at + res.consumed);
            }
        }
        return { type: 'failed' };
    };

const fancy = switch_<Expr>([
    //
    start((finish) => kwd('new', () => binned((target) => finish((src) => ({ type: 'new', target, src }))))),
]);
const bop = switch_(binops.map((bop) => kwd(bop, just)));

const binned = <R>(next: (v: Expr) => MRes<R>): MRes<R> =>
    fancy((left) =>
        multi<{ op: Id<Loc>; right: Expr }, R>(
            start((finish) => bop((op) => fancy((right) => finish((src) => ({ op, right }))))),
            (rights) => next(rights.length ? partition(left, rights) : left),
        ),
    );

const stmt = switch_<Stmt>([
    //
    start((finish) => kwd('throw', () => binned((target) => finish((src) => ({ type: 'throw', target, src }))))),
]);
/*

if it returns ... a matcher, then keep going?
if it returns a something else, then you're done? hmm.


const if_ = kwd('if', node => binned((cond) => block(yes => opt(kwd('else', () => block(no => no)))(no => ({type: 'if', cond, yes, no})) )))

*/
