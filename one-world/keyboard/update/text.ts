import { splitGraphemes } from '../../../src/parse/splitGraphemes';
import { TextSpan, RecNodeT, Nodes, fromRec, Style, isRich } from '../../shared/cnodes';
import { spanLength } from '../handleDelete';
import { spanStart, spanEnd } from '../handleNav';
import { SelStart, toggleFormat } from '../handleShiftNav';
import { mergeAdjacentSpans, Spat, specialTextMod } from '../handleSpecialText';
import { maybeJoin } from '../handleTextText';
import { Top, Path, lastChild, selStart, Cursor, Update, pathWithChildren, TextCursor, parentLoc, parentPath } from '../utils';

export const textDelete = (top: Top, path: Path, left: Spat, right: Spat) => {
    const node = top.nodes[lastChild(path)];
    if (node.type !== 'text') return;
    const spans = node.spans.slice();

    if (left.index === right.index) {
        const span = spans[left.index];
        if (span.type === 'text') {
            const grems = splitGraphemes(span.text);
            grems.splice(left.cursor, right.cursor - left.cursor);
            return setTextText(top, path, grems.join(''), left.index, left.cursor);
        }
    }

    let off = 0;
    for (let index = left.index; index <= right.index; index++) {
        const span = spans[index - off];
        const sl = spanLength(span, undefined, index);
        const start = left.index === index ? left.cursor : 0;
        const end = right.index === index ? right.cursor : sl;
        if (start === 0 && end === sl) {
            spans.splice(index - off, 1);
            off++;
            continue;
        }
        if (start === sl || end === 0) continue; // nothing to do here
        if (span.type !== 'text') {
            throw new Error(`a non-text span should either be not touched or entirely covered by a text selection`);
        }
        const grems = splitGraphemes(span.text);
        spans[index - off] = { ...span, text: grems.slice(0, start).concat(grems.slice(end)).join('') };
    }

    return {
        nodes: { [node.loc]: { ...node, spans } },
        selection: {
            start: selStart(
                path,
                !spans.length
                    ? { type: 'list', where: 'inside' }
                    : {
                          type: 'text',
                          end:
                              left.index >= spans.length
                                  ? { index: spans.length - 1, cursor: spanLength(spans[spans.length - 1], undefined, 0) }
                                  : { index: left.index, cursor: left.cursor },
                      },
            ),
        },
    };
};

export const removeSpan = (top: Top, path: Path, index: number) => {
    const pnode = top.nodes[lastChild(path)];
    if (pnode.type !== 'text' || index >= pnode.spans.length) return;
    const spans = pnode.spans.slice();
    spans.splice(index, 1);
    const start =
        spans.length === 0
            ? selStart(path, { type: 'list', where: 'inside' })
            : index === 0
            ? spanStart(spans[0], 0, path, top, false)
            : spanEnd(spans[index - 1], path, index - 1, top, false);
    return start ? { nodes: { [pnode.loc]: { ...pnode, spans } }, selection: { start } } : undefined;
};

export const setTextText = (top: Top, path: Path, text: string, index: number, end: number) => {
    const node = top.nodes[lastChild(path)];
    if (node.type !== 'text') return;
    const spans = node.spans.slice();
    const span = spans[index];
    if (span.type !== 'text') return;

    spans[index] = { ...span, text };
    // this is 'set text text'
    return {
        nodes: { [node.loc]: { ...node, spans } },
        selection: {
            start: selStart(path, { type: 'text', end: { index, cursor: end } }),
        },
        // tmpText: { [`${current.node.loc}:${left.index}`]: grems },
    };
};

export const addSpan = (
    top: Top,
    path: Path,
    recSpan: TextSpan<RecNodeT<boolean>>,
    index: number,
    cursor: number | Cursor,
    within?: number,
): void | Update => {
    const node = top.nodes[lastChild(path)];
    if (node.type !== 'text') return;
    const spans = node.spans.slice();

    const nodes: Nodes = {};

    let sel: SelStart;

    let nextLoc = undefined as undefined | number;
    let span: TextSpan<number>;

    if (recSpan.type === 'embed') {
        nextLoc = top.nextLoc;
        let selPath: number[] = [];
        const root = fromRec(recSpan.item, nodes, (loc, __, path) => {
            const nl = nextLoc!++;
            if (loc === true) {
                selPath = path.concat([nl]);
            }
            return nl;
        });
        span = { ...recSpan, item: root };

        sel =
            selPath.length && typeof cursor !== 'number'
                ? selStart(pathWithChildren(path, ...selPath), cursor)
                : selStart(path, { type: 'text', end: { index: index, cursor: 0 } });
    } else {
        span = recSpan;

        if (typeof cursor !== 'number') {
            cursor = 0;
        }

        sel = selStart(path, { type: 'text', end: { index: index, cursor } });
    }

    if (within != null) {
        const current = spans[index];
        if (current?.type === 'text') {
            const text = splitGraphemes(current.text);
            if (within < text.length) {
                spans[index] = { ...current, text: text.slice(0, within).join('') };
                spans.splice(index + 1, 0, { ...current, text: text.slice(within).join('') });
            }
            index++;
        }
    }

    const left = maybeJoin(spans[index - 1], span);
    if (left) {
        spans[index - 1] = left.joined;
        if (sel.cursor.type === 'text') {
            sel.cursor.end.index--;
            sel.cursor.end.cursor += left.off;
        }
    } else {
        const right = maybeJoin(span, spans[index]);
        if (right) {
            spans[index] = right.joined;
        } else {
            spans.splice(index, 0, span);
        }
    }

    nodes[node.loc] = { ...node, spans };

    return {
        nodes,
        selection: { start: sel },
        nextLoc,
    };
};

export const handleTextFormat = (
    top: Top,
    path: Path,
    format: Partial<Style>,
    left: Spat,
    right: Spat,
    select?: 'before' | 'after' | 'cover',
): Update | undefined => {
    const node = top.nodes[lastChild(path)];
    if (node.type !== 'text') return;

    const res = specialTextMod(node, left, right, (style) => toggleFormat(style, format));
    if (!res) return;
    return {
        nodes: { [node.loc]: res.node },
        selection:
            select === 'after'
                ? {
                      start: selStart(path, { type: 'text', end: res.start }),
                  }
                : select === 'before'
                ? {
                      start: selStart(path, { type: 'text', end: res.end }),
                  }
                : {
                      end: selStart(path, { type: 'text', end: res.start }),
                      start: selStart(path, { type: 'text', end: res.end }),
                  },
    };
};
export const handleJoinText = (top: Top, path: Path) => {
    const node = top.nodes[lastChild(path)];
    const parent = top.nodes[parentLoc(path)];
    if (parent?.type !== 'list' || !isRich(parent.kind) || node.type !== 'text') {
        return;
    }
    const at = parent.children.indexOf(node.loc);
    if (at < 1) return;
    const prev = top.nodes[parent.children[at - 1]];
    if (prev.type !== 'text') return;
    const children = parent.children.slice();
    children.splice(at, 1);

    const spans = prev.spans.concat(node.spans);
    const cursor: TextCursor = {
        type: 'text',
        end: { index: prev.spans.length, cursor: 0 },
    };
    return {
        nodes: {
            [prev.loc]: { ...prev, spans: mergeAdjacentSpans(spans, cursor) },
            [parent.loc]: { ...parent, children },
        },
        selection: {
            start: selStart(pathWithChildren(parentPath(path), prev.loc), cursor),
        },
    };
};
