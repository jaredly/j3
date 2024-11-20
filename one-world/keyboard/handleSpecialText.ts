import { splitGraphemes } from '../../src/parse/splitGraphemes';
import { linksEqual, Style, stylesEqual, Text, TextSpan } from '../shared/cnodes';
import { Mods } from './handleShiftNav';
import { textCursorSides2 } from './insertId';
import { Path, TextCursor, ListCursor, Top, Update, selStart } from './utils';

const isStyleKey = (key: string) => key === 'b' || key === 'i' || key === 'u';

const styleKey = (style: Style, key: string, mods: Mods): boolean => {
    if (!mods.ctrl && !mods.meta) return false;
    if (key === 'b') {
        if (style.fontWeight === 'bold') {
            delete style.fontWeight;
        } else {
            style.fontWeight = 'bold';
        }
    } else if (key === 'u') {
        if (style.textDecoration === 'underline') {
            delete style.textDecoration;
        } else {
            style.textDecoration = 'underline';
        }
    } else if (key === 'i') {
        if (style.fontStyle === 'italic') {
            delete style.fontStyle;
        } else {
            style.fontStyle = 'italic';
        }
    } else {
        return false;
    }

    return true;
};

export const handleSpecialText = (
    { node, path, cursor }: { node: Text<number>; path: Path; cursor: TextCursor | ListCursor },
    top: Top,
    key: string,
    mods: Mods,
): Update | void => {
    if (cursor.type === 'list') return;
    const { left, right, text } = textCursorSides2(cursor);
    const spans = node.spans.slice();

    if (!isStyleKey(key) || (!mods.ctrl && !mods.meta)) return;

    let off = 0;
    let scur: number | null = null;
    let ecur: { cursor: number; index: number } | null = null;

    for (let i = left.index; i <= right.index; i++) {
        const span = node.spans[i];
        if (span.type !== 'text') continue;
        const style = { ...span.style };
        styleKey(style, key, mods);
        const grems = text?.grems ?? splitGraphemes(span.text);

        const start = i === left.index ? left.cursor : 0;
        const end = i === right.index ? right.cursor : grems.length;

        if (start > 0) {
            spans.splice(i + off, 0, { ...span, text: grems.slice(0, start).join('') });
            off++;
        }
        if (start < grems.length) {
            if (scur === null && i >= left.index) scur = i + off;
            spans[i + off] = { ...span, style, text: grems.slice(start, end).join('') };
            ecur = { index: i + off, cursor: end - start };
        } else {
            spans.splice(i + off, 1);
            off--;
        }
        if (end < grems.length) {
            spans.splice(i + off + 1, 0, { ...span, text: grems.slice(end).join('') });
            off++;
        }
    }
    if (scur == null || ecur == null) return;

    const ncursor: TextCursor = {
        type: 'text',
        start: { index: scur, cursor: 0 },
        end: ecur,
    };

    return {
        nodes: { [node.loc]: { ...node, spans: mergeAdjacentSpans(spans, ncursor) } },
        selection: {
            start: selStart(path, ncursor),
        },
    };
};

export const mergeAdjacentSpans = <T>(spans: TextSpan<T>[], cursor: TextCursor): TextSpan<T>[] => {
    let results: TextSpan<T>[] = [];
    spans.forEach((span, i) => {
        if (span.type === 'text' && results.length) {
            const prev = results[results.length - 1];
            if (prev.type === 'text' && stylesEqual(span.style, prev.style) && linksEqual(span.link, prev.link)) {
                results[results.length - 1] = { ...prev, text: prev.text + span.text };
                const prevl = splitGraphemes(prev.text).length;
                if (cursor.end.index === i) {
                    cursor.end.cursor += prevl;
                    cursor.end.index--;
                }
                if (cursor.start?.index === i) {
                    cursor.start.cursor += prevl;
                    cursor.start.index--;
                }
                return;
            }
        }
        results.push(span);
    });
    return results;
};
