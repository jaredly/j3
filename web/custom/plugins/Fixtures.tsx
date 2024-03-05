import React from 'react';
import { Node } from '../../../src/types/cst';
import { Map } from '../../../src/types/mcst';
import { NamespacePlugin } from '../UIState';
import { NNode } from '../../../src/state/getNestedNodes';
import equal from 'fast-deep-equal';
import { valueToString } from '../../ide/ground-up/reduce';

type Data = {
    test: null | Node;
    fixtures: (
        | { type: 'line'; input: null | Node; output: null | Node }
        | { type: 'unknown'; node: Node }
    )[];
};

const parseTuple = (node: Node) => {
    if (
        node.type === 'list' &&
        node.values[0].type === 'identifier' &&
        node.values[0].text === ','
    ) {
        return node.values.slice(1);
    }
    return null;
};

const parseFixture = (
    item: Node,
):
    | { type: 'unknown'; node: Node; input?: undefined; output?: undefined }
    | { type: 'line'; input: Node; output: Node; node?: undefined } => {
    const inner = parseTuple(item);
    if (!inner?.length) {
        return { type: 'unknown', node: item };
    } else {
        return {
            type: 'line',
            input: inner[0],
            output: inner[1],
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
            fixtures: node.values.map(parseFixture),
        };
    }
    const top = parseTuple(node);
    if (!top) return;
    if (top.length === 2) {
        const [test, fixtures] = top;
        if (fixtures.type === 'array') {
            return {
                test,
                fixtures: fixtures.values.map(parseFixture),
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
                test = evaluate(data.test);
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
                    results[item.input.loc] = {
                        expected: item.output ? evaluate(item.output) : null,
                        found: test
                            ? test(evaluate(item.input))
                            : evaluate(item.input),
                    };
                } catch (err) {
                    // failed
                    results[item.input.loc] = {
                        expected: null,
                        found: null,
                        error: (err as Error).message,
                    };
                }
            }
        });
        return results;
    },
    render(node: Node, results: { [key: number]: any }): NNode | void {
        const data = parse(node);
        if (!data) return;
        return {
            type: 'vert',
            children: [
                ...(data.test
                    ? ([
                          {
                              type: 'ref',
                              id: data.test.loc,
                              path: { type: 'start' },
                          },
                      ] as const)
                    : []),
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
                                    ? [
                                          {
                                              type: 'ref',
                                              id: item.node.loc,
                                              path: { type: 'child', at: i },
                                          },
                                      ]
                                    : [
                                          {
                                              type: 'horiz',
                                              children: [
                                                  item.input
                                                      ? {
                                                            type: 'ref',
                                                            id: item.input.loc,
                                                            path: {
                                                                type: 'child',
                                                                at: i,
                                                            },
                                                        }
                                                      : {
                                                            type: 'blinker',
                                                            loc: 'start',
                                                        },
                                              ],
                                          },
                                          {
                                              type: 'horiz',
                                              children: [
                                                  {
                                                      type: 'punct',
                                                      color: 'red',
                                                      text: (
                                                          item.input &&
                                                          results[
                                                              item.input.loc
                                                          ] != null
                                                              ? equal(
                                                                    results[
                                                                        item
                                                                            .input
                                                                            .loc
                                                                    ]?.expected,
                                                                    results[
                                                                        item
                                                                            .input
                                                                            .loc
                                                                    ]?.found,
                                                                )
                                                              : false
                                                      )
                                                          ? '✅ '
                                                          : '🚨 ',
                                                  },
                                                  item.output
                                                      ? {
                                                            type: 'ref',
                                                            id: item.output.loc,
                                                            path: {
                                                                type: 'child',
                                                                at: i,
                                                            },
                                                        }
                                                      : {
                                                            type: 'blinker',
                                                            loc: 'start',
                                                        },
                                                  {
                                                      type: 'punct',
                                                      color: 'white',
                                                      text: ' ',
                                                  },
                                                  {
                                                      type: 'punct',
                                                      color: 'purple',
                                                      text:
                                                          item.input &&
                                                          results[
                                                              item.input.loc
                                                          ] != null
                                                              ? valueToString(
                                                                    results[
                                                                        item
                                                                            .input
                                                                            .loc
                                                                    ]?.found,
                                                                ) + ''
                                                              : '',
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
