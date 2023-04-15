import { applyInferMod, infer } from '../../src/infer/infer';
import { autoCompleteIfNeeded, splitGraphemes } from '../../src/parse/parse';
import { AutoCompleteReplace } from '../../src/to-ast/Ctx';
import { MNode, Map } from '../../src/types/mcst';
import { paste } from '../mods/clipboard';
import {
    State,
    StateChange,
    applyUpdate,
    getKeyUpdate,
} from '../mods/getKeyUpdate';
import { Path } from '../mods/path';
import { Action, UIState, isRootPath } from './ByHand';
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

export const reduce = (state: UIState, action: Action): UIState => {
    const update = actionToUpdate(state, action);
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
        case 'update': {
            const prev = state.at[0];
            // Here's where the real work happens.
            if (update.autoComplete && !state.menu?.dismissed) {
                state = {
                    ...state,
                    ...autoCompleteIfNeeded(state, state.ctx.results.display),
                };
                verifyLocs(state.map, 'autocomplete');
            }
            state = { ...state, ...applyUpdate(state, 0, update) };
            verifyLocs(state.map, 'apply update');
            if (update.type === 'select' && !update.autoComplete) {
                return state;
            }
            let { ctx, map, exprs } = getCtx(state.map, state.root);
            verifyLocs(state.map, 'get ctx');
            state.map = map;
            state.ctx = ctx;
            if (update.autoComplete) {
                for (let i = 0; i < 10; i++) {
                    if (i > 8) {
                        throw new Error(`why so manyy inference`);
                    }
                    const mods = infer(exprs, ctx, state.map);
                    const modded = Object.keys(mods);
                    if (!modded.length) {
                        break;
                    }
                    console.log('3️⃣ infer mods', mods);
                    modded.forEach((id) => {
                        applyInferMod(mods[+id], state.map, state.nidx, +id);
                        verifyLocs(state.map, 'apply infer mod');
                        console.log(state.map[+id]);
                    });
                    ({ ctx, map, exprs } = getCtx(state.map, state.root));
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
        }
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
        if (+k !== map[+k].loc.idx) {
            console.log(+k, map[+k].loc.idx);
            // debugger;
            console.error(
                new Error(`loc has the wrong loc! during ${message}`),
            );
        }
    });
};
