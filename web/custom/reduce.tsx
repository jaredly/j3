import { applyInferMod, infer } from '../../src/infer/infer';
import {
    autoCompleteIfNeeded,
    getAutoCompleteUpdate,
    splitGraphemes,
} from '../../src/parse/parse';
import { AutoCompleteReplace } from '../../src/to-ast/Ctx';
import { MNode, Map } from '../../src/types/mcst';
import { paste } from '../mods/clipboard';
import {
    State,
    StateChange,
    StateSelect,
    StateUpdate,
    applyUpdate,
    getKeyUpdate,
} from '../mods/getKeyUpdate';
import { Path } from '../mods/path';
import { UpdateMap } from '../store';
import { isRootPath } from './ByHand';
import { Action, UIState } from './UIState';
import { getCtx } from './getCtx';
import { verticalMove } from './verticalMove';

type UIStateChange =
    | { type: 'ui'; clipboard?: UIState['clipboard']; hover?: UIState['hover'] }
    | { type: 'menu'; menu: State['menu'] }
    | { type: 'full-select'; at: State['at'] };

const actionToUpdate = (
    state: UIState,
    action: Action,
): StateChange | UIStateChange => {
    switch (action.type) {
        case 'hover':
            return { type: 'ui', hover: action.path };
        case 'menu':
            return { type: 'menu', menu: { selection: action.selection } };
        case 'menu-select': {
            const idx = action.path[action.path.length - 1].idx;
            return autoCompleteUpdate(idx, state.map, action.path, action.item);
        }
        case 'copy':
            return {
                type: 'ui',
                clipboard: [action.items, ...state.clipboard],
            };
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
                state.ctx.results.hashNames,
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
            return paste(state, state.ctx, action.items);
        }
    }
};

export const updateWithAutocomplete = (
    state: UIState,
    update: StateUpdate | StateSelect,
) => {
    const prev = state.at[0];
    // Here's where the real work happens.
    if (update.autoComplete && !state.menu?.dismissed) {
        const aupdate = getAutoCompleteUpdate(state, state.ctx.results.display);
        if (aupdate) {
            state = { ...state, ...applyUpdate(state, 0, aupdate) };
        }
        verifyLocs(state.map, 'autocomplete');
    }
    state = { ...state, ...applyUpdate(state, 0, update) };
    verifyLocs(state.map, 'apply update');
    if (update.type === 'select' && !update.autoComplete) {
        return state;
    }
    let { ctx, map } = getCtx(state.map, state.root, state.ctx.global);
    verifyLocs(state.map, 'get ctx');
    state.map = map;
    state.ctx = ctx;

    if (update.autoComplete) {
        for (let i = 0; i < 10; i++) {
            const mods = infer(ctx, state.map);
            const modded = Object.keys(mods);
            if (!modded.length) {
                break;
            }
            if (i > 8) {
                console.log(mods);
                throw new Error(`why so manyy inference`);
            }
            console.log('3️⃣ infer mods', mods);
            modded.forEach((id) => {
                applyInferMod(mods[+id], state.map, state.nidx, +id);
                verifyLocs(state.map, 'apply infer mod');
                console.log(state.map[+id]);
            });
            ({ ctx, map } = getCtx(state.map, state.root, state.ctx.global));
            verifyLocs(state.map, 'get ctx');
            state.map = map;
            state.ctx = ctx;
        }
    }
    if (
        prev.start[prev.start.length - 1].idx !==
        state.at[0].start[state.at[0].start.length - 1].idx
    ) {
        state.menu = undefined;
    }
    return state;
};

export const prevMap = (map: Map, update: UpdateMap): UpdateMap => {
    const prev: UpdateMap = {};
    Object.keys(update).forEach((k) => {
        prev[+k] = map[+k] || null;
    });
    return prev;
};

export const reduce = (state: UIState, action: Action): UIState => {
    const update = actionToUpdate(state, action);
    const next = reduceUpdate(state, update);
    if (next.map !== state.map) {
        const update: UpdateMap = {};
        const prev: UpdateMap = {};
        let changed = false;
        Object.keys(next.map).forEach((k) => {
            if (next.map[+k] !== state.map[+k]) {
                changed = true;
                update[+k] = next.map[+k];
                prev[+k] = state.map[+k] || null;
            }
        });
        Object.keys(state.map).forEach((k) => {
            if (!next.map[+k]) {
                changed = true;
                update[+k] = null;
                prev[+k] = state.map[+k];
            }
        });
        if (changed) {
            next.history = state.history.concat([
                {
                    at: next.at,
                    prevAt: state.at,
                    prev,
                    map: update,
                    id: state.history.length
                        ? state.history[state.history.length - 1].id + 1
                        : 0,
                    ts: Date.now() / 1000,
                },
            ]);
        }
    }
    return next;
};

export const reduceUpdate = (
    state: UIState,
    update: StateChange | UIStateChange,
) => {
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
            return updateWithAutocomplete(state, update);
        default:
            let _: never = update;
            throw new Error('nope update');
    }
};

export function autoCompleteUpdate(
    idx: number,
    map: Map,
    path: Path[],
    item: AutoCompleteReplace,
): StateChange {
    if (!map[idx]) {
        console.log(idx, 'not in the map');
        debugger;
    }
    const current = map[idx];
    return {
        type: 'update',
        map: {
            [idx]: applyAutoUpdateToNode(current, item),
        },
        selection: path.slice(0, -1).concat([
            {
                idx,
                type: 'subtext',
                at: splitGraphemes(item.text).length,
            },
        ]),
        autoComplete: true,
    };
}

export function applyAutoUpdateToNode(
    current: MNode,
    item: AutoCompleteReplace,
): MNode {
    return current.type === 'array' && item.update.type === 'array-hash'
        ? { ...current, hash: item.update.hash }
        : item.update.type === 'accessText'
        ? {
              loc: current.loc,
              type: 'accessText',
              text: item.update.text,
          }
        : {
              loc: current.loc,
              type: 'hash',
              hash: item.update.hash,
          };
}

export function applyMenuItem(
    path: Path[],
    item: AutoCompleteReplace,
    state: State,
): StateChange {
    const idx = path[path.length - 1].idx;
    return autoCompleteUpdate(idx, state.map, path, item);
}

export const verifyLocs = (map: Map, message: string) => {
    Object.keys(map).forEach((k) => {
        if (+k !== map[+k].loc) {
            console.log(+k, map[+k].loc);
            // debugger;
            console.error(
                new Error(`loc has the wrong loc! during ${message}`),
            );
        }
    });
};
