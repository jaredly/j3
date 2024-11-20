import { splitGraphemes } from '../../src/parse/splitGraphemes';
import { Id, Text } from '../shared/cnodes';
import { cursorSides } from './cursorSides';
import { justSel } from './handleNav';
import { textCursorSides } from './insertId';
import { TestState } from './test-utils';
import { getCurrent, IdCursor, ListCursor, Path, TextCursor, Top, Update } from './utils';

export const handleShiftNav = (state: TestState, key: string): Update | void => {
    const current = getCurrent(state.sel, state.top);
    switch (current.type) {
        case 'id':
            return handleShiftId(current, state.top, key === 'ArrowLeft');
        case 'text':
            return handleShiftText(current, state.top, key === 'ArrowLeft');
    }
};

export const handleShiftId = ({ node, path, cursor }: { node: Id<number>; path: Path; cursor: IdCursor }, top: Top, left: boolean) => {
    if (left && cursor.end === 0) throw new Error('nt not');
    const text = cursor.text ?? splitGraphemes(node.text);
    if (!left && cursor.end === text.length) throw new Error('rt not');
    // left--
    return justSel(path, { ...cursor, start: cursor.start ?? cursor.end, end: cursor.end + (left ? -1 : 1) });
};

export const handleShiftText = (
    { node, path, cursor }: { node: Text<number>; path: Path; cursor: TextCursor | ListCursor },
    top: Top,
    left: boolean,
) => {
    if (cursor.type === 'list') {
        return; /// TODO
    }
    let end = cursor.end;
    const span = node.spans[end.index];
    if (span.type !== 'text') return console.error('span not text');
    const text = cursor.end.text ?? splitGraphemes(span.text);
    if (left) {
        if (end.cursor === 0) {
        } else {
            end = { ...end, cursor: end.cursor - 1 };
        }
    } else {
        if (end.cursor === text.length) {
        } else {
            end = { ...end, cursor: end.cursor + 1 };
        }
    }
    return justSel(path, { ...cursor, start: cursor.start ?? cursor.end, end });
};
