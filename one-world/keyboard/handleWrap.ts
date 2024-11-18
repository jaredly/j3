import { splitGraphemes } from '../../src/parse/splitGraphemes';
import { Id, ListKind } from '../shared/cnodes';
import { cursorSides } from './cursorSides';
import { handleIdKey } from './handleIdKey';
import { Config, handleListKey, handleTextKey, handleTextText } from './insertId';
import { replaceAt } from './replaceAt';
import { TestState } from './test-utils';
import { IdCursor, Path, Top, Update, getCurrent, parentPath, pathWithChildren, selStart } from './utils';

export const wrapKind = (key: string): ListKind<number> | void => {
    switch (key) {
        case '(':
            return 'round';
        case '{':
            return 'curly';
        case '[':
            return 'square';
        case '<':
            return 'angle';
    }
};

export const handleIdWrap = (top: Top, path: Path, node: Id<number>, cursor: IdCursor, kind: ListKind<number>): Update | void => {
    const { left, right } = cursorSides(cursor);
    const text = cursor.text ?? splitGraphemes(node.text);
    // Wrap the whole thing
    if (left === 0 && (right === 0 || right === text.length)) {
        let nextLoc = top.nextLoc;
        const loc = nextLoc++;
        const up = replaceAt(path.children.slice(0, -1), top, node.loc, loc);
        up.nextLoc = nextLoc;
        up.nodes[loc] = { type: 'list', kind, children: [node.loc], loc };
        up.selection = { start: selStart(pathWithChildren(parentPath(path), loc, node.loc), { type: 'id', end: 0 }) };
        return up;
    }
};

export const handleWrap = (state: TestState, key: string): Update | void => {
    const current = getCurrent(state.sel, state.top);
    if (current.type === 'text' && current.cursor.type === 'text') {
        return handleTextText(current.cursor, current.node, key, current.path);
    }
    const kind = wrapKind(key);
    if (!kind) return;
    switch (current.type) {
        case 'id':
            return handleIdWrap(state.top, state.sel.start.path, current.node, current.cursor, kind);
        // case 'list':
        //     return handleListWrap(state.top, state.sel.start.path, current.cursor, kind);
        // case 'text':
        //     return handleTextWrap(state.top, state.sel.start.path, current.cursor, kind);
        default:
            throw new Error('not doing');
    }
};
