import { handleJoinText, unwrap } from './handleDelete';
import { disolveSmooshed, joinSmooshed, rebalanceSmooshed, setIdText, setTextText, tagSetAttributes } from './updaters';
import { selUpdate } from './handleNav';
import { handleTextFormat, SelStart } from './handleShiftNav';
import { Spat } from './handleSpecialText';
import { TestState } from './test-utils';
import { joinInList, joinTable, removeSelf, removeSpan, textDelete } from './updaters';
import { Cursor, lastChild, Path, Update } from './utils';
import { handleDeleteTooMuch } from './multi-change';
import { ListKind, RecNodeT, Style, TextSpan } from '../shared/cnodes';
import { handleIdWrap, handleInsertList, wrapUpdate } from './handleWrap';
import { addSpan, dedentOutOfRich, splitTextInRich } from './handleTextText';
import { handleInsertText } from './handleIdKey';

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
        case 'sel-expand':
            return { nodes: {}, selection: { start: state.sel.start, end: action.sel } };
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
        case 'multi-delete': {
            const up = handleDeleteTooMuch(state.top, action.start, action.end);
            if (up) {
                rebalanceSmooshed(up, state.top);
                joinSmooshed(up, state.top);
                disolveSmooshed(up, state.top);
            }
            return up;
        }
        case 'join-text':
            return handleJoinText(state.top, action.path);
        case 'text-format':
            return handleTextFormat(state.top, action.path, action.format, action.left, action.right, action.select);
        case 'wrap':
            return wrapUpdate(state.top, action.path, action.min, action.max, action.kind);
        case 'id-wrap':
            return handleIdWrap(state.top, action.path, action.left, action.right, action.kind);
        case 'insert-list':
            return handleInsertList(state.top, action.path, action.pos, action.kind);
        case 'add-span':
            return addSpan(state.top, action.path, action.span, action.index, action.cursor, action.within);
        case 'dedent-out-of-rich':
            return dedentOutOfRich(state.top, action.path);
        case 'split-text-in-rich':
            return splitTextInRich(state.top, action.path, action.at);
        case 'tag-set-attributes':
            return tagSetAttributes(state.top, action.path, action.table, action.cursor);
        case 'insert-text':
            return handleInsertText(state.top, action.path, action.pos, action.what);
    }
};

export type KeyWhat = { type: 'space' } | { type: 'string' } | { type: 'sep'; newLine: boolean } | { type: 'text'; grem: string; ccls: number };

export type KeyAction =
    | { type: 'unwrap'; path: Path }
    | { type: 'wrap'; path: Path; min: number; max: number; kind: ListKind<any> }
    | { type: 'id-wrap'; path: Path; left: number; right: number; kind: ListKind<any> }
    | { type: 'insert-list'; path: Path; pos: 'before' | 'after' | number; kind: ListKind<any> }
    | { type: 'insert-text'; path: Path; pos: 'before' | 'after' | number; what: KeyWhat }
    | { type: 'sub-rich'; path: Path; kind: ListKind<any> }
    // tag related
    | { type: 'tag-set-attributes'; path: Path; table: RecNodeT<boolean>; cursor: Cursor }
    // text related
    | { type: 'dedent-out-of-rich'; path: Path }
    | { type: 'split-text-in-rich'; path: Path; at: Spat }
    | { type: 'join-text'; path: Path }
    | { type: 'remove-span'; index: number; path: Path }
    | { type: 'set-text-text'; path: Path; text: string; index: number; end: number }
    | { type: 'add-span'; path: Path; span: TextSpan<RecNodeT<boolean>>; index: number; cursor: number | Cursor; within?: number }
    | { type: 'text-format'; format: Partial<Style>; path: Path; left: Spat; right: Spat; select?: 'before' | 'after' | 'cover' }
    // some other things
    | { type: 'join-list'; path: Path; child: { loc: number; cursor: Cursor } }
    | { type: 'join-table'; path: Path; child: { loc: number; cursor: Cursor }; at: { row: number; col: number } }
    // Selections
    | { type: 'move'; sel: SelStart }
    | { type: 'sel-expand'; sel: SelStart }
    // Deletion n stuch
    | { type: 'replace-self'; path: Path; node: RecNodeT<boolean>; cursor: Cursor }
    | { type: 'remove-self'; path: Path }
    | { type: 'multi-delete'; start: SelStart; end: SelStart }
    // things I minght want to ... consolidate or something ... idk
    | { type: 'set-id-text'; path: Path; text: string; end: number }
    | { type: 'text-delete'; path: Path; left: Spat; right: Spat }
    | { type: 'toggle-multiline'; loc: number };

export const moveA = (sel?: SelStart | void | null): KeyAction[] => (sel ? [{ type: 'move', sel }] : []);
