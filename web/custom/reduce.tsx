import { autoCompleteIfNeeded, splitGraphemes } from '../../src/parse/parse';
import { paste } from '../mods/clipboard';
import { verticalMove } from './verticalMove';
import { UIState, Action, isRootPath, lidx } from './ByHand';
import { applyMods, getCtx } from './getCtx';
import { Path } from '../mods/path';
import { AutoCompleteReplace, Ctx } from '../../src/to-ast/Ctx';
import {
    State,
    StateUpdate,
    applyUpdate,
    getKeyUpdate,
} from '../mods/getKeyUpdate';
import { fromMCST } from '../../src/types/mcst';
import { nodeToExpr } from '../../src/to-ast/nodeToExpr';
import { Node } from '../../src/types/cst';
import { Expr } from '../../src/types/ast';
import { applyInferMod, infer } from '../../src/infer/infer';
import { StateChange } from '../mods/getKeyUpdate';

// export const reduce = (state: UIState, action: Action): UIState => {
//     const newState = reduceInner(state, action);
//     if (state.map !== newState.map) {
//         const ctx = getCtx(newState.map, newState.root);
//         return ctx ? { ...newState, ...ctx } : newState;
//     }
//     return newState;
// };

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
            return {
                type: 'update',
                map: {
                    [idx]: { loc: state.map[idx].loc, ...action.item.node },
                },
                selection: action.path.slice(0, -1).concat([
                    {
                        idx,
                        type: 'subtext',
                        at: splitGraphemes(action.item.text).length,
                    },
                ]),
                autoComplete: true,
            };
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
                state.ctx.display,
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
            return { ...state, at: update.at };
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
            // Here's where the real work happens.
            if (update.autoComplete) {
                state = { ...state, ...autoCompleteIfNeeded(state, state.ctx) };
            }
            state = { ...state, ...applyUpdate(state, 0, update) };
            let { ctx, map, exprs } = getCtx(state.map, state.root);
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
                    console.log('mods!', mods);
                    modded.forEach((id) => {
                        applyInferMod(mods[+id], state.map, state.nidx, +id);
                        console.log(state.map[+id]);
                    });
                    ({ ctx, map, exprs } = getCtx(state.map, state.root));
                    state.map = map;
                    state.ctx = ctx;
                }
            }
            return state;
        }
        default:
            let _: never = update;
            throw new Error('nope update');
    }
};

// @deprecated TODO REMOVE THIS, migrate to the reduce up here
export function applyMenuItem(
    path: Path[],
    item: AutoCompleteReplace,
    state: State,
    ctx: Ctx,
) {
    const idx = path[path.length - 1].idx;
    state = {
        ...state,
        at: [
            {
                start: path.slice(0, -1).concat([
                    {
                        idx,
                        type: 'subtext',
                        at: splitGraphemes(item.text).length,
                    },
                ]),
            },
        ],
        map: { ...state.map, [idx]: { loc: state.map[idx].loc, ...item.node } },
    };

    const root = fromMCST(state.root, state.map) as { values: Node[] };
    let exprs = root.values
        .map((node) =>
            node.type === 'blank' || node.type === 'comment'
                ? null
                : nodeToExpr(node, {
                      ...ctx,
                      display: {},
                      mods: {},
                      errors: {},
                  }),
        )
        .filter(Boolean) as Expr[];
    state = { ...state, map: { ...state.map } };
    applyMods(ctx, state.map);

    // Now we do like inference, right?
    const mods = infer(exprs, ctx, state.map);
    console.log('inferMods', mods);
    const keys = Object.keys(mods);
    // if (!keys.length) break;
    keys.forEach((id) => {
        applyInferMod(mods[+id], state.map, state.nidx, +id);
    });

    return state;
}
