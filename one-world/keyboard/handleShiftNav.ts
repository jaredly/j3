import { splitGraphemes } from '../../src/parse/splitGraphemes';
import { Id, Text, TextSpan } from '../shared/cnodes';
import { cursorSides } from './cursorSides';
import { justSel } from './handleNav';
import { textCursorSides, textCursorSides2 } from './insertId';
import { TestState } from './test-utils';
import { getCurrent, IdCursor, ListCursor, Path, selStart, TextCursor, Top, Update } from './utils';

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
        if (end.cursor === text.length) {
            if (end.index < node.spans.length) {
                let index = end.index + 1;
                for (; index < node.spans.length && node.spans[index].type !== 'text'; index++);
                if (index >= node.spans.length) return;
                const pspan = node.spans[index];
                if (pspan.type !== 'text') return;
                end = { index, cursor: 0 };
                if (index === cursor.end.index + 1 && pspan.text !== '') {
                    end.cursor++;
                }
            }
        } else {
            end = { ...end, cursor: end.cursor + 1 };
        }
    }
    return justSel(path, { ...cursor, start: cursor.start ?? cursor.end, end });
};

type Mods = { meta?: boolean; ctrl?: boolean; alt?: boolean; shift?: boolean };

export const handleSpecial = (state: TestState, key: string, mods: Mods) => {
    const current = getCurrent(state.sel, state.top);
    switch (current.type) {
        // case 'id':
        //     return handle(current, state.top, key === 'ArrowLeft');
        case 'text':
            return handleSpecialText(current, state.top, key, mods);
    }
};

export const handleSpecialText = (
    { node, path, cursor }: { node: Text<number>; path: Path; cursor: TextCursor | ListCursor },
    top: Top,
    key: string,
    mods: Mods,
): Update | void => {
    if (cursor.type === 'list') return;
    const { left, right, text } = textCursorSides2(cursor);
    if (left.index !== right.index) return; // nopt yept
    const spans = node.spans.slice();
    const span = node.spans[left.index];
    if (span.type !== 'text') return; // sryyy

    const style = { ...span.style };

    if (key === 'b' && (mods.ctrl || mods.meta)) {
        if (style.fontWeight === 'bold') {
            delete style.fontWeight;
        } else {
            style.fontWeight = 'bold';
        }
    } else if (key === 'u' && (mods.ctrl || mods.meta)) {
        if (style.textDecoration === 'underline') {
            delete style.textDecoration;
        } else {
            style.textDecoration = 'underline';
        }
    } else if (key === 'i' && (mods.ctrl || mods.meta)) {
        if (style.fontStyle === 'italic') {
            delete style.fontStyle;
        } else {
            style.fontStyle = 'italic';
        }
    } else {
        return;
    }

    const grems = text?.grems ?? splitGraphemes(span.text);
    const pre = grems.slice(0, left.cursor);
    const mid = grems.slice(left.cursor, right.cursor);
    const post = grems.slice(right.cursor);

    const ok: TextSpan<number> = { ...span, text: mid.join(''), style };

    let at = left.index;

    const sindex = pre.length ? left.index + 1 : left.index;

    if (pre.length) {
        spans[left.index] = { ...span, text: pre.join('') };
        spans.splice(left.index + 1, 0, ok);
        at += 2;
    } else {
        spans[left.index] = ok;
        at += 1;
    }

    if (post.length) {
        spans.splice(at, 0, { ...span, text: post.join('') });
    }

    return {
        nodes: { [node.loc]: { ...node, spans } },
        selection: {
            start: selStart(path, {
                type: 'text',
                end: { index: sindex, cursor: mid.length },
                start: mid.length ? { index: sindex, cursor: 0 } : undefined,
            }),
        },
    };
};
