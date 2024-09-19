import { splitGraphemes } from '../../../../src/parse/splitGraphemes';
import { IRCursor } from '../../../shared/IR/intermediate';
import { IRCache, lastChild, parentLoc } from '../../../shared/IR/nav';
import {
    InlineSpan,
    parentPath,
    pathWithChildren,
    serializePath,
} from '../../../shared/nodes';
import { getTopForPath } from '../../selectNode';
import { Store } from '../../StoreContext2';
import { topUpdate } from './handleUpdate';

const splitSpan = (
    span: InlineSpan,
    cursor: number,
    text?: string[],
): [InlineSpan, InlineSpan] => {
    if (span.type === 'embed')
        return [{ type: 'text', text: '', style: {} }, span];
    const chars = text ?? splitGraphemes(span.text);
    return [
        { ...span, text: chars.slice(0, cursor).join('') },
        { ...span, text: chars.slice(cursor).join('') },
    ];
};

// const joinSpans = (left: InlineSpan[], right: InlineSpan[]) => {
//     const cursor =
// }

const splitSpans = (
    spans: InlineSpan[],
    cursor: IRCursor,
): [InlineSpan[], InlineSpan[]] => {
    if (cursor.type !== 'text') {
        return [spans, [{ type: 'text', text: '', style: {} }]];
    }
    const [st, ed] = cursor.start
        ? cursor.start.index === cursor.end.index
            ? cursor.start.cursor < cursor.end.cursor
                ? [cursor.start, cursor.end]
                : [cursor.end, cursor.start]
            : cursor.start.index < cursor.end.index
            ? [cursor.start, cursor.end]
            : [cursor.end, cursor.start]
        : [cursor.end, cursor.end];
    const left = spans.slice(0, st.index);
    left.push(
        splitSpan(
            spans[st.index],
            st.cursor,
            st.index === cursor.end.index ? cursor.end.text : undefined,
        )[0],
    );
    const right = spans.slice(ed.index + 1);
    right.push(
        splitSpan(
            spans[ed.index],
            ed.cursor,
            ed.index === cursor.end.index ? cursor.end.text : undefined,
        )[1],
    );
    return [left, right];
};

export const handleRichText = (
    key: string,
    docId: string,
    store: Store,
): boolean => {
    const ds = store.getDocSession(docId, store.session);
    if (!ds.selections.length) return false;
    const sel = ds.selections[0];
    if (sel.type !== 'ir') return false;
    if (sel.end) return false; //

    const state = store.getState();
    const top = getTopForPath(sel.start.path, state);
    const node = top.nodes[lastChild(sel.start.path)];
    if (node.type !== 'rich-inline') return false;
    const parent = top.nodes[parentLoc(sel.start.path)];
    if (parent.type !== 'rich-block') return false;

    const [left, right] = splitSpans(node.spans, sel.start.cursor);

    if (sel.start.cursor.type !== 'text') return false;

    if (key === 'ENTER') {
        const spath = pathWithChildren(parentPath(sel.start.path), top.nextLoc);
        const items = parent.items.slice();
        items.splice(items.indexOf(node.loc) + 1, 0, top.nextLoc);

        store.update(
            topUpdate(
                top.id,
                sel.start.path.root.doc,
                {
                    [top.nextLoc]: {
                        type: 'rich-inline',
                        loc: top.nextLoc,
                        // TODO: split the thing if needed.
                        spans: right,
                    },
                    [node.loc]: { ...node, spans: left },
                    [parent.loc]: { ...parent, items },
                },
                top.nextLoc + 1,
            ),
            {
                type: 'selection',
                doc: docId,
                selections: [
                    {
                        type: 'ir',
                        start: {
                            path: spath,
                            key: serializePath(spath),
                            cursor: {
                                type: 'text',
                                end: { index: 0, cursor: 0 },
                            },
                        },
                    },
                ],
            },
        );
        return true;
    }

    const idx = parent.items.indexOf(node.loc);
    if (idx === -1) return false;
    if (
        key === 'BACKSPACE' &&
        !sel.start.cursor.start &&
        sel.start.cursor.end.cursor === 0 &&
        sel.start.cursor.end.index === 0 &&
        idx > 0
    ) {
        // join left my folks
        const items = parent.items.slice();
        items.splice(idx, 1);
        const prev = parent.items[idx - 1];
        const pnode = top.nodes[prev];
        // TODO: allow joining into another rich block?
        if (pnode.type !== 'rich-inline') return false;

        const spath = pathWithChildren(parentPath(sel.start.path), prev);
        store.update(
            topUpdate(
                top.id,
                sel.start.path.root.doc,
                {
                    [node.loc]: undefined,
                    [prev]: { ...pnode, spans: pnode.spans.concat(node.spans) },
                    [parent.loc]: { ...parent, items },
                },
                top.nextLoc + 1,
            ),
            {
                type: 'selection',
                doc: docId,
                selections: [
                    {
                        type: 'ir',
                        start: {
                            path: spath,
                            key: serializePath(spath),
                            cursor: {
                                type: 'text',
                                end: {
                                    index: pnode.spans.length,
                                    cursor: 0,
                                },
                            },
                        },
                    },
                ],
            },
        );
        return true;
    }

    if (key === ' ' && !sel.start.cursor.start && node.spans.length === 1) {
        const span = node.spans[sel.start.cursor.end.index];
        const text =
            sel.start.cursor.end.text?.join('') ??
            (span.type === 'text' ? span.text : '');
        if (text === '-' && sel.start.cursor.end.cursor === 1) {
            // we are doing a listylisty
        }
        if (
            text.match(/^\d+\.$/) &&
            sel.start.cursor.end.cursor === text.length
        ) {
            // numbered list thanks
        }
    }

    return false;
};
