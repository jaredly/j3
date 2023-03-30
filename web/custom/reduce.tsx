import { splitGraphemes } from '../../src/parse/parse';
import { paste } from '../mods/clipboard';
import { verticalMove } from './verticalMove';
import { UIState, Action, handleKey, isRootPath, lidx } from './ByHand';
import { applyMods, getCtx } from './getCtx';
import { Path } from '../mods/path';
import { AutoCompleteReplace, Ctx } from '../../src/to-ast/Ctx';
import { State } from '../mods/getKeyUpdate';
import { fromMCST } from '../../src/types/mcst';
import { nodeToExpr } from '../../src/to-ast/nodeToExpr';
import { Node } from '../../src/types/cst';
import { Expr } from '../../src/types/ast';
import { applyInferMod, infer } from '../../src/infer/infer';

export const reduce = (state: UIState, action: Action): UIState => {
    const newState = reduceInner(state, action);
    if (state.map !== newState.map) {
        const ctx = getCtx(newState.map, newState.root);
        return ctx ? { ...newState, ...ctx } : newState;
    }
    return newState;
};

const reduceInner = (state: UIState, action: Action): UIState => {
    switch (action.type) {
        case 'hover':
            return { ...state, hover: action.path };
        case 'menu':
            return { ...state, menu: { selection: action.selection } };
        case 'menu-select': {
            return {
                ...state,
                ...applyMenuItem(action.path, action.item, state, state.ctx),
            };
        }
        case 'copy':
            return { ...state, clipboard: [action.items, ...state.clipboard] };
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
                return { ...state, menu: { dismissed: true, selection: 0 } };
            }
            const newState = handleKey(state, action.key, action.mods);
            if (newState) {
                if (newState.at.some((at) => isRootPath(at.start))) {
                    console.log('not selecting root node');
                    return state;
                }
                const idx = lidx(newState.at);
                const prev = lidx(state.at);
                if (idx !== prev) {
                    return { ...newState, menu: undefined };
                }
                return newState;
            }
            return state;
        case 'select':
            // Ignore attempts to select the root node
            if (action.at.some((at) => isRootPath(at.start))) {
                return state;
            }
            return {
                ...state,
                at: action.add ? state.at.concat(action.at) : action.at,
            };
        case 'paste': {
            return { ...state, ...paste(state, state.ctx, action.items) };
        }
    }
};

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
    const mods = infer(exprs, ctx);
    console.log('inferMods', mods);
    const keys = Object.keys(mods);
    // if (!keys.length) break;
    keys.forEach((id) => {
        applyInferMod(mods[+id], state.map, state.nidx, +id);
    });

    return state;
}
