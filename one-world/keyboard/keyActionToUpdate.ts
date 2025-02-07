import { removeSelf, removeSpan, unwrap } from './handleDelete';
import { selUpdate } from './handleNav';
import { SelStart } from './handleShiftNav';
import { TestState } from './test-utils';
import { lastChild, Path, Update } from './utils';

export const keyActionToUpdate = (state: TestState, action: KeyAction): Update | void => {
    switch (action.type) {
        // case 'multi':
        //     for (let item of action.actions) {
        //         state = applyKeyAction(state, item);
        //     }
        //     return state;
        case 'remove-span':
            return removeSpan(state.top, action.path, action.index);
        case 'unwrap':
            return unwrap(action.path, state.top);
        case 'move':
            return selUpdate(action.sel);
        case 'remove-self':
            return removeSelf(state, { path: action.path, node: state.top.nodes[lastChild(action.path)] });
    }
};
export type KeyAction =
    | { type: 'unwrap'; path: Path }
    //
    | { type: 'move'; sel: SelStart }
    | { type: 'remove-self'; path: Path }
    | { type: 'remove-span'; index: number; path: Path };

export const moveA = (sel?: SelStart | void): KeyAction[] => (sel ? [{ type: 'move', sel }] : []);
