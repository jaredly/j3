import { unwrap } from './handleDelete';
import { setIdText, setTextText } from './updaters';
import { selUpdate } from './handleNav';
import { SelStart } from './handleShiftNav';
import { Spat } from './handleSpecialText';
import { TestState } from './test-utils';
import { joinInList, joinTable, removeSelf, removeSpan, textDelete } from './updaters';
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
            return removeSelf(state.top, { path: action.path, node: state.top.nodes[lastChild(action.path)] });
        case 'join-list':
            return joinInList(state.top, action.path, action.child);
        case 'toggle-multiline': {
            const node = state.top.nodes[action.loc];
            if (node.type === 'list' || node.type === 'table') {
                return { nodes: { [node.loc]: { ...node, forceMultiline: !node.forceMultiline } } };
            }
            return;
        }
        case 'set-id-text':
            return setIdText(state.top, action.path, action.text, action.end);
        case 'set-text-text': {
            return setTextText(state.top, action.path, action.text, action.index, action.end);
        }
        case 'text-delete':
            return textDelete(state.top, action.path, action.left, action.right);
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
    | { type: 'set-id-text'; path: Path; text: string; end: number }
    | { type: 'set-text-text'; path: Path; text: string; index: number; end: number }
    | { type: 'text-delete'; path: Path; left: Spat; right: Spat }
    | { type: 'toggle-multiline'; loc: number };

export const moveA = (sel?: SelStart | void): KeyAction[] => (sel ? [{ type: 'move', sel }] : []);
