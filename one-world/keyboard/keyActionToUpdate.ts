import { unwrap } from './handleDelete';
import { handleJoinText } from './update/text';
import { replaceSelf } from './update/updaters';
import { disolveSmooshed, joinSmooshed, rebalanceSmooshed } from './update/list';
import { setIdText } from './update/id';
import { setTextText } from './update/text';
import { tagSetAttributes } from './update/list';
import { SelStart } from './handleShiftNav';
import { handleTextFormat } from './update/text';
import { Spat } from './handleSpecialText';
import { TestState } from './test-utils';
import { removeSelf } from './update/updaters';
import { joinTable } from './update/table';
import { removeSpan } from './update/text';
import { joinInList } from './update/list';
import { textDelete } from './update/text';
import { Cursor, lastChild, Path, TextIndex, Update } from './utils';
import { CopiedValues, handleDeleteTooMuch, pasteUpdate } from './update/multi-change';
import { ListKind, NodeID, RecNodeT, Style, TextSpan } from '../shared/cnodes';
import { handleIdWrap, handleInsertList, wrapUpdate } from './handleWrap';
import { addSpan } from './update/text';
import { dedentOutOfRich, splitTextInRich } from './update/rich';
import { splitTableCol } from './update/table';
import { handleInsertText } from './update/updaters';
import { splitTableRow } from './update/table';
import { addInside, controlToggle } from './update/updaters';
import { applyNormalUpdate } from './applyUpdate';

export const selUpdate = (sel?: void | SelStart, start?: SelStart): Update | void =>
    sel ? { nodes: {}, selection: start ? { start, end: sel } : { start: sel } } : undefined;

export const keyActionToUpdate = (state: TestState, action: KeyAction): Update | void => {
    // console.log('action', action);
    switch (action.type) {
        case 'join-table':
            return joinTable(state.top, action.path, state.top.nodes[action.child.loc], action.child.cursor, action.at);
        case 'remove-span':
            return removeSpan(state.top, action.path, action.index);
        case 'unwrap':
            return unwrap(action.path, state.top);
        case 'move':
            return action.end ? selUpdate(action.end, action.sel) : selUpdate(action.sel);
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
            return setIdText(state.top, action.path, action.text, action.end, action.ccls);
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
        case 'replace-self':
            return replaceSelf(state.top, action.path, action.node, action.cursor);
        case 'table-split':
            if (action.rowMulti != null) {
                return splitTableRow(state.top, action.path, action.tablePath, action.at, action.rowMulti);
            } else {
                return splitTableCol(state.top, action.path, action.tablePath, action.at);
            }
        case 'control-toggle':
            return controlToggle(state.top, action.path, action.index);
        case 'add-inside':
            return addInside(state.top, action.path, action.children, action.cursor);
        case 'paste':
            return pasteUpdate(state.top, action.path, action.cursor, action.values);
    }
};

export type KeyWhat = { type: 'space' } | { type: 'string' } | { type: 'sep'; newLine: boolean } | { type: 'text'; grem: string; ccls: number };

export type KeyAction =
    | { type: 'add-inside'; path: Path; children: RecNodeT<boolean>[]; cursor: Cursor }
    | { type: 'control-toggle'; path: Path; index: TextIndex }
    | { type: 'unwrap'; path: Path }
    | { type: 'wrap'; path: Path; min: number; max: number; kind: ListKind<any> }
    | { type: 'id-wrap'; path: Path; left: number; right: number; kind: ListKind<any> }
    | { type: 'insert-list'; path: Path; pos: 'before' | 'after' | number; kind: ListKind<any> }
    | { type: 'insert-text'; path: Path; pos: 'before' | 'after' | number; what: KeyWhat }
    | { type: 'sub-rich'; path: Path; kind: ListKind<any> }
    //
    | { type: 'table-split'; path: Path; tablePath: Path; at: number | 'before' | 'after'; rowMulti?: boolean }
    // tag related
    | { type: 'tag-set-attributes'; path: Path; table: RecNodeT<boolean>; cursor: Cursor }
    // text related
    | { type: 'dedent-out-of-rich'; path: Path }
    | { type: 'split-text-in-rich'; path: Path; at: Spat }
    | { type: 'join-text'; path: Path }
    | { type: 'remove-span'; index: number; path: Path }
    | { type: 'set-text-text'; path: Path; text: string; index: TextIndex; end: number }
    | { type: 'add-span'; path: Path; span: TextSpan<RecNodeT<boolean>>; index: TextIndex; cursor: number | Cursor; within?: number }
    | { type: 'text-format'; format: Partial<Style>; path: Path; left: Spat; right: Spat; select?: 'before' | 'after' | 'cover' }
    // some other things
    | { type: 'join-list'; path: Path; child: { loc: NodeID; cursor: Cursor } }
    | { type: 'join-table'; path: Path; child: { loc: NodeID; cursor: Cursor }; at: { row: number; col: number } }
    // Selections
    | { type: 'paste'; path: Path; cursor: Cursor; values: CopiedValues }
    | { type: 'move'; sel: SelStart; end?: SelStart }
    | { type: 'sel-expand'; sel: SelStart }
    // Deletion n stuch
    | { type: 'replace-self'; path: Path; node: RecNodeT<boolean>; cursor: Cursor }
    | { type: 'remove-self'; path: Path }
    | { type: 'multi-delete'; start: SelStart; end: SelStart }
    // things I minght want to ... consolidate or something ... idk
    | { type: 'set-id-text'; path: Path; text: string; end: number; ccls?: number }
    | { type: 'text-delete'; path: Path; left: Spat; right: Spat }
    | { type: 'toggle-multiline'; loc: NodeID };

export const moveA = (sel?: SelStart | void | null): KeyAction[] => (sel ? [{ type: 'move', sel }] : []);
