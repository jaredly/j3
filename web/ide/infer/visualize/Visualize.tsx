import React, { useEffect, useMemo, useReducer, useState } from 'react';
import { layout } from '../../../../src/layout';
import { emptyMap, parseByCharacter } from '../../../../src/parse/parse';
import {
    StateChange,
    applyUpdate,
    getKeyUpdate,
    isRootPath,
} from '../../../../src/state/getKeyUpdate';
import { Ctx, Env } from '../../../../src/to-ast/library';
import { ListLikeContents, fromMCST } from '../../../../src/types/mcst';
import { Cursors } from '../../../custom/Cursors';
import { HiddenInput } from '../../../custom/HiddenInput';
import { Hover, calc } from '../../../custom/Hover';
import { Root } from '../../../custom/Root';
import { Action, NUIState, UpdatableAction } from '../../../custom/UIState';
import {
    UIStateChange,
    calcHistoryItem,
    undoRedo,
} from '../../../custom/reduce';
import { verticalMove } from '../../../custom/verticalMove';
import { calcResults, loadState, stateFromMap } from '../../Test';
import { useLocalStorage } from '../../../Debug';
import { Tree, algos } from '../types';
import { Node } from './Tree';
import { transformNode } from '../../../../src/types/transform-cst';
import { Node as CNode } from '../../../../src/types/cst';
import { expr } from '../hm/j';

const fixtures = [
    `(+ 1 2)`,
    `(let [x 2] (+ 2 x))`,
    `(fn [x] (+ 2 x))`,
    `(fn [x] (let [y x] (+ 2 y)))`,
    `(let [x (fn [v] (if (> v 2) v (x (+ v 1))))] (x 0))`,
];

export const Visualize = ({ env }: { env: Env }) => {
    const [alg, setAlg] = useLocalStorage('test:infer-alg', () => 'thih');
    const [focus, setFocus] = useLocalStorage('test:vis-focus', () => 0);

    return (
        <div>
            <div>
                {Object.keys(algos).map((algo) => (
                    <button
                        key={algo}
                        onClick={() => setAlg(algo)}
                        style={algo === alg ? { fontWeight: 'bold' } : {}}
                    >
                        {algo}
                    </button>
                ))}
            </div>

            {fixtures.map((fix, i) => (
                <Fixture
                    fix={fix}
                    key={i}
                    alg={alg}
                    focus={i === focus}
                    setFocus={() => setFocus(i)}
                />
            ))}
        </div>
    );
};

const Fixture = ({
    fix,
    alg,
    focus,
    setFocus,
}: {
    fix: string;
    alg: string;
    focus: boolean;
    setFocus: () => void;
}) => {
    const state = useMemo(() => {
        const res = parseByCharacter(fix.replaceAll(/\n\s*/g, ' '), null);
        return stateFromMap(res.map);
    }, []);
    const results = useMemo(
        () => calcResults(state, algos[alg], false),
        [alg, state.map],
    );
    const tops = (state.map[state.root] as ListLikeContents).values;

    const data = useMemo(() => {
        const top = results.tops[tops[0]];
        if (!top.expr) {
            return []; //{ name: 'error', children: [] };
        }
        console.log(top);
        const tree = algos[alg].toTree?.(top.expr);
        if (!tree) return [];
        const levels: Tree[][] = [];
        const leaves: Tree[] = [];
        const visit = (node: Tree, l: number) => {
            if (!levels[l]) {
                levels[l] = [];
            }
            if (!node.children.length) {
                leaves.push(node);
                return;
            }
            levels[l].push(node);
            node.children.map((c) => visit(c, l + 1));
        };
        visit(tree, 0);
        levels.push(leaves);
        return levels.filter((l) => l.length);
    }, [state.map, alg, results]);

    const [refs, setRefs] = useState(null as null | NUIState['regs']);
    // useEffect(() => {
    //     setRefs(state.regs);
    // }, [state.map]);

    const h = 10;
    const m = 4;

    return (
        <div
            onClick={() => setFocus()}
            style={{
                border: focus ? '1px solid magenta' : '1px solid transparent',
                position: 'relative',
            }}
            ref={(node) => {
                if (!refs) {
                    setRefs(state.regs);
                }
            }}
        >
            {/* <pre>{fix}</pre> */}
            {refs && (
                <div style={{ marginBottom: -20, paddingTop: m }}>
                    {data?.map((level, i) => (
                        <div
                            key={i}
                            style={{
                                height: h + m,
                                // backgroundColor: 'red',
                                // marginBottom: 2,
                            }}
                        >
                            {level.map((node, i) => {
                                const rf = refs![node.loc];
                                if (!rf) return 'nobox' + node.loc;
                                let left;
                                let right;
                                if (rf.main) {
                                    const box =
                                        rf.main.node.getBoundingClientRect();
                                    left = box.left;
                                    right = box.right;
                                }
                                if (rf.start) {
                                    left =
                                        rf.start.node.getBoundingClientRect()
                                            .left;
                                }
                                if (rf.end) {
                                    right =
                                        rf.end.node.getBoundingClientRect()
                                            .right;
                                }
                                if (left == null || right == null) {
                                    return 'badn';
                                }
                                // const box = rf?.main?.node.getBoundingClientRect();
                                return (
                                    <div
                                        key={i}
                                        style={{
                                            position: 'absolute',
                                            left,
                                            width: right - left,
                                            backgroundColor: 'blue',
                                            height: h,
                                            borderRadius: h / 2,
                                        }}
                                    >
                                        {/* {node.name}:{node.loc} */}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            )}
            <Root
                // ref={node => {
                //     if
                // }}
                state={state}
                dispatch={() => {}}
                results={results}
                tops={tops}
                showTop={() => results.tops[tops[0]].summary}
                debug={false}
            />
            {/* {focus && data ? <Tree data={data} /> : null} */}
            <pre>
                {results.tops[tops[0]].data
                    .map((row) => JSON.stringify(row))
                    .join('\n')}
            </pre>
        </div>
    );
};

type Item = { node: CNode; children: Item[] };

const nodeName = (node: CNode) => {
    switch (node.type) {
        case 'identifier':
            return node.text;
        case 'array':
            return '[ ]';
        case 'record':
            return '{ }';
        case 'list':
            return '( )';
    }
    return node.type;
};

const itemToData = (item: Item): Node => {
    return {
        name: nodeName(item.node),
        children: item.children.map(itemToData),
    };
};

// const toTree = (map: NUIState['map'], root: number): Node => {
//     const byPath: { [key: string]: Item } = {};
//     transformNode(fromMCST(root, map), {
//         pre(node, path) {
//             const key = JSON.stringify(path);
//             byPath[key] = { node, children: [] };
//             if (path.length > 0) {
//                 const parent = JSON.stringify(path.slice(0, -1));
//                 byPath[parent].children.push(byPath[key]);
//             }
//         },
//     });
//     return itemToData(byPath['[]']);
// };

// const showExpr = (expr: expr): Node => {
//     return { name: 'ok', children: [{ name: JSON.stringify(expr) }] };
// };
