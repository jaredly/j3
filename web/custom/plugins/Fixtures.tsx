import React from 'react';
import { Node } from '../../../src/types/cst';
import { Action, NamespacePlugin } from '../UIState';
import { NNode } from '../../../src/state/getNestedNodes';
import equal from 'fast-deep-equal';
import { valueToString } from '../../ide/ground-up/reduce';
import { Path } from '../../store';
import { fromMCST } from '../../../src/types/mcst';
import { newNodeAfter, newNodeBefore } from '../../../src/state/newNodeBefore';
import { newBlank, newId, newListLike } from '../../../src/state/newNodes';

type RefNode = Extract<NNode, { type: 'ref' }> & { path: Path };

type LineFixture = {
    type: 'line';
    loc: number;
    input: null | {
        node: Node;
        child: RefNode;
    };
    output: null | {
        node: Node;
        child: RefNode;
    };
};

type Data = {
    test: null | { node: Node; child: RefNode };
    fxid: number;
    fixtures: (
        | LineFixture
        | { type: 'unknown'; node: Node; child: RefNode; loc: number }
    )[];
};

const parseTuple = (node: Node) => {
    if (
        node.type === 'list' &&
        node.values.length > 1 &&
        node.values[0].type === 'identifier' &&
        node.values[0].text === ','
    ) {
        return node.values.slice(1);
    }
    return null;
};

const parseFixture = (
    item: Node,
    path: Path,
    ancestors: Path[],
): Data['fixtures'][0] => {
    const inner = parseTuple(item);
    if (!inner?.length || inner.length != 2) {
        return {
            type: 'unknown',
            loc: item.loc,
            node: item,
            child: { type: 'ref', path, id: item.loc, ancestors },
        };
    } else {
        return {
            type: 'line',
            loc: item.loc,
            input: {
                node: inner[0],
                child: {
                    path: { idx: item.loc, type: 'child', at: 1 },
                    ancestors: [...ancestors, path],
                    type: 'ref',
                    id: inner[0].loc,
                },
            },
            output: inner[1]
                ? {
                      node: inner[1],
                      child: {
                          path: { idx: item.loc, type: 'child', at: 2 },
                          ancestors: [...ancestors, path],
                          type: 'ref',
                          id: inner[1].loc,
                      },
                  }
                : null,
        };
    }
};

const parse = (node: Node): Data | void => {
    if (node.type === 'blank') {
        return;
    }
    if (node.type === 'array') {
        return {
            test: null,
            fxid: node.loc,
            fixtures: node.values.map((item, i) =>
                parseFixture(item, { type: 'child', at: i, idx: node.loc }, []),
            ),
        };
    }
    const top = parseTuple(node);
    if (!top) return;
    if (top.length === 2) {
        const [test, fixtures] = top;
        if (fixtures.type === 'array') {
            return {
                test: {
                    node: test,
                    child: {
                        path: { idx: node.loc, type: 'child', at: 1 },
                        id: test.loc,
                        type: 'ref',
                    },
                },
                fxid: fixtures.loc,
                fixtures: fixtures.values.map((item, i) =>
                    parseFixture(
                        item,
                        {
                            type: 'child',
                            at: i,
                            idx: fixtures.loc,
                        },
                        [{ idx: node.loc, type: 'child', at: 2 }],
                    ),
                ),
            };
        }
    }
};

const findLastIndex = <T,>(arr: T[], f: (t: T) => boolean) => {
    for (let i = arr.length - 1; i >= 0; i--) {
        if (f(arr[i])) return i;
    }
    return -1;
};

export const fixturePlugin: NamespacePlugin<any> = {
    id: 'fixture',
    title: 'Fixture tests',
    test: (node: Node) => {
        return parse(node) != null;
    },
    newNodeAfter(path, map, nsMap, nidx) {
        const tid = path.findIndex((p) => p.type === 'ns-top');
        if (tid === -1) return null;
        const node = fromMCST(path[tid + 1].idx, map);
        const parsed = parse(node);
        if (!parsed) return null;
        const cidx = findLastIndex(path, (p) => p.type === 'child');
        if (cidx === -1) return null;
        const child = path[cidx] as Extract<Path, { type: 'child' }>;

        if (
            child.idx === node.loc &&
            child.at === 1 &&
            parsed.fixtures.length
        ) {
            const loc = path.slice(0, cidx).concat([
                { type: 'child', idx: child.idx, at: 2 },
                { type: 'inside', idx: parsed.fxid },
            ]);
            return newNodeAfter(
                loc,
                map,
                nsMap,
                newListLike(
                    'list',
                    nidx(),
                    [newId([','], nidx()), newBlank(nidx()), newBlank(nidx())],
                    1,
                ),
                nidx,
            );
        }

        if (child.idx === parsed.fxid) {
            const loc = path.slice(0, cidx - 1).concat([
                { type: 'child', idx: child.idx, at: 2 },
                { type: 'child', idx: parsed.fxid, at: child.at },
            ]);
            return newNodeAfter(
                loc,
                map,
                nsMap,
                newListLike(
                    'list',
                    nidx(),
                    [newId([','], nidx()), newBlank(nidx()), newBlank(nidx())],
                    1,
                ),
                nidx,
            );
        }

        for (let i = 0; i < parsed.fixtures.length; i++) {
            const fx = parsed.fixtures[i];
            console.log('child', child.idx, fx.loc);
            if (child.idx === fx.loc && child.at === 2) {
                const loc = path.slice(0, cidx - 1).concat([
                    { type: 'child', idx: child.idx, at: 2 },
                    { type: 'child', idx: parsed.fxid, at: i },
                ]);
                return newNodeAfter(
                    loc,
                    map,
                    nsMap,
                    newListLike(
                        'list',
                        nidx(),
                        [
                            newId([','], nidx()),
                            newBlank(nidx()),
                            newBlank(nidx()),
                        ],
                        1,
                    ),
                    nidx,
                );
            }
        }

        console.log(child.idx, parsed.test?.node.loc);

        console.log('parsed', path, node, parsed);
        // console.log('checkiong', path, node);
        // if ... this ... is ...
        return null;
    },
    process(node: Node, evaluate: (node: Node) => any) {
        const data = parse(node);
        if (!data) return {};
        let test: null | Function = null;
        if (data.test) {
            try {
                test = evaluate(data.test.node);
            } catch (err) {
                return {};
            }
            if (typeof test !== 'function') return {};
        }
        const results: {
            [key: number]: { expected: any; found: any; error?: string };
        } = {};
        data.fixtures.forEach((item) => {
            if (
                item.type === 'line' &&
                item.input &&
                item.input?.node.type !== 'blank'
            ) {
                try {
                    results[item.input.node.loc] = {
                        expected:
                            item.output?.node.type !== 'blank'
                                ? evaluate(item.output!.node)
                                : null,
                        found: test
                            ? test(evaluate(item.input.node))
                            : evaluate(item.input.node),
                    };
                } catch (err) {
                    console.error(err);
                    // failed
                    results[item.input.node.loc] = {
                        expected: null,
                        found: null,
                        error: (err as Error).message,
                    };
                }
            }
        });
        return results;
    },
    render(
        node: Node,
        results: {
            [key: number]: { expected: any; found: any; error?: string };
        },
        dispatch: React.Dispatch<Action>,
    ): NNode | void {
        const data = parse(node);
        if (!data) return;
        return {
            type: 'horiz',
            children: [
                { type: 'blinker', loc: 'start' },
                {
                    type: 'vert',
                    style: {
                        border: '1px solid #aaa',
                        margin: '0 4px',
                        padding: 8,
                    },
                    children: [
                        {
                            type: 'punct',
                            color: 'white',
                            text: 'Fixture tests:',
                        },
                        ...(data.test ? ([data.test.child] as const) : []),
                        {
                            type: 'pairs',
                            firstLine: [],
                            children: [
                                [
                                    {
                                        type: 'punct',
                                        text: 'Input',
                                        color: 'gray',
                                    },
                                    {
                                        type: 'punct',
                                        text: 'Output',
                                        color: 'gray',
                                    },
                                ],
                                ...data.fixtures.map(
                                    (item, i): [NNode] | [NNode, NNode] =>
                                        item.type === 'unknown'
                                            ? [item.child]
                                            : [
                                                  {
                                                      type: 'horiz',
                                                      children: [
                                                          item.input
                                                              ? item.input.child
                                                              : {
                                                                    type: 'dom',
                                                                    node: (
                                                                        <button>
                                                                            Add
                                                                            input
                                                                        </button>
                                                                    ),
                                                                },
                                                      ],
                                                  },
                                                  {
                                                      type: 'horiz',
                                                      children: [
                                                          {
                                                              type: 'punct',
                                                              color: 'red',
                                                              text: statusIndicator(
                                                                  item,
                                                                  results,
                                                              ),
                                                          },
                                                          item.output
                                                              ? item.output
                                                                    .child
                                                              : {
                                                                    type: 'dom',
                                                                    node: (
                                                                        <button>
                                                                            Output
                                                                        </button>
                                                                    ),
                                                                },
                                                          {
                                                              type: 'punct',
                                                              color: 'white',
                                                              text: ' ',
                                                          },
                                                          {
                                                              type: 'dom',
                                                              node: statusMessage(
                                                                  item,
                                                                  results,
                                                                  dispatch,
                                                              ),
                                                          },
                                                      ],
                                                  },
                                              ],
                                ),
                            ],
                        },
                    ],
                },
                { type: 'blinker', loc: 'end' },
            ],
        };
    },
};

function statusMessage(
    item: LineFixture,
    results: {
        [key: number]: {
            expected: any;
            found: any;
            error?: string | undefined;
        };
    },
    dispatch: React.Dispatch<Action>,
): JSX.Element | null {
    if (!item.input) return <span style={{ color: 'purple' }}>no input</span>;
    const res = results[item.input.node.loc];
    if (!res) return null;
    if (res.error) return <span style={{ color: 'red' }}>{res.error}</span>;
    if (!equal(res.expected, res.found)) {
        return (
            <span
                style={{ color: 'purple', cursor: 'pointer' }}
                onClick={() => {
                    // So ... we want .... the .. evaluator? to tell us, how to turn a [value]
                    // into a [CST]. Right? Seems about right.
                    console.log(res.found);
                    dispatch({
                        type: 'select',
                        at: [
                            {
                                start: [
                                    {
                                        type: 'start',
                                        idx: item.output!.node.loc,
                                    },
                                ],
                                end: [
                                    { type: 'end', idx: item.output!.node.loc },
                                ],
                            },
                        ],
                    });
                    dispatch({
                        type: 'paste',
                        items: [
                            {
                                type: 'text',
                                trusted: false,
                                text: valueToString(
                                    results[item.input!.node.loc].found,
                                ),
                            },
                        ],
                    });
                }}
            >
                {valueToString(results[item.input.node.loc]?.found)}
            </span>
        );
    }
    return null;
}

function statusIndicator(
    item: LineFixture,
    results: { [key: number]: { expected: any; found: any; error?: string } },
): string {
    if (!item.input || !item.output) {
        return '🚧 ';
    }
    const res = results[item.input.node.loc];
    if (!res || res.error) {
        return '🛑 ';
    }
    return equal(res.expected, res.found) ? '✅ ' : '🚨 ';
}
