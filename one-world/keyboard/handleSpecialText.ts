import { splitGraphemes } from '../../src/parse/splitGraphemes';
import { linksEqual, stylesEqual, Text, TextSpan } from '../shared/cnodes';
import { Mods } from './handleShiftNav';
import { textCursorSides2 } from './insertId';
import { Path, TextCursor, ListCursor, Top, Update, selStart } from './utils';

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
    const ncursor: TextCursor = {
        type: 'text',
        end: { index: sindex, cursor: mid.length },
        start: mid.length ? { index: sindex, cursor: 0 } : undefined,
    };

    return {
        nodes: { [node.loc]: { ...node, spans: mergeAdjacentSpans(spans, ncursor) } },
        selection: {
            start: selStart(path, ncursor),
        },
    };
};

const mergeAdjacentSpans = <T>(spans: TextSpan<T>[], cursor: TextCursor): TextSpan<T>[] => {
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
