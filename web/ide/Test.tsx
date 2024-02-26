import React, { useEffect, useMemo, useReducer, useState } from 'react';
import { layout } from '../../src/layout';
import { emptyMap } from '../../src/parse/parse';
import {
    StateChange,
    applyUpdate,
    getKeyUpdate,
    isRootPath,
} from '../../src/state/getKeyUpdate';
import { CompilationResults, Ctx, Env } from '../../src/to-ast/library';
import { ListLikeContents, fromMCST } from '../../src/types/mcst';
import { Cursors } from '../custom/Cursors';
import { HiddenInput } from '../custom/HiddenInput';
import { Hover, calc } from '../custom/Hover';
import { Root } from '../custom/Root';
import { Action, NUIState, UpdatableAction } from '../custom/UIState';
import { UIStateChange, calcHistoryItem, undoRedo } from '../custom/reduce';
import { verticalMove } from '../custom/verticalMove';

// These register themselves into `./infer/types:algos`
import './infer/hm/j';
import './infer/hmx/hmx';
import './infer/algw-cr';
import './infer/mini';
import './infer/thih';

import { useLocalStorage } from '../Debug';
import { paste } from '../../src/state/clipboard';
import { Algo, Trace, algos } from './infer/types';

const names = ['what', 'w', 'w2', '10'];

export const Test = ({ env }: { env: Env }) => {
    const k = 'test-infer-' + document.location.hash.slice(1);
    // const [k, setK] = useState(names[0]);

    const [alg, setAlg] = useLocalStorage('test:infer-alg', () => 'j');

    const { typToString } = algos[alg];

    const [state, dispatch] = useReducer(reduce, null, (): NUIState => {
        return loadState(k);
    });

    const [debug, setDebug] = useState(true);

    useEffect(() => {
        if (state.at.length) {
            localStorage.setItem(k, JSON.stringify(state.map));
        }
    }, [state, k]);

    const tops = (state.map[state.root] as ListLikeContents).values;

    const results = useMemo(() => {
        return calcResults(state, algos[alg]);
    }, [state.map, k, alg]);

    const start = state.at.length ? state.at[0].start : null;
    const selTop = start?.[1].idx;
    // @ts-ignore
    window.data = selTop ? results.tops[selTop].data : null;

    return (
        <div>
            {/* <div>
                {names.map((n) => (
                    <button
                        onClick={() => {
                            document.location.hash = '#' + n;
                            document.location.reload();
                        }}
                        key={n}
                    >
                        {n}
                    </button>
                ))}
            </div> */}
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
            <HiddenInput
                hashNames={{}}
                state={state}
                dispatch={dispatch}
                menu={undefined}
                display={{}}
            />
            <Root
                state={state}
                dispatch={dispatch}
                tops={tops}
                debug={false}
                showTop={(top) =>
                    (results.tops[top].failed ? '🚨 ' : '') +
                    results.tops[top].summary
                }
                results={results}
            />
            <button
                onClick={() => setDebug(!debug)}
                style={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                }}
            >
                {debug ? 'Debug on' : 'Debug off'}
            </button>
            <Hover
                state={state}
                dispatch={dispatch}
                calc={() => {
                    for (let i = state.hover.length - 1; i >= 0; i--) {
                        const last = state.hover[i].idx;
                        const typ = results.typs[last];
                        if (typ) {
                            return [{ idx: last, text: typToString(typ) }];
                        }
                    }
                    return [];
                }}
            />
            <Cursors at={state.at} regs={state.regs} />
            {/* {selTop ? JSON.stringify(results.tops[selTop].data) : null} */}
            {selTop != null ? <ViewJson v={results.tops[selTop].data} /> : null}
            {/* {JSON.stringify(state.at)} */}
            {/* <div>{JSON.stringify(state.hover)}</div> */}
        </div>
    );
};

const white = (n: number) => ''.padStart(n, ' ');

const stringify = (v: any, level: number, max: number): string => {
    if (level === max) {
        return JSON.stringify(v);
    }
    const id = white(level * 2);
    if (Array.isArray(v)) {
        if (!v.length) return '[]';
        return `[\n${v
            .map((n) => id + stringify(n, level + 1, max))
            .join('\n')}\n${white(level * 2 - 2)}]`;
    }
    if (v && typeof v === 'object') {
        const items = Object.entries(v);
        if (!items.length) return '{}';
        return `{\n${items
            .map(([k, v]) => id + `${k}: ${stringify(v, level + 1, max)}`)
            .join('\n')}\n${white(level * 2 - 2)}}`;
    }
    return JSON.stringify(v);
};

const ViewJson = ({ v }: { v: any[] }) => {
    const [level, setLevel] = useLocalStorage('view-json', () => 1);
    return (
        <div>
            <input
                type="range"
                min="1"
                max="30"
                style={{ width: 400 }}
                value={level}
                onChange={(evt) => setLevel(+evt.target.value)}
            />
            {v.map((item, i) => (
                <pre key={i}>{stringify(item, 1, 1 + level)}</pre>
            ))}
        </div>
    );
};

export const reduce = (state: NUIState, action: Action): NUIState => {
    if (action.type === 'undo' || action.type === 'redo') {
        return undoRedo(state, action.type);
    }
    if (action.type === 'yank') {
        return state;
    }
    // if (action.type === 'reset') {
    //     return action.state;
    // }
    const update = actionToUpdate(state, action);
    if (!update) {
        return state;
    }
    const next = reduceUpdate(state, update);
    const item = calcHistoryItem(state, next, '');
    if (item) {
        next.history = state.history.concat([item]);
    }
    return next;
};

export const reduceUpdate = (
    state: NUIState,
    update: StateChange | UIStateChange,
): NUIState => {
    if (!update) {
        return state;
    }
    switch (update.type) {
        case 'full-select':
            return { ...state, at: update.at, menu: undefined };
        case 'ui':
            return {
                ...state,
                clipboard: update.clipboard ?? state.clipboard,
                hover: update.hover ?? state.hover,
            };
        case 'menu':
            return { ...state, menu: update.menu };
        case 'select':
        case 'update':
            state = { ...state, ...applyUpdate(state, 0, update) };
            return state;
        case 'namespace-rename':
            console.warn('ignoring namespace rename');
            return state;
        // return state;
        // case 'collapse':
        //     return state;
        default:
            const _: never = update;
            throw new Error('nope update');
    }
};

const actionToUpdate = (
    state: NUIState,
    action: UpdatableAction,
): StateChange | UIStateChange | void => {
    switch (action.type) {
        case 'hover':
            return { type: 'ui', hover: action.path };
        case 'menu':
            return { type: 'menu', menu: { selection: action.selection } };
        // case 'menu-select': {
        //     const idx = action.path[action.path.length - 1].idx;
        //     return autoCompleteUpdate(idx, state.map, action.path, action.item);
        // }
        // case 'copy':
        //     return {
        //         type: 'ui',
        //         clipboard: [action.items, ...state.clipboard],
        //     };
        case 'key':
            if (!state.at.length) {
                return;
            }
            if (action.key === 'ArrowUp' || action.key === 'ArrowDown') {
                return verticalMove(
                    { ...state, menu: undefined },
                    action.key === 'ArrowUp',
                    action.mods,
                );
            }
            if (action.key === 'Escape') {
                console.log('dismiss');
                return {
                    type: 'menu',
                    menu: { dismissed: true, selection: 0 },
                };
            }
            return getKeyUpdate(
                action.key,
                state.map,
                state.at[0],
                // TODO do I want some hashnames?
                {},
                state.nidx,
                action.mods,
            );
        case 'select':
            // Ignore attempts to select the root node
            if (action.at.some((at) => isRootPath(at.start))) {
                return;
            }
            return {
                type: 'full-select',
                at: action.add ? state.at.concat(action.at) : action.at,
            };
        case 'paste': {
            const res = paste(state, {}, action.items, false);
            console.log(res);
            return res;
        }
        // case 'namespace-rename':
        //     return action;
    }
};

export function calcResults(
    state: NUIState,
    { builtins, getTrace, infer, parse, typToString }: Algo<any, any, any>,
    doLayout = true,
) {
    const tops = (state.map[state.root] as ListLikeContents).values;
    const results = newResults();

    tops.forEach((top) => {
        const node = fromMCST(top, state.map);
        const errors = {};
        const expr = parse(node, { errors, display: results.display });
        if (expr) {
            try {
                const typ = infer(builtins, expr, {
                    display: results.display,
                    typs: results.typs,
                });
                const trace = getTrace();
                // console.log(typ);
                results.tops[top] = {
                    summary: typToString(typ),
                    data: trace,
                    failed: false,
                    expr,
                };
            } catch (err) {
                // console.log('no typ sorry', err);
                results.tops[top] = {
                    summary: 'Type Error: ' + (err as Error).message,
                    data: getTrace(),
                    failed: true,
                };
            }
        } else {
            results.tops[top] = {
                summary: 'not parse: ' + Object.values(errors).join('; '),
                data: getTrace(),
                failed: true,
            };
        }

        if (doLayout) {
            layout(top, 0, state.map, results.display, results.hashNames, true);
        }
    });

    return results;
}

export function newResults(): CompilationResults & {
    tops: {
        [key: number]: {
            summary: string;
            data: Trace[];
            failed: boolean;
            expr?: any;
        };
    };
    typs: { [loc: number]: any };
} {
    return {
        display: {},
        errors: {},
        globalNames: {},
        hashNames: {},
        localMap: {
            terms: {},
            types: {},
        },
        mods: {},
        toplevel: {},
        tops: {},
        typs: {},
    };
}

export function loadState(k: string): NUIState {
    const saved = localStorage.getItem(k);
    const map = saved ? JSON.parse(saved) : emptyMap();

    let idx = Object.keys(map).reduce((a, b) => Math.max(a, +b), 0) + 1;
    return {
        map,
        root: -1,
        history: [],
        nidx: () => idx++,
        cards: [],
        clipboard: [],
        hover: [],
        regs: {},
        at: [],
    };
}

export function stateFromMap(map: NUIState['map']): NUIState {
    let idx = Object.keys(map).reduce((a, b) => Math.max(a, +b), 0) + 1;
    return {
        map,
        root: -1,
        history: [],
        cards: [],
        nidx: () => idx++,
        clipboard: [],
        hover: [],
        regs: {},
        at: [],
    };
}
