import { splitGraphemes } from '../../src/parse/splitGraphemes';
import { linksEqual, Style, stylesEqual, Text, TextSpan } from '../shared/cnodes';
import { sideEqual } from './handleNav';
import { Mods } from './handleShiftNav';
import { textCursorSides2 } from './insertId';
import { Path, TextCursor, ListCursor, Top, Update, selStart } from './utils';

const isStyleKey = (key: string) => key === 'b' || key === 'i' || key === 'u';

export const keyMod = (key: string, mods: Mods): void | ((style: Style) => void) => {
    if (!mods.ctrl && !mods.meta) return;
    if (key === 'b') {
        return (style) => {
            if (style.fontWeight === 'bold') {
                delete style.fontWeight;
            } else {
                style.fontWeight = 'bold';
            }
        };
    } else if (key === 'u') {
        return (style) => {
            if (style.textDecoration === 'underline') {
                delete style.textDecoration;
            } else {
                style.textDecoration = 'underline';
            }
        };
    } else if (key === 'i') {
        return (style) => {
            if (style.fontStyle === 'italic') {
                delete style.fontStyle;
            } else {
                style.fontStyle = 'italic';
            }
        };
    }
};

// const styleKey = (style: Style, key: string, mods: Mods): boolean => {
//     if (!mods.ctrl && !mods.meta) return false;
//     if (key === 'b') {
//         if (style.fontWeight === 'bold') {
//             delete style.fontWeight;
//         } else {
//             style.fontWeight = 'bold';
//         }
//     } else if (key === 'u') {
//         if (style.textDecoration === 'underline') {
//             delete style.textDecoration;
//         } else {
//             style.textDecoration = 'underline';
//         }
//     } else if (key === 'i') {
//         if (style.fontStyle === 'italic') {
//             delete style.fontStyle;
//         } else {
//             style.fontStyle = 'italic';
//         }
//     } else {
//         return false;
//     }
//     return true;
// };

type Spat = { cursor: number; index: number };

export const specialTextMod = (
    node: Text<number>,
    text: undefined | { grems: string[]; index: number },
    left: Spat,
    right: Spat,
    mod: (style: Style) => void,
) => {
    let off = 0;
    let scur: number | null = null;
    let ecur: { cursor: number; index: number } | null = null;
    const spans = node.spans.slice();

    for (let i = left.index; i <= right.index; i++) {
        const span = node.spans[i];
        if (span.type !== 'text') continue;
        const style = { ...span.style };
        mod(style);
        const grems = (text?.index === i ? text.grems : null) ?? splitGraphemes(span.text);

        const start = i === left.index ? left.cursor : 0;
        const end = i === right.index ? right.cursor : grems.length;

        if (start > 0) {
            spans.splice(i + off, 0, { ...span, text: grems.slice(0, start).join('') });
            off++;
        }
        if (start < grems.length || (i === right.index && start === end)) {
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
        node: { ...node, spans: mergeAdjacentSpans(spans, ncursor) },
        start: { index: scur, cursor: 0 },
        end: ecur,
    };
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
    const mod = keyMod(key, mods);
    if (!mod) return;

    const res = specialTextMod(node, text, left, right, mod);
    if (!res) return;

    return {
        nodes: { [node.loc]: res.node },
        selection: { start: selStart(path, { type: 'text', start: res.start, end: res.end }) },
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
