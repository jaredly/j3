import React from 'react';
import { Node } from '../../../src/types/cst';
import { Map } from '../../../src/types/mcst';
import { NamespacePlugin } from '../UIState';
import { NNode } from '../../../src/state/getNestedNodes';
import equal from 'fast-deep-equal';

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

const parse = (node: Node): Data | void => {
    if (node.type === 'blank') {
        return { test: null, fixtures: [] };
    }
    const top = parseTuple(node);
    if (!top) return;
    if (top.length === 2) {
        const [test, fixtures] = top;
        if (fixtures.type === 'array') {
            return {
                test,
                fixtures: fixtures.values.map((item) => {
                    const inner = parseTuple(item);
                    if (!inner || inner.length !== 2) {
                        return { type: 'unknown', node: item };
                    } else {
                        return {
                            type: 'line',
                            input: inner[0],
                            output: inner[1],
                        };
                    }
                }),
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
        if (!data || !data.test) return;
        const test = evaluate(data.test);
        if (typeof test !== 'function') return;
        const results: {
            [key: number]: { expected: any; found: any; error?: string };
        } = {};
        data.fixtures.forEach((item) => {
            if (item.type === 'line' && item.input) {
                try {
                    results[item.input.loc] = {
                        expected: item.output ? evaluate(item.output) : null,
                        found: test(evaluate(item.input)),
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
    render(node: Node, results: { [key: number]: any }): NNode {
        const data = parse(node);
        if (!data) return { type: 'text', text: 'Unable to parse data' };
        // TODO:
        // I need a way to add to the path in an NNode
        // without a `ref`
        return {
            type: 'vert',
            children: [
                data.test
                    ? {
                          type: 'ref',
                          id: data.test.loc,
                          path: { type: 'start' },
                      }
                    : { type: 'blinker', loc: 'start' },
                ...data.fixtures.map(
                    (item, i): NNode =>
                        item.type === 'unknown'
                            ? {
                                  type: 'ref',
                                  id: item.node.loc,
                                  path: { type: 'child', at: i },
                              }
                            : {
                                  type: 'horiz',
                                  children: [
                                      item.input
                                          ? {
                                                type: 'ref',
                                                id: item.input.loc,
                                                path: { type: 'child', at: i },
                                            }
                                          : { type: 'blinker', loc: 'start' },
                                      {
                                          type: 'punct',
                                          color: 'red',
                                          text: ' : ',
                                      },
                                      item.output
                                          ? {
                                                type: 'ref',
                                                id: item.output.loc,
                                                path: { type: 'child', at: i },
                                            }
                                          : { type: 'blinker', loc: 'start' },
                                      {
                                          type: 'punct',
                                          color: 'white',
                                          text: ' ',
                                      },
                                      {
                                          type: 'text',
                                          text:
                                              item.input &&
                                              results[item.input.loc] != null
                                                  ? equal(
                                                        results[item.input.loc]
                                                            ?.expected,
                                                        results[item.input.loc]
                                                            ?.found,
                                                    ) + ''
                                                  : //   JSON.stringify(
                                                    //         results[item.input.loc],
                                                    //     )
                                                    'No results',
                                      },
                                  ],
                              },
                ),
            ],
        };
    },
};
