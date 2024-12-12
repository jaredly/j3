import { Src } from '../keyboard/handleShiftNav';
import { js, TestParser } from '../keyboard/test-utils';
import { Id, ListKind, Loc, RecNode, TableKind } from '../shared/cnodes';
import { Bag, Ctx, MatchParent } from './dsl';
import { binops, Expr, partition, Pat, Stmt } from './ts-types';

type AutoComplete = string;

type Failed = { type: 'failed'; message: string; parent: MatchParent; at: number };
type Finished<T> = { type: 'finished'; result: T; consumed: number };
type Match<T> = {
    type: 'match';
    result: Finished<T> | Failed;
    good?: Bag<RecNode>;
    bad?: Bag<MatchError>;
};

type MatchError =
    | { type: 'missing'; parent: Omit<MatchParent, 'nodes'>; at: number }
    | { type: 'mismatch' | 'extra'; node: RecNode; matcher: MRes<any> };

type Next<T> = <R>(inner: (v: T) => MRes<R>) => MRes<R>;

// TODO: turn this into a
// - type: 'matcher'
// - .match()
// - .describe()

type MRes<T> = {
    type: 'matcher';
    match: (parent: MatchParent, at: number) => Match<T> | MRes<T>;
    describe(): string;
};

const asMatch = <T>(desc: string, match: MRes<T>['match']): MRes<T> => ({
    type: 'matcher',
    match,
    describe: () => desc,
});

type Start = { at: number; parent: MatchParent; loc: Loc };

const start = <T>(name: string, inner: (finish: <I>(f: (src: Src) => I) => MRes<I>) => MRes<T>): MRes<T> =>
    asMatch(name, (parent, at) => inner((f) => finish({ parent, at, loc: parent.nodes[at].loc }, f)).match(parent, at));

const finish = <T>(start: Start, f: (src: Src) => T): MRes<T> =>
    asMatch('finisher', (parent: MatchParent, at: number) => {
        const node = parent.nodes[at - 1];
        return {
            type: 'match',
            result: { type: 'finished', result: f({ left: start.loc, right: at > start.at ? node.loc : undefined }), consumed: at - start.at },
        };
    });

const id = <T>(kind: string | null, next: (node: Id<Loc>) => MRes<T>): MRes<T> =>
    asMatch('id', (parent, at) => {
        if (at >= parent.nodes.length) {
            return { type: 'match', result: { type: 'failed', message: 'missing: id', parent, at } };
        }
        const node = parent.nodes[at];
        if (!node || node.type !== 'id') {
            return { type: 'match', result: { type: 'failed', message: 'not an id', parent, at } };
        }
        return next(node).match(parent, at + 1);
    });

const kwd = <T>(kwd: string, next: (node: Id<Loc>) => MRes<T>): MRes<T> =>
    asMatch('kwd ' + kwd, (parent, at) => {
        if (at >= parent.nodes.length) {
            return { type: 'match', result: { type: 'failed', message: 'missing: kwd ' + kwd, parent, at } };
        }
        const node = parent.nodes[at];
        if (!node || node.type !== 'id' || node.ref || node.text !== kwd)
            return { type: 'match', result: { type: 'failed', message: 'not a kwd: ' + kwd, parent, at } };
        // TODO: iff it's blank, maybe return, like, an 'incomplete'?
        return next(node).match(parent, at + 1);
    });

export const just = <T>(result: T): MRes<T> =>
    asMatch('just', (parent, at) => ({ type: 'match', result: { type: 'finished', consumed: 1, result } }));

const multi = <I, T>(inner: MRes<I>, next: (v: I[]) => MRes<T>): MRes<T> =>
    asMatch('multi ' + inner.describe(), (parent, at) => {
        const values: I[] = [];
        while (at < parent.nodes.length) {
            const v = inner.match(parent, at);
            if (v.type === 'matcher') {
                throw new Error('incomplete?');
            }
            if (v.result.type === 'failed') {
                break;
            }
            values.push(v.result.result);
            if (v.result.consumed === 0) {
                throw new Error(`multi inner must consume`);
            }
            at += v.result.consumed;
        }
        return next(values).match(parent, at);
    });

const table = <I, R>(kind: TableKind, inner: MRes<I>, next: (v: I[]) => MRes<R>): MRes<R> =>
    asMatch('table ' + kind + ' inner ' + inner.describe(), (parent, at) => {
        const node = parent.nodes[at];
        if (node?.type === 'table' && node.kind === kind) {
            const results: I[] = [];
            node.rows.forEach((row, i) => {
                const result = inner.match({ loc: node.loc, nodes: row, sub: { type: 'table', row: i } }, 0);
                if (result.type === 'match' && result.result.type === 'finished') {
                    results.push(result.result.result);
                }
            });
            return next(results).match(parent, at + 1); // { type: 'finished', consumed: 1, result: results };
        } else {
            return { type: 'match', result: { type: 'failed', message: 'not a table of kind ' + kind, parent, at } };
        }
    });

const list = <I>(kind: ListKind<RecNode>, inner: MRes<I>): MRes<I> =>
    asMatch('list ' + kind + ' ' + inner.describe(), (parent, at) => {
        const node = parent.nodes[at];
        if (node?.type === 'list' && node.kind === kind) {
            return inner.match({ loc: node.loc, nodes: node.children }, 0);
        } else {
            return { type: 'match', result: { type: 'failed', message: 'not a list of kind ' + kind, parent, at } };
        }
    });

const opt = <T, R>(inner: MRes<T>, next: (v: T | null) => MRes<R>): MRes<R> =>
    asMatch('optional ' + inner.describe(), (parent, at) => {
        const result = inner.match(parent, at);
        if (result.type === 'match' && result.result.type === 'finished') {
            return next(result.result.result).match(parent, at + result.result.consumed);
        }
        return next(null).match(parent, at);
    });

// start of stream
const SOS = <T>(next: MRes<T>): MRes<T> =>
    asMatch('Start of Stream + ' + next.describe(), (parent, at) => {
        if (at > 0) return { type: 'match', result: { type: 'failed', message: 'expected start of stream', parent, at } };
        return next.match(parent, at);
    });

// end of stream
const EOS = <T>(next: MRes<T>): MRes<T> =>
    asMatch('EOS ' + next.describe(), (parent, at) => {
        for (; at < parent.nodes.length; at++) {
            // errors, rack em up
        }
        // howw do we add on errors? and such.
        return next.match(parent, at);
    });

const switch_ =
    <I>(name: string, options: MRes<I>[]) =>
    <T>(next: (v: I) => MRes<T>): MRes<T> =>
        asMatch('switch:' + options.map((m) => m.describe()).join(', '), (parent, at) => {
            const failed: Failed[] = [];
            for (let opt of options) {
                const res = opt.match(parent, at);
                if (res.type === 'matcher') {
                    throw new Error('ended at a matcher?');
                }
                if (res.result.type === 'finished') {
                    return next(res.result.result).match(parent, at + res.result.consumed);
                }
                failed.push(res.result);
            }
            console.log(failed);
            return { type: 'match', result: { type: 'failed', message: 'no switch options matched ' + name, parent, at } };
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
