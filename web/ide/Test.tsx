import React, { useEffect, useMemo, useReducer, useState } from 'react';
import { layout } from '../../src/layout';
import { emptyMap } from '../../src/parse/parse';
import {
    StateChange,
    applyUpdate,
    getKeyUpdate,
    isRootPath,
} from '../../src/state/getKeyUpdate';
import { Ctx, Env } from '../../src/to-ast/library';
import { ListLikeContents, fromMCST } from '../../src/types/mcst';
import { Cursors } from '../custom/Cursors';
import { HiddenInput } from '../custom/HiddenInput';
import { Hover, calc } from '../custom/Hover';
import { Root } from '../custom/Root';
import { Action, NUIState, UpdatableAction } from '../custom/UIState';
import { UIStateChange, calcHistoryItem, undoRedo } from '../custom/reduce';
import { verticalMove } from '../custom/verticalMove';
// import { infer, typ, typToString } from './infer/j';
// import { parse } from './infer/parse-j';
import { infer, typ, typToString } from './infer/hmx';
import { parse } from './infer/parse-hmx';
import { builtins } from './infer/j-builtins';

const k = `test-infer-w`;

export const Test = ({ env }: { env: Env }) => {
    const [state, dispatch] = useReducer(reduce, null, (): NUIState => {
        const saved = localStorage.getItem(k);
        const map = saved ? JSON.parse(saved) : emptyMap();

        let idx = Object.keys(map).reduce((a, b) => Math.max(a, +b), 0) + 1;
        return {
            map,
            root: -1,
            history: [],
            nidx: () => idx++,
            clipboard: [],
            hover: [],
            regs: {},
            at: [],
        };
    });
    const [debug, setDebug] = useState(true);

    useEffect(() => {
        if (state.at.length) {
            localStorage.setItem(k, JSON.stringify(state.map));
        }
    }, [state]);

    const tops = (state.map[state.root] as ListLikeContents).values;

    const results = useMemo(() => {
        const results: Ctx['results'] & {
            tops: { [key: number]: string };
            typs: { [loc: number]: typ };
        } = {
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

        tops.forEach((top) => {
            const node = fromMCST(top, state.map);
            const errors = {};
            const expr = parse(node, errors);
            if (expr) {
                try {
                    const typ = infer(builtins, expr, results.typs);
                    // console.log(typ);
                    results.tops[top] = typToString(typ);
                } catch (err) {
                    console.log('no typ sorry');
                    results.tops[top] = 'Type Error: ' + (err as Error).message;
                }
            } else {
                results.tops[top] = 'not parse';
            }

            layout(top, 0, state.map, results.display, results.hashNames, true);
        });

        return results;
    }, [state.map]);

    return (
        <div>
            <HiddenInput
                hashNames={{}}
                state={state}
                dispatch={dispatch}
                menu={undefined}
            />
            <Root
                state={state}
                dispatch={dispatch}
                tops={tops}
                debug={false}
                showTop={(top) => results.tops[top]}
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
                    const last = state.hover[state.hover.length - 1]?.idx;
                    if (last) {
                        const typ = results.typs[last];
                        if (typ) {
                            return [{ idx: last, text: typToString(typ) }];
                        }
                    }
                    return [];
                }}
            />
            <Cursors at={state.at} regs={state.regs} />
            Here we are
            {JSON.stringify(state.hover)}
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
        // case 'paste': {
        //     return paste(state, state.ctx, action.items);
        // }
        // case 'namespace-rename':
        //     return action;
    }
};
