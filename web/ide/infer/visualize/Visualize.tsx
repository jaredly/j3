import React, { useEffect, useMemo, useState } from 'react';
import { parseByCharacter } from '../../../../src/parse/parse';
import { Env } from '../../../../src/to-ast/library';
import { Node as CNode } from '../../../../src/types/cst';
import { ListLikeContents } from '../../../../src/types/mcst';
import { useLocalStorage } from '../../../Debug';
import { Root } from '../../../custom/Root';
import { calcResults, stateFromMap } from '../../Test';
import { TraceKind, Tree, algos } from '../types';
import { Node } from './Tree';

const fixtures = [
    `(+ 1 2)`,
    `(let [x 2] (+ 2 x))`,
    `(fn [x] (+ 2 x))`,
    `(fn [x] (let [y x] (+ 2 y)))`,
    `(fn [x y] (+ (x (+ y 2)) 3))`,
    `(fn [a] (let [x (fn [x] x)] (let [y (x (+ a 2))] (x "hi"))))`,
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
}: {
    fix: string;
    alg: string;
    focus: boolean;
    setFocus: () => void;
}) => {
    const [t, state] = useMemo(() => {
        const res = parseByCharacter(fix.replaceAll(/\n\s*/g, ' '), null);
        console.log('doing a state');
        return [Date.now(), stateFromMap(res.map)];
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

    const [_, setTick] = useState(0);

    const h = 10;
    const m = 4;

    const [at, setAt] = useState(-1);

    const kindColor: Partial<Record<TraceKind, string>> = {
        'infer:end': 'red',
        'infer:start': '#55f',
        'tvar:new': 'green',
        'type:fixed': 'orange',
        'type:free': '#800080',
        'type:partial': '#c000c0',
    };

    const trace = results.tops[tops[0]].data;
    const focus = trace[at]?.locs;
    let traceState = trace[at]?.state;
    for (let i = at; i >= 0 && !traceState; i--) {
        traceState = trace[i]?.state;
    }

    const { colors, borders } = useMemo(() => {
        const colors: { [loc: number]: string } = {};
        const borders: { [loc: number]: string } = {};
        trace.slice(0, at + 1).forEach((line) => {
            line.locs.forEach((loc) => {
                // if (line.kind.startsWith('type')) {
                if (kindColor[line.kind]) {
                    colors[loc] = kindColor[line.kind]!;
                }
                // } else {
                //     borders[loc] = kindColor[line.kind];
                // }
            });
        });
        return { colors, borders };
    }, [results, at]);

    let missing = false;
    const levels =
        state.regs &&
        data?.map((level, i) => (
            <div key={i} style={{ height: h + m }}>
                {level.map((node, i) => {
                    const rf = state.regs![node.loc];
                    if (!rf) {
                        missing = true;
                        // return 'nobox' + node.loc;
                        return;
                    }
                    let left;
                    let right;
                    if (rf.main) {
                        const box = rf.main.node.getBoundingClientRect();
                        left = box.left;
                        right = box.right;
                    }
                    if (rf.start) {
                        left = rf.start.node.getBoundingClientRect().left;
                    }
                    if (rf.end) {
                        right = rf.end.node.getBoundingClientRect().right;
                    }
                    if (left == null || right == null) {
                        missing = true;
                        return;
                    }
                    return (
                        <div
                            key={i}
                            style={{
                                position: 'absolute',
                                left,
                                width: right - left,
                                backgroundColor: colors[node.loc] ?? 'blue',
                                borderColor: focus?.includes(node.loc)
                                    ? 'white'
                                    : 'transparent',
                                borderWidth: 2,
                                transition:
                                    '.2s ease border-color, background-color',
                                borderStyle: 'solid',
                                height: h,
                                borderRadius: h / 2,
                            }}
                        >
                            {/* {node.name}:{node.loc} */}
                        </div>
                    );
                })}
            </div>
        ));
    if (missing) {
        console.log('um', state.regs);
    }

    useEffect(() => {
        // setTimeout(() => {
        //     setTick((t) => t + 1);
        // }, 100);
        setTick((t) => t + 1);
    }, [missing]);

    return (
        <div>
            <div style={{ display: 'flex' }}>
                <div
                    // onClick={() => setFocus()}
                    style={{
                        // flex: 1,
                        // border: focus
                        //     ? '1px solid magenta'
                        //     : '1px solid transparent',
                        position: 'relative',
                        paddingRight: 16,
                        margin: 2,
                    }}
                >
                    <div style={{ marginBottom: -20, paddingTop: m }}>
                        {levels}
                    </div>
                    <Root
                        key={t}
                        state={state}
                        dispatch={() => {}}
                        results={results}
                        tops={tops}
                        showTop={() => results.tops[tops[0]].summary}
                        debug={false}
                    />
                </div>
                <div style={{ width: 200 }}>
                    <pre>{traceState}</pre>
                </div>
            </div>
            <div
                style={{
                    paddingLeft: 40,
                    marginBottom: 32,
                }}
            >
                <input
                    type="range"
                    value={at}
                    min={-1}
                    max={trace.length}
                    onChange={(evt) => setAt(+evt.target.value)}
                    style={{ outline: 'none' }}
                    onKeyDown={(evt) => {
                        if (evt.key === 'Enter') {
                            let iv = setInterval(() => {
                                setAt((m) => {
                                    if (m >= trace.length) {
                                        clearInterval(iv);
                                        return m;
                                    }
                                    return m + 1;
                                });
                            }, 800);
                        }
                    }}
                />
                <div>{trace[at]?.text ?? '.'}</div>
            </div>
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
