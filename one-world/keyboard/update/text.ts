import { splitGraphemes } from '../../../src/parse/splitGraphemes';
import { TextSpan, RecNodeT, Nodes, fromRec, Style, isRich, NodeID } from '../../shared/cnodes';
import { spanLength } from '../handleDelete';
import { spanStart, spanEnd } from '../handleNav';
import { SelStart, toggleFormat } from '../handleShiftNav';
import { mergeAdjacentSpans, Spat, specialTextMod } from '../handleSpecialText';
import { maybeJoin } from '../handleTextText';
import {
    Top,
    Path,
    lastChild,
    selStart,
    Cursor,
    Update,
    pathWithChildren,
    TextCursor,
    parentLoc,
    parentPath,
    TextIndex,
    getSpanIndex,
} from '../utils';

export const textDelete = (top: Top, path: Path, left: Spat, right: Spat) => {
    const node = top.nodes[lastChild(path)];
    if (node.type !== 'text') return;
    const spans = node.spans.slice();

    const lindex = getSpanIndex(spans, left.index);
    const rindex = getSpanIndex(spans, right.index);

    if (lindex === rindex) {
        const span = spans[lindex];
        if (span.type === 'text') {
            const grems = splitGraphemes(span.text);
            grems.splice(left.cursor, right.cursor - left.cursor);
            return setTextText(top, path, grems.join(''), left.index, left.cursor);
        }
    }

    let off = 0;
    for (let index = lindex; index <= rindex; index++) {
        const span = spans[index - off];
        const sl = spanLength(span, undefined, index);
        const start = lindex === index ? left.cursor : 0;
        const end = rindex === index ? right.cursor : sl;
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
                              lindex >= spans.length
                                  ? { index: spans[spans.length - 1].loc, cursor: spanLength(spans[spans.length - 1], undefined, 0) }
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

export const setTextText = (top: Top, path: Path, text: string, index: TextIndex, end: number) => {
    const node = top.nodes[lastChild(path)];
    if (node.type !== 'text') return;
    const spans = node.spans.slice();
    const at = typeof index === 'number' ? index : spans.findIndex((s) => s.loc === index);
    const span = spans[at];
    if (span.type !== 'text') return;

    spans[at] = { ...span, text };
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
    index: TextIndex,
    cursor: number | Cursor,
    within?: number,
): void | Update => {
    const node = top.nodes[lastChild(path)];
    if (node.type !== 'text') return;
    const spans = node.spans.slice();

    const nodes: Nodes = {};

    let sel: SelStart;

    let nextLoc = undefined as undefined | number;
    let span: TextSpan<NodeID>;

    if (recSpan.type === 'embed') {
        nextLoc = top.nextLoc;
        let selPath: NodeID[] = [];
        const root = fromRec(recSpan.item, nodes, (loc, __, path) => {
            const nl = nextLoc!++ + '';
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

    let at = getSpanIndex(spans, index);

    if (within != null) {
        const current = spans[at];
        if (current?.type === 'text') {
            const text = splitGraphemes(current.text);
            if (within < text.length) {
                spans[at] = { ...current, text: text.slice(0, within).join('') };
                spans.splice(at + 1, 0, { ...current, text: text.slice(within).join('') });
            }
            at++;
        }
    }

    const left = maybeJoin(spans[at - 1], span);
    if (left) {
        spans[at - 1] = left.joined;
        if (sel.cursor.type === 'text') {
            if (typeof sel.cursor.end.index === 'number') {
                sel.cursor.end.index--;
            } else {
                sel.cursor.end.index = spans[at - 1].loc;
            }
            sel.cursor.end.cursor += left.off;
        }
    } else {
        const right = maybeJoin(span, spans[at]);
        if (right) {
            spans[at] = right.joined;
        } else {
            spans.splice(at, 0, span);
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

    const res = specialTextMod(node, left, right, (style) => toggleFormat(style, format), top.nextLoc);
    if (!res) return;
    // console.log('mod', res, left, right);
    return {
        nextLoc: res.nextLoc,
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
        end: { index: spans[prev.spans.length].loc, cursor: 0 },
    };
    console.log(spans, cursor);
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
