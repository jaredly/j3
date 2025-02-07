import { joinInList, joinTable, removeSelf, removeSpan, unwrap } from './handleDelete';
import { selUpdate } from './handleNav';
import { SelStart } from './handleShiftNav';
import { TestState } from './test-utils';
import { Cursor, lastChild, Path, Update } from './utils';

export const keyActionToUpdate = (state: TestState, action: KeyAction): Update | void => {
    switch (action.type) {
        case 'join-table':
            return joinTable(state.top, action.path, state.top.nodes[action.child.loc], action.child.cursor, action.at);
        case 'remove-span':
            return removeSpan(state.top, action.path, action.index);
        case 'unwrap':
            return unwrap(action.path, state.top);
        case 'move':
            return selUpdate(action.sel);
        case 'remove-self':
            return removeSelf(state, { path: action.path, node: state.top.nodes[lastChild(action.path)] });
        case 'join-list':
            return joinInList(state.top, action.path, action.child);
        case 'toggle-multiline': {
            const node = state.top.nodes[action.loc];
            if (node.type === 'list' || node.type === 'table') {
                return { nodes: { [node.loc]: { ...node, forceMultiline: !node.forceMultiline } } };
            }
            return;
        }
    }
};
export type KeyAction =
    | { type: 'unwrap'; path: Path }
    //
    | { type: 'join-list'; path: Path; child: { loc: number; cursor: Cursor } }
    | { type: 'join-table'; path: Path; child: { loc: number; cursor: Cursor }; at: { row: number; col: number } }
    | { type: 'move'; sel: SelStart }
    | { type: 'remove-self'; path: Path }
    | { type: 'remove-span'; index: number; path: Path }
    // things I minght want to ... consolidate or something ... idk
    | { type: 'toggle-multiline'; loc: number };

export const moveA = (sel?: SelStart | void): KeyAction[] => (sel ? [{ type: 'move', sel }] : []);
