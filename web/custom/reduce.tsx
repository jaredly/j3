import { splitGraphemes } from '../../src/parse/parse';
import { paste } from '../mods/clipboard';
import { verticalMove } from './verticalMove';
import { UIState, Action, getCtx, handleKey, isRootPath, lidx } from './ByHand';

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
        case 'menu':
            return { ...state, menu: { selection: action.selection } };
        case 'menu-select': {
            const idx = action.path[action.path.length - 1].idx;
            return {
                ...state,
                at: [
                    {
                        start: action.path.slice(0, -1).concat([
                            {
                                idx,
                                type: 'subtext',
                                at: splitGraphemes(action.item.text).length,
                            },
                        ]),
                    },
                ],
                map: {
                    ...state.map,
                    [idx]: {
                        loc: state.map[idx].loc,
                        ...action.item.node,
                    },
                },
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
