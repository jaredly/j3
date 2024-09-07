import React from 'react';
import { Action, MetaDataMap, NamespacePlugin } from '../UIState';
import { NNode } from '../../../src/state/nestedNodes/NNode';
import equal from 'fast-deep-equal';
import { Path } from '../../store';
import { fromMCST, toMCST } from '../../../src/types/mcst';
import { newNodeAfter, newNodeBefore } from '../../../src/state/newNodeBefore';
import { newBlank, newId, newListLike } from '../../../src/state/newNodes';
import { useGetStore } from '../store/StoreCtx';
import { highlightIdxs } from '../highlightIdxs';
import { Data, Expr, parse, findLastIndex, LineFixture } from './Data';
import { valueToString } from '../../ide/ground-up/valueToString';
import { Node } from '../../../src/types/cst';
import { valueToNode } from '../../ide/ground-up/bootstrap';
import { UpdateMap } from '../../../src/types/mcst';
import { reLoc } from '../../../src/state/clipboard';

export const fixturePlugin: NamespacePlugin<any, Data<Expr>, any> = {
    id: 'fixture',
    title: 'Fixture tests',
    newNodeAfter(path, map, nsMap, nidx) {
        const tid = path.findIndex((p) => p.type === 'ns-top');
        if (tid === -1) return null;
        const node = fromMCST(path[tid + 1].idx, map);
        const parsed = parse(node, () => null);
        if (!parsed) return null;
        const cidx = findLastIndex(path, (p) => p.type === 'child');
        if (cidx === -1) return null;
        const child = path[cidx] as Extract<Path, { type: 'child' }>;

        // cursor is in the "test" section, and we need to make a new first fixture
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

        // Cursor is in a single-line fixture (probably a comment), make a new fixture after it
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

        // Cursor is in the output section of a fixture, need to make a new fixture after it.
        for (let i = 0; i < parsed.fixtures.length; i++) {
            const fx = parsed.fixtures[i];
            // console.log('child', child.idx, fx.loc);
            if (child.idx === fx.loc && child.at === 2) {
                const loc = path.slice(0, cidx - 1).concat([
                    // { type: 'child', idx: child.idx, at: 2 },
                    { type: 'child', idx: parsed.fxid, at: i },
                ]);
                // console.log('new loc', loc);
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

        // console.log(child.idx, parsed.test?.node.loc);

        // console.log('parsed', path, node, parsed);
        return null;
    },

    render(
        data: Data<Expr>,
        results: {
            [key: number]: { expected: any; found: any; error?: string };
        },
        store,
    ): NNode | void {
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
                                                              node: (
                                                                  <StatusMessage
                                                                      item={
                                                                          item
                                                                      }
                                                                      results={
                                                                          results
                                                                      }
                                                                      dispatch={
                                                                          store.dispatch
                                                                      }
                                                                      valueToString={
                                                                          store.getEvaluator()
                                                                              ?.valueToString ??
                                                                          valueToString
                                                                      }
                                                                      valueToNode={
                                                                          store.getEvaluator()
                                                                              ?.valueToNode ??
                                                                          valueToNode
                                                                      }
                                                                  />
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

function StatusMessage({
    item,
    results,
    dispatch,
    valueToString,
    valueToNode,
}: {
    item: LineFixture<any>;
    results: {
        [key: number]: {
            expected: any;
            found: any;
            error?: string | undefined;
        };
    };
    dispatch: React.Dispatch<Action>;
    valueToString: (v: any) => string;
    valueToNode: (v: any) => Node | null;
}): JSX.Element | null {
    const store = useGetStore();

    if (!item.input) return <span style={{ color: 'purple' }}>no input</span>;
    const res = results[item.input.node.loc];
    if (!res) return null;
    if (res.error)
        return <span style={{ color: 'red' }}>{highlightIdxs(res.error)}</span>;
    if (!equal(res.expected, res.found)) {
        return (
            <span
                style={{ color: 'purple', cursor: 'pointer' }}
                onMouseDown={(evt) => evt.stopPropagation()}
                onClick={(evt) => {
                    evt.stopPropagation();
                    // So ... we want .... the .. evaluator? to tell us, how to turn a [value]
                    // into a [CST]. Right? Seems about right.
                    // console.log(res.found);
                    // dispatch({
                    //     type: 'select',
                    //     at: [
                    //         {
                    //             start: [
                    //                 {
                    //                     type: 'start',
                    //                     idx: item.output!.node.loc,
                    //                 },
                    //             ],
                    //             end: [
                    //                 { type: 'end', idx: item.output!.node.loc },
                    //             ],
                    //         },
                    //     ],
                    // });
                    const node = valueToNode(res.found);
                    if (node) {
                        const fixed = reLoc(node, store.getState().nidx);
                        fixed.loc = item.output!.node.loc;
                        const map: UpdateMap = {};
                        toMCST(fixed, map);
                        dispatch({
                            type: 'update',
                            map,
                            selection: store.getState().at[0].start,
                        });
                    }
                    // dispatch({
                    //     type: 'paste',
                    //     items: [
                    //         node == null
                    //             ? {
                    //                   type: 'text',
                    //                   trusted: false,
                    //                   text: valueToString(res.found),
                    //               }
                    //             : {
                    //                   type: 'nodes',
                    //                   nodes: [node],
                    //               },
                    //     ],
                    // });
                }}
            >
                {valueToString(results[item.input.node.loc]?.found)}
            </span>
        );
    }
    return null;
}

function statusIndicator(
    item: LineFixture<any>,
    results: { [key: number]: { expected: any; found: any; error?: string } },
): string {
    if (!item.input || !item.output) {
        return '🚧 ';
    }
    const res = results[item.input.node.loc];
    if (!res) {
        return '🌀';
    }
    if (res.error) {
        return '🛑 ';
    }
    return equal(res.expected, res.found) ? '✅ ' : '🚨 ';
}
