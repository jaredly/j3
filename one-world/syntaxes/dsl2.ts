import { Src } from '../keyboard/handleShiftNav';
import { js, TestParser } from '../keyboard/test-utils';
import { Id, ListKind, Loc, RecNode, TableKind } from '../shared/cnodes';
import { Bag, bagSize, Ctx, MatchParent } from './dsl';
import { binops, Expr, partition, Pat, Stmt } from './ts-types';

type AutoComplete = string;

// type Failed = { type: 'failed'; message: string; parent: MatchParent; at: number };
type Finished<T> = { result: T; consumed: number };
type Match<T> = {
    type: 'match';
    result?: Finished<T> | null | undefined;
    ctx: MCtx;
};

// TODO: hmm how about including a "path" for these errors? Yeah that would be great.
type MatchError =
    | { type: 'other'; parent: Omit<MatchParent, 'nodes'>; at: number; expected: string }
    | { type: 'missing'; parent: Omit<MatchParent, 'nodes'>; at: number; expected: string }
    | { type: 'mismatch'; node: RecNode; expected: string }
    | { type: 'extra'; node: RecNode };

type Next<T> = <R>(inner: (v: T) => MRes<R>) => MRes<R>;

// TODO: turn this into a
// - type: 'matcher'
// - .match()
// - .describe()

type MCtx = { good: Bag<RecNode>; bad: Bag<MatchError>; path: MRes<any>[] };

// const empty: any[] = [];
export const ictx: MCtx = { good: [], bad: [], path: [] };

const band = <T>(one: Bag<T>, two: Bag<T>): Bag<T> =>
    Array.isArray(one) && one.length === 0 ? two : Array.isArray(two) && two.length === 0 ? one : [one, two];

type MRes<T> = {
    type: 'matcher';
    match: (parent: MatchParent, at: number, ctx: MCtx) => Match<T> | MRes<T>;
    describe(): string;
};

const apath = (ctx: MCtx, m: MRes<any>) => ({ ...ctx, path: ctx.path.concat([m]) });

const asMatch = <T>(desc: string, match: MRes<T>['match']): MRes<T> => {
    const self: MRes<T> = {
        type: 'matcher',
        match: (parent, at, ctx) => match(parent, at, apath(ctx, self)),
        describe: () => desc,
    };
    return self;
};

type Start = { at: number; parent: MatchParent; loc: Loc };

const start = <T>(name: string, inner: (finish: <I>(f: (src: Src) => I) => MRes<I>) => MRes<T>): MRes<T> =>
    asMatch(name, (parent, at, ctx) => inner((f) => finish({ parent, at, loc: parent.nodes[at].loc }, f)).match(parent, at, ctx));

const finish = <T>(start: Start, f: (src: Src) => T): MRes<T> =>
    asMatch('finisher', (parent: MatchParent, at: number, ctx: MCtx) => {
        const node = parent.nodes[at - 1];
        return {
            type: 'match',
            result: { result: f({ left: start.loc, right: at > start.at ? node.loc : undefined }), consumed: at - start.at },
            ctx,
        };
    });

const err = (ctx: MCtx, err: MatchError): MCtx => {
    return { ...ctx, bad: band(ctx.bad, err) };
};
const good = (ctx: MCtx, node: RecNode): MCtx => {
    return { ...ctx, good: band(ctx.good, node) };
};
const mctx = (one: MCtx, two: MCtx): MCtx => ({ good: band(one.good, two.good), bad: band(one.bad, two.bad), path: two.path });

const id = <T>(kind: string | null, next: (node: Id<Loc>) => MRes<T>): MRes<T> =>
    asMatch('id', (parent, at, ctx) => {
        if (at >= parent.nodes.length) {
            ctx = err(ctx, { type: 'missing', parent, at, expected: `id` });
            return { type: 'match', ctx };
        }
        const node = parent.nodes[at];
        if (node.type !== 'id') {
            ctx = err(ctx, { type: 'mismatch', node, expected: `id` });
            return { type: 'match', ctx };
        }
        ctx = good(ctx, node);
        return next(node).match(parent, at + 1, ctx);
    });

const kwd = <T>(kwd: string, next: (node: Id<Loc>) => MRes<T>): MRes<T> =>
    asMatch('kwd ' + kwd, (parent, at, ctx) => {
        if (at >= parent.nodes.length) {
            ctx = err(ctx, { type: 'missing', parent, at, expected: `kwd ${kwd}` });
            return { type: 'match', ctx };
        }
        const node = parent.nodes[at];
        if (!node || node.type !== 'id' || node.ref || node.text !== kwd) {
            ctx = err(ctx, { type: 'mismatch', node, expected: `kwd ${kwd}` });
            return { type: 'match', ctx };
        }
        ctx = good(ctx, node);
        // TODO: iff it's blank, maybe return, like, an 'incomplete'?
        return next(node).match(parent, at + 1, ctx);
    });

export const just = <T>(result: T): MRes<T> => asMatch('just', (parent, at, ctx) => ({ type: 'match', result: { consumed: 1, result }, ctx }));

const multi = <I, T>(inner: MRes<I>, next: (v: I[]) => MRes<T>): MRes<T> =>
    asMatch('multi ' + inner.describe(), (parent, at, ctx) => {
        const values: I[] = [];
        while (at < parent.nodes.length) {
            const v = inner.match(parent, at, ctx);
            if (v.type === 'matcher') {
                throw new Error('incomplete?');
            }
            ctx = v.ctx;
            if (!v.result) {
                break;
            }
            values.push(v.result.result);
            if (v.result.consumed === 0) {
                throw new Error(`multi inner must consume`);
            }
            at += v.result.consumed;
        }
        return next(values).match(parent, at, ctx);
    });

const table = <I, R>(kind: TableKind, inner: MRes<I>, next: (v: I[]) => MRes<R>): MRes<R> =>
    asMatch('table ' + kind + ' inner ' + inner.describe(), (parent, at, ctx) => {
        const node = parent.nodes[at];
        if (node?.type === 'table' && node.kind === kind) {
            const results: I[] = [];
            node.rows.forEach((row, i) => {
                const result = inner.match({ loc: node.loc, nodes: row, sub: { type: 'table', row: i } }, 0, ctx);
                if (result.type === 'matcher') throw new Error('incomplete?');
                ctx = result.ctx;
                if (result.type === 'match' && result.result) {
                    results.push(result.result.result);
                }
            });
            ctx = good(ctx, node);
            return next(results).match(parent, at + 1, ctx); // { type: 'finished', consumed: 1, result: results };
        } else {
            ctx = err(ctx, { type: 'mismatch', node, expected: `table ${kind}` });
            return { type: 'match', ctx };
        }
    });

const list = <I>(kind: ListKind<RecNode>, inner: MRes<I>): MRes<I> =>
    asMatch('list ' + kind + ' ' + inner.describe(), (parent, at, ctx) => {
        const node = parent.nodes[at];
        if (node?.type === 'list' && node.kind === kind) {
            ctx = good(ctx, node);
            return inner.match({ loc: node.loc, nodes: node.children }, 0, ctx);
        } else {
            ctx = err(ctx, { type: 'mismatch', node, expected: `list ${kind}` });
            return { type: 'match', ctx };
        }
    });

const opt = <T, R>(inner: MRes<T>, next: (v: T | null) => MRes<R>): MRes<R> =>
    asMatch('optional ' + inner.describe(), (parent, at, ctx) => {
        const result = inner.match(parent, at, ctx);
        if (result.type === 'match' && result.result) {
            return next(result.result.result).match(parent, at + result.result.consumed, ctx);
        }
        return next(null).match(parent, at, ctx);
    });

// start of stream
const SOS = <T>(next: MRes<T>): MRes<T> =>
    asMatch('Start of Stream + ' + next.describe(), (parent, at, ctx) => {
        if (at > 0) {
            ctx = err(ctx, { type: 'other', parent, at, expected: 'start of stream' });
            return { type: 'match', ctx };
        }
        return next.match(parent, at, ctx);
    });

// end of stream
const EOS = <T>(next: MRes<T>): MRes<T> =>
    asMatch('EOS ' + next.describe(), (parent, at, ctx) => {
        for (; at < parent.nodes.length; at++) {
            ctx = err(ctx, { type: 'extra', node: parent.nodes[at] });
        }
        return next.match(parent, at, ctx);
    });

const switch_ =
    <I>(name: string, options: MRes<I>[]) =>
    <T>(next: (v: I) => MRes<T>): MRes<T> =>
        asMatch('switch:' + options.map((m) => m.describe()).join(', '), (parent, at, ctx) => {
            // const failed: Failed[] = [];
            let failed: { ctx: MCtx; goods: number }[] = [];
            // let failed: MCtx = { good: [], bad: [], path: ctx.path };
            for (let opt of options) {
                const res = opt.match(parent, at, { ...ictx, path: ctx.path });
                if (res.type === 'matcher') {
                    throw new Error('ended at a matcher?');
                }
                if (res.result) {
                    return next(res.result.result).match(parent, at + res.result.consumed, mctx(ctx, res.ctx));
                }
                failed.push({ ctx: res.ctx, goods: bagSize(res.ctx.good) });
                // failed.good = band(failed.good, res.ctx.good);
                // failed.bad = band(failed.bad, res.ctx.bad);
            }
            failed.sort((a, b) => b.goods - a.goods);
            ctx = err(ctx, { type: 'other', parent, at, expected: `switch ${name}` });
            return { type: 'match', ctx: mctx(ctx, failed[0].ctx) };
        });

export const pat = switch_<Pat>('pat', [
    start('pat var', (finish) => id(null, (node) => finish((src) => ({ type: 'var', name: node.text, src })))),
    //
]);

export const expr = switch_<Expr>('expr', [
    start('expr var', (finish) => id(null, (node) => finish((src) => ({ type: 'var', name: node.text, src })))),
    //
]);

const fancy = switch_<Expr>('fancy', [
    //
    start('expr new', (finish) => kwd('new', () => binned((target) => finish((src) => ({ type: 'new', target, src }))))),
    start('expr await', (finish) => kwd('await', () => binned((target) => finish((src) => ({ type: 'await', target, src }))))),
    start('expr lambda', (finish) =>
        list(
            'round',
            multi(pat(just), (args) =>
                kwd('=>', () =>
                    switch_<Stmt[] | Expr>('fnbody', [block(just), expr(just)])((body) => finish((src): Expr => ({ type: 'fn', args, body, src }))),
                ),
            ),
        ),
    ),
    start('expr if', (finish) =>
        kwd('if', () =>
            binned((cond) =>
                block((yes) =>
                    opt(
                        kwd('else', () => block(just)),
                        (no) => finish((src) => ({ type: 'if', cond, yes, no, src })),
                    ),
                ),
            ),
        ),
    ),
    start('expr switch', (finish) =>
        kwd('switch', () =>
            binned((target) =>
                table(
                    'curly',
                    pat((pat) => switch_<Stmt[] | Expr>('switchbody', [block(just), expr(just)])((body) => just({ pat, body }))),
                    (cases) => finish((src) => ({ type: 'case', cases, src, target })),
                ),
            ),
        ),
    ),
    expr(just),
]);

const bop = switch_(
    'bop',
    binops.map((bop) => kwd(bop, just)),
);

const binned = <R>(next: (v: Expr) => MRes<R>): MRes<R> =>
    fancy((left) =>
        multi<{ op: Id<Loc>; right: Expr }, R>(
            bop((op) => fancy((right) => just({ op, right }))),
            (rights) => next(rights.length ? partition(left, rights) : left),
        ),
    );

const stmtSpaced = switch_<Stmt>('stmt-spaced', [
    //
    start('stmt throw', (finish) => kwd('throw', () => binned((target) => finish((src) => ({ type: 'throw', target, src }))))),
    start('stmt let', (finish) =>
        kwd('let', () => pat((pat) => kwd('=', () => binned((value) => finish((src) => ({ type: 'let', pat, value, src })))))),
    ),
]);

export const stmt = switch_<Stmt>('stmt', [
    //
    list(
        'spaced',
        stmtSpaced((val) => EOS(just(val))),
    ),
    start('stmt expr', (finish) => expr((expr) => finish((src) => ({ type: 'expr', expr, src })))),
]);

const block = <T>(next: (s: Stmt[]) => MRes<T>): MRes<T> => list('curly', multi(stmt(just), next));

// export const ts2Parser: TestParser = {
//     config: js,
//     parse(node, cursor) {
//         return parse(matchers.stmt, node, ctx(cursor));
//     },
//     spans: stmtSpans,
// }

/*

BIG Q:
... I think I want, like a context, that ... is strictly path-based (for things like "EOS")
    -> except I can just do that with ... like ... function arguments and stuff.
and one that bubbles somewhat (for scope)

*/

/*

if it returns ... a matcher, then keep going?
if it returns a something else, then you're done? hmm.


const if_ = kwd('if', node => binned((cond) => block(yes => opt(kwd('else', () => block(no => no)))(no => ({type: 'if', cond, yes, no})) )))

*/
