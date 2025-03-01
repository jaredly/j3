import { splitGraphemes } from '../../src/parse/splitGraphemes';
import { linksEqual, NodeID, Style, stylesEqual, Text, TextSpan } from '../shared/cnodes';
import { Mods } from './handleShiftNav';
import { KeyAction } from './keyActionToUpdate';
import { getSpan, ListCursor, Path, TextCursor, TextIndex, Top } from './utils';

const isStyleKey = (key: string) => key === 'b' || key === 'i' || key === 'u';

export const keyFormat = (key: string, mods: Mods): void | Partial<Style> => {
    if (!mods.ctrl && !mods.meta) return;
    if (key === 'b') {
        return { fontWeight: 'bold' };
    } else if (key === 'u') {
        return { textDecoration: 'underline' };
    } else if (key === 'i') {
        return { fontStyle: 'italic' };
    }
};

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

export type Spat = { cursor: number; index: TextIndex };

export const specialTextMod = (node: Text<NodeID>, left: Spat, right: Spat, mod: (style: Style) => void, nextLoc: number) => {
    let off = 0;
    let scur: number | null = null;
    let ecur: { cursor: number; index: string } | null = null;
    const spans = node.spans.slice();
    const lefti = spans.indexOf(getSpan(node, left.index));
    const righti = spans.indexOf(getSpan(node, right.index));

    for (let i = lefti; i <= righti; i++) {
        const span = node.spans[i];
        if (!span) {
            console.log(node, left, right);
        }
        if (span.type !== 'text') continue;
        const style = { ...span.style };
        mod(style);
        const grems = splitGraphemes(span.text);
        // const grems = tmpText[`${node.loc}:${i}`] ?? splitGraphemes(span.text);

        const start = i === lefti ? left.cursor : 0;
        const end = i === righti ? right.cursor : grems.length;

        if (start === end && lefti !== righti) {
            continue;
        }

        if (start > 0) {
            spans.splice(i + off, 0, { ...span, text: grems.slice(0, start).join(''), loc: nextLoc++ + '' });
            off++;
        }
        if (start < grems.length || (i === righti && start === end)) {
            if (scur === null && i >= lefti) scur = i + off;
            spans[i + off] = { ...span, style, text: grems.slice(start, end).join('') };
            ecur = { index: spans[i + off].loc, cursor: end - start };
        } else {
            spans.splice(i + off, 1);
            off--;
        }
        if (end < grems.length) {
            spans.splice(i + off + 1, 0, { ...span, text: grems.slice(end).join(''), loc: nextLoc++ + '' });
            off++;
        }
    }
    if (scur == null || ecur == null) return;

    const start: Spat = { index: spans[scur].loc, cursor: 0 };
    const end = ecur;

    return { nextLoc, node: { ...node, spans: mergeAdjacentSpans(spans, { start, end }) }, start, end };
};

export const handleSpecialText = (
    { node, path, cursor }: { node: Text<NodeID>; path: Path; cursor: TextCursor | ListCursor },
    top: Top,
    key: string,
    mods: Mods,
): KeyAction[] | void => {
    if (cursor.type === 'list') return;
    // const { left, right, text } = textCursorSides2(cursor);

    if (!isStyleKey(key) || (!mods.ctrl && !mods.meta)) return;
    const mod = keyFormat(key, mods);
    if (!mod) return;

    return [{ type: 'text-format', format: mod, path, left: cursor.end, right: cursor.end }];
};

export const mergeAdjacentSpans = <T>(spans: TextSpan<T>[], cursor: { start?: Spat; end: Spat }): TextSpan<T>[] => {
    let results: TextSpan<T>[] = [];
    spans.forEach((span, i) => {
        if (span.type === 'text' && results.length) {
            const prev = results[results.length - 1];
            if (prev.type === 'text' && stylesEqual(span.style, prev.style) && linksEqual(span.link, prev.link)) {
                results[results.length - 1] = { ...prev, text: prev.text + span.text };
                const prevl = splitGraphemes(prev.text).length;
                if (cursor.end.index === i || cursor.end.index === span.loc) {
                    cursor.end.cursor += prevl;
                    cursor.end.index = prev.loc;
                }
                if (cursor.start?.index === i || cursor.start?.index === span.loc) {
                    cursor.start.cursor += prevl;
                    cursor.start.index = prev.loc;
                }
                return;
            }
        }
        results.push(span);
    });
    return results;
};
