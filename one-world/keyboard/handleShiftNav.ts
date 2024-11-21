import { splitGraphemes } from '../../src/parse/splitGraphemes';
import { Id, Text } from '../shared/cnodes';
import { cursorSides } from './cursorSides';
import { spanLength } from './handleDelete';
import { justSel } from './handleNav';
import { handleSpecialText } from './handleSpecialText';
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
    if (left) {
        if (end.cursor === 0) {
            if (end.index > 0) {
                let index = end.index - 1;
                for (; index >= 0 && node.spans[index].type !== 'text'; index--);
                if (index < 0) return;
                const pspan = node.spans[index];
                if (pspan.type !== 'text') return;
                end = { index, cursor: splitGraphemes(pspan.text).length };
                if (index === cursor.end.index - 1 && pspan.text !== '') {
                    end.cursor--;
                }
            } else {
                return;
            }
        } else {
            end = { ...end, cursor: end.cursor - 1 };
        }
    } else {
        const len = span.type === 'text' ? cursor.end.text?.length ?? splitGraphemes(span.text).length : 1;
        if (end.cursor === len) {
            if (end.index < node.spans.length) {
                let index = end.index + 1;
                const txt = end.text ? { grems: end.text, index: end.index } : undefined;
                for (; index < node.spans.length && spanLength(node.spans[index], txt, index) === 0; index++);
                // if (index >= node.spans.length) return;
                const pspan = node.spans[index];
                // if (pspan.type !== 'text') return;
                end = { index, cursor: 0 };
                if (index === cursor.end.index + 1 && spanLength(node.spans[index], txt, index) > 0) {
                    end.cursor++;
                }
            }
        } else {
            end = { ...end, cursor: end.cursor + 1 };
        }
    }
    return justSel(path, { ...cursor, start: cursor.start ?? cursor.end, end });
};

export type Mods = { meta?: boolean; ctrl?: boolean; alt?: boolean; shift?: boolean };

export const handleSpecial = (state: TestState, key: string, mods: Mods) => {
    const current = getCurrent(state.sel, state.top);
    switch (current.type) {
        // case 'id':
        //     return handle(current, state.top, key === 'ArrowLeft');
        case 'text':
            return handleSpecialText(current, state.top, key, mods);
    }
};
