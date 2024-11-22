import { Id, ListKind, Loc, RecNode, TableKind, TextSpan } from '../shared/cnodes';

// So, we need to provide a 'list of kwds' to be able to reject them from the `id` matcher

export type Matcher =
    | { type: 'id'; kind?: string } // if kind is provided, this is a toplevel ref
    | { type: 'kwd'; text: string }
    | { type: 'text'; embeds: Matcher }
    | { type: 'named'; name: string; inner: Matcher }
    // | { type: 'add'; name: string; value: any; inner: Matcher }
    | {
          // What's our skip behavior?
          // maybe like 'off by 1 is allowed'?
          // so first we try to skip the offending node,
          // then we try to take a mulligan on the matcher?
          // maybe that's too complex, and for sequence we should
          // just play it straight for now
          type: 'sequence';
          items: Matcher[];
          all?: boolean;
      }
    | { type: 'multi'; item: Matcher; all?: boolean }
    | { type: 'list'; kind: ListKind<Matcher>; children: Matcher }
    | { type: 'opt'; inner: Matcher }
    | { type: 'table'; kind: TableKind; row: Matcher }
    | { type: 'switch'; choices: Matcher[] }
    | { type: 'mref'; id: string }
    | { type: 'kswitch'; choices: Record<string, Matcher> };

type Bag<T> = T | Bag<T>[];

type Data = { type: 'single'; value: any } | { type: 'named'; value: Record<string, any> };
type MatchRes = { result: null | { data: Data; consumed: number }; good: Bag<RecNode>; bad: Bag<MatchError> };
const single = (value: any): Data => ({ type: 'single', value });

type MatchError = { matcher: Matcher; node: RecNode };
const fail = (matcher: Matcher, node: RecNode): MatchRes => ({ result: null, good: [], bad: [{ matcher, node }] });
const one = (data: Data, node: RecNode, good: Bag<RecNode> = [], bad: Bag<MatchError> = []): MatchRes => ({
    result: { data, consumed: 1 },
    good: [node, good],
    bad,
});

/** We need to:
 * - respond with data (& # consumed) OR indicate failure
 * - indicate ... the farthest we got? or at least a record of all Locs sucessfully processed
 * - indicate any errors, ideally in a structured fashion
 */
const match = (matcher: Matcher, nodes: RecNode[], at: number): MatchRes => {
    // First, let's handle matchers that can handle out of scope
    const good: Bag<RecNode> = [];
    const bad: Bag<MatchError> = [];

    // Then, we'll do "just one" matchers
    const node = nodes[at];
    switch (matcher.type) {
        case 'id':
            if (node.type !== 'id') return fail(matcher, node);
            if (matcher.kind == null && !node.ref) {
                return one(single(node), node);
            } else if (node.ref?.type === 'toplevel' && node.ref.kind === matcher.kind) {
                return one(single(node), node);
            }
            return fail(matcher, node);
        case 'kwd':
            if (node.type !== 'id' || node.ref) return fail(matcher, node);
            return one(single(node.text), node);
        case 'text':
            if (node.type !== 'text') return fail(matcher, node);
            const items: TextSpan<any>[] = [];
            node.spans.forEach((span) => {
                switch (span.type) {
                    case 'embed':
                        const res = match(matcher.embeds, [span.item], 0);
                        good.push(res.good);
                        bad.push(res.bad);
                        if (res.result) {
                            items.push({ ...span, item: res.result.data });
                        }
                        return;
                    default:
                        items.push(span);
                }
            });
            return one(single(items), node, good, bad);
        case 'named': {
            const res = match(matcher.inner, nodes, at);
            return {
                ...res,
                result: res.result ? { data: { type: 'named', value: { [matcher.name]: res.result.data } }, consumed: res.result.consumed } : null,
            };
        }
        case 'sequence': {
            const init = at;
            for (let i = 0; i < matcher.items.length; i++) {
                const res = match(matcher.items[i], nodes, at);
            }
        }
    }
};

// So
// I feel like it would be harder to construct the right type of the output
// using the types (values) version, as opposed to the functions (combinators) version
// why is that? do we need GADTs to make it work? 🤔

type TM<T> = Matcher;

const id = (kind?: string): TM<Id<Loc>> => ({ type: 'id', kind });
const kwd = (text: string): TM<string> => ({ type: 'kwd', text });
const text = (embeds: Matcher): Matcher => ({ type: 'text', embeds });
const named = (name: string, inner: Matcher): Matcher => ({ type: 'named', name, inner });
// const add = (name: string, value: any, inner: Matcher): Matcher => ({ type: 'add', name, value, inner });
const sequence = (items: Matcher[], all?: boolean): Matcher => ({ type: 'sequence', items, all });
const multi = (item: Matcher, all?: boolean): Matcher => ({ type: 'multi', item, all });
const list = (kind: ListKind<Matcher>, children: Matcher): Matcher => ({ type: 'list', kind, children });
const opt = (inner: Matcher): Matcher => ({ type: 'opt', inner });
const table = (kind: TableKind, row: Matcher): Matcher => ({ type: 'table', kind, row });
const switch_ = (choices: Matcher[]): Matcher => ({ type: 'switch', choices });
const kswitch = (choices: Record<string, Matcher>): Matcher => ({ type: 'kswitch', choices });
const mref = (id: string): Matcher => ({ type: 'mref', id });

const pat_ = mref('pat');
const sprpat_ = mref('sprpat');

// Should all matcher be ... records?
// in order?
// that would be ... interesting.

// const pats = [
//     id(node => ({type: 'bound', name: node.text})),
//     list('square', multi(sprpat_, true), values => ({type: 'array', values})),
//     // bound: id(),
//     // array: list('square', multi(sprpat_, true)),
//     // ...(spread ? { spread: list('smooshed', sequence([kwd('..'), pat_], true)) } : {}),
//     // constr: list('smooshed', sequence([id('constructor'), list('round', mref('pat'))], true)),
//     // text: text(mref('pat')),
// });

const _pat = (spread: boolean) => ({
    bound: id(),
    array: list('square', multi(sprpat_, true)),
    ...(spread ? { spread: list('smooshed', sequence([kwd('..'), pat_], true)) } : {}),
    constr: list('smooshed', sequence([id('constructor'), list('round', mref('pat'))], true)),
    text: text(mref('pat')),
});

export const pat = kswitch(_pat(false));
export const sprpat = kswitch(_pat(true));

const uops = ['+', '-', '!', '~'];

const block = list('curly', multi(mref('stmt'), true));

const expr_ = mref('expr');
const sprexpr_ = mref('sprexpr');

const binned_ = mref('binned');
const fancy = kswitch({
    if: sequence([kwd('if'), binned_, named('yes', block), opt(sequence([kwd('else'), named('no', block)]))]),
    case: sequence([kwd('case'), binned_, named('body', table('curly', sequence([named('pat', pat_), named('body', expr_)])))]),
});

// const binops = ['<', '>', '<=', '>=', '!=', '==', '+', '-', '*', '/', '^', '%'];
const binned = sequence([named('left', fancy), multi(sequence([named('op', id('binop')), named('right', fancy)]))]);

const _expr = (spread: boolean) => ({
    local: id(),
    global: id('value'),
    text: text(sprexpr_),
    array: list('square', multi(sprexpr_, true)),
    record: table('curly', switch_([named('single', sprexpr_), sequence([named('key', id('attribute')), named('value', expr_)])])),
    tuple: list('round', multi(sprexpr_, true)),
    smooshed: list(
        'smooshed',
        sequence([
            ...(spread ? [named('spread', opt(kwd('..')))] : []),
            named('prefixes', multi(switch_(uops.map(kwd)))),
            named('base', expr_),
            named(
                'suffixes',
                multi(
                    kswitch({
                        attr: sequence([kwd('.'), named('attr', id('attribute'))]),
                        index: list('square', multi(sprexpr_, true)),
                        call: list('round', multi(sprexpr_, true)),
                    }),
                ),
            ),
        ]),
    ),
    bops: list('spaced', binned),
});

export const expr = kswitch(_expr(false));
export const sprexpr = kswitch(_expr(true)); // expr with spreads
