import React, { useReducer, useState } from 'react';
import { emptyMap } from '../../src/parse/parse';
import { Env, HistoryItem, Sandbox } from '../../src/to-ast/library';
import { ListLikeContents } from '../../src/types/mcst';
import { Root } from '../custom/Root';
import { Action, NUIState, UIState, UpdatableAction } from '../custom/UIState';
import { sandboxState } from './SandboxView';
import { HiddenInput } from '../custom/HiddenInput';
import { useMenu } from '../custom/ByHand';
import { Cursors } from '../custom/Cursors';
import { UIStateChange, calcHistoryItem, undoRedo } from '../custom/reduce';
import {
    State,
    StateChange,
    applyUpdate,
    getKeyUpdate,
    isRootPath,
} from '../../src/state/getKeyUpdate';
import { verticalMove } from '../custom/verticalMove';
import { redoItem, undoItem } from '../../src/to-ast/history';

const meta: Sandbox['meta'] = {
    id: 'id',
    title: 'Title',
    created_date: Date.now() / 1000,
    updated_date: Date.now() / 1000,
    deleted_date: null,
    version: 0,
    settings: { namespace: ['sandbox', 'id'], aliases: [] },
    node_count: 0,
};

export const Test = ({ env }: { env: Env }) => {
    const [state, dispatch] = useReducer(reduce, null, (): NUIState => {
        const map = emptyMap();
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

    const tops = (state.map[state.root] as ListLikeContents).values;

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
                showTop={() => null}
                results={{
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
                }}
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
            <Cursors at={state.at} regs={state.regs} />
            Here we are
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
): StateChange | void => {
    switch (action.type) {
        // case 'hover':
        //     return { type: 'ui', hover: action.path };
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
