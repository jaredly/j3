import React from 'react';
import { Node } from '../../../src/types/cst';
import { NamespacePlugin } from '../UIState';
import { NNode } from '../../../src/state/getNestedNodes';
import equal from 'fast-deep-equal';
import { valueToString } from '../../ide/ground-up/reduce';
import { Path } from '../../store';

type RefNode = Extract<NNode, { type: 'ref' }> & { path: Path };

type LineFixture = {
    type: 'line';
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
    fixtures: (LineFixture | { type: 'unknown'; node: Node; child: RefNode })[];
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

const parseFixture = (item: Node, path: Path): Data['fixtures'][0] => {
    const inner = parseTuple(item);
    if (!inner?.length || inner.length >= 3) {
        return {
            type: 'unknown',
            node: item,
            child: { type: 'ref', path, id: item.loc },
        };
    } else {
        return {
            type: 'line',
            input: {
                node: inner[0],
                child: {
                    path: { idx: item.loc, type: 'child', at: 1 },
                    type: 'ref',
                    id: inner[0].loc,
                },
            },
            output: inner[1]
                ? {
                      node: inner[1],
                      child: {
                          path: { idx: item.loc, type: 'child', at: 2 },
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
        return { test: null, fixtures: [] };
    }
    if (node.type === 'array') {
        return {
            test: null,
            fixtures: node.values.map((item, i) =>
                parseFixture(item, { type: 'child', at: i, idx: node.loc }),
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
                fixtures: fixtures.values.map((item, i) =>
                    parseFixture(item, {
                        type: 'child',
                        at: i + 1,
                        idx: node.loc,
                    }),
                ),
            };
        }
    }
};

export const fixturePlugin: NamespacePlugin<any> = {
    id: 'fixture',
    title: 'Fixture tests',
    test: (node: Node) => {
        return parse(node) != null;
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
            if (item.type === 'line' && item.input) {
                try {
                    results[item.input.node.loc] = {
                        expected: item.output
                            ? evaluate(item.output.node)
                            : null,
                        found: test
                            ? test(evaluate(item.input.node))
                            : evaluate(item.input.node),
                    };
                } catch (err) {
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
    ): NNode | void {
        const data = parse(node);
        if (!data) return;
        return {
            type: 'vert',
            children: [
                ...(data.test ? ([data.test.child] as const) : []),
                {
                    type: 'pairs',
                    firstLine: [],
                    children: [
                        [
                            { type: 'punct', text: 'Input', color: 'gray' },
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
                                                                    Add input
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
                                                      ? item.output.child
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
                                                      type: 'punct',
                                                      color: 'purple',
                                                      text: statusMessage(
                                                          item,
                                                          results,
                                                      ),
                                                  },
                                              ],
                                          },
                                      ],
                        ),

                        [
                            {
                                type: 'dom',
                                node: (
                                    <button
                                        style={{
                                            cursor: 'pointer',
                                            color: 'inherit',
                                            padding: '8px 12px',
                                            backgroundColor: 'transparent',
                                            border: 'none',
                                            opacity: 0.6,
                                        }}
                                        onMouseDown={(evt) => {
                                            evt.stopPropagation();
                                        }}
                                    >
                                        Add a test case
                                    </button>
                                ),
                            },
                        ],
                    ],
                },
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
): string {
    if (!item.input) return 'no input';
    const res = results[item.input.node.loc];
    if (!res) return 'no results';
    if (res.error) return res.error;
    if (!equal(res.expected, res.found)) {
        return valueToString(results[item.input.node.loc]?.found);
    }
    return '';
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
