import { Node, childLocs } from '../shared/cnodes';
import { SelStart } from './handleShiftNav';
import { Cursor, Highlight, NodeSelection, Top, SelectionStatuses, lastChild, pathKey, Path, pathWithChildren, Current, getNode } from './utils';

const cursorHighlight = (node: Node, left?: Cursor, right?: Cursor): Highlight | undefined => {
    if (node.type === 'id') {
        if (left && left.type !== 'id') throw new Error(`id must have id cursor`);
        if (right && right.type !== 'id') throw new Error(`id must have id cursor`);
        return { type: 'id', start: left?.end, end: right?.end };
    }

    if (node.type === 'text') {
        return {
            type: 'text',
            spans: node.spans.map((span, i) => {
                if (left?.type === 'text') {
                    if (left.end.index > i) return false;
                    if (left.end.index === i) {
                        if (right?.type === 'text' && right.end.index === i) {
                            return { start: left.end.cursor, end: right.end.cursor };
                        }
                        return { start: left.end.cursor };
                    }
                }
                if (right?.type === 'text') {
                    if (right.end.index < i) return false;
                    if (right.end.index === i) {
                        return { end: right.end.cursor };
                    }
                }
                return true;
            }),
        };
    }

    if (node.type === 'list') {
        let opener = true;
        let closer = true;
        if (left?.type === 'list') {
            if (left.where === 'inside' || left.where === 'after' || left.where === 'end') {
                opener = false;
            }
        }
        if (right?.type === 'list') {
            if (right.where === 'inside' || right.where === 'before' || right.where === 'start') {
                closer = false;
            }
        }
        return { type: 'list', opener, closer };
    }
};

export const getSelectionStatuses = (selection: NodeSelection, top: Top): SelectionStatuses => {
    if (!selection.end) {
        const { cursor, key } = selection.start;
        return { [key]: { cursors: [cursor] } };
    }

    if (selection.start.key === selection.end.key) {
        const [left, right] = ltCursor(selection.start.cursor, selection.end.cursor)
            ? [selection.start, selection.end]
            : [selection.end, selection.start];

        return {
            [left.key]: {
                cursors: [left.cursor, right.cursor],
                highlight: cursorHighlight(top.nodes[lastChild(left.path)], left.cursor, right.cursor),
            },
        };
    }

    const [left, middle, right] = orderSelections(selection.start, selection.end, top);

    const statuses: SelectionStatuses = {};

    statuses[left.key] = { cursors: [left.cursor], highlight: cursorHighlight(top.nodes[lastChild(left.path)], left.cursor, undefined) };

    statuses[right.key] = { cursors: [right.cursor], highlight: cursorHighlight(top.nodes[lastChild(right.path)], undefined, right.cursor) };

    middle.forEach((md) => {
        statuses[pathKey(md)] = { cursors: [], highlight: { type: 'full' } };
    });

    return statuses;
};

export const ltCursor = (one: Cursor, two: Cursor) => {
    switch (one.type) {
        case 'id':
            return two.type === 'id' ? one.end < two.end : false;
        case 'text':
            return two.type === 'list'
                ? two.where === 'after'
                : two.type === 'text'
                ? two.end.index === one.end.index
                    ? one.end.cursor < two.end.cursor
                    : one.end.index < two.end.index
                : false;
        case 'list':
            return two.type === 'list'
                ? two.where === 'before'
                    ? false
                    : one.where === 'after'
                    ? false
                    : one.where === 'before' || one.where === 'start' || two.where === 'end' || two.where === 'after'
                : one.where === 'before' || one.where === 'start';
        case 'control':
            throw new Error('not handling right nowwww');
    }
};

export const orderSelections = (one: SelStart, two: SelStart, top: Top): [SelStart, Path[], SelStart] => {
    if (one.path.root.top !== two.path.root.top) throw new Error(`sorry not yettt`);
    if (one.key === two.key) {
        if (ltCursor(one.cursor, two.cursor)) {
            return [one, [], two];
        } else {
            return [two, [], one];
        }
    }
    for (let i = 1; i < one.path.children.length && i < two.path.children.length; i++) {
        const o = one.path.children[i];
        const t = two.path.children[i];
        if (o === t) continue;
        const pnode = top.nodes[one.path.children[i - 1]];
        const locs = childLocs(pnode);
        const oat = locs.indexOf(o);
        const tat = locs.indexOf(t);
        if (oat === -1 || tat === -1) throw new Error(`not innnn`);
        // NOTE it's possible to have one be inside the other, if the outer one is a Text selection.
        // gotta handle that
        const ppath: Path = { ...one.path, children: one.path.children.slice(0, i) };
        if (oat < tat) {
            return [one, locs.slice(oat + 1, tat).map((c) => pathWithChildren(ppath, c)), two];
        } else {
            return [two, locs.slice(tat + 1, oat).map((c) => pathWithChildren(ppath, c)), one];
        }
    }
    throw new Error(`ran out, cant handle yext just yets`);
};

export const getCurrent = (selection: NodeSelection, top: Top): Current => {
    const sel = selection.end ?? selection.start;
    // const sel = selection.start;
    const path = sel.path;
    // if (selection.end && selection.end.key !== sel.key) {
    //     // we have a problem
    //     throw new Error('todo multi');
    // }
    const node = getNode(path, top);
    if (node == null) throw new Error('bad path');
    const cursor = sel.cursor;
    if (node.type === 'id') {
        if (cursor.type !== 'id') {
            throw new Error(`id select must have cursor id`);
        }
        // let ec = selection.end?.cursor;
        let ec = selection.end ? selection.start.cursor : undefined;
        if (ec && ec.type !== 'id') {
            ec = undefined;
            // throw new Error(`id select must have cursor id (end)`);
        }
        return { type: 'id', node, cursor: ec ?? cursor, path, start: ec ? cursor.end : undefined };
    }
    if (node.type === 'text') {
        if (cursor.type !== 'text' && cursor.type !== 'list') {
            throw new Error(`text select must have cursor text or list`);
        }
        return { type: 'text', node, cursor, path };
    }
    if (node.type === 'list' || node.type === 'table') {
        if (cursor.type !== 'list' && cursor.type !== 'control') {
            throw new Error(`list/table select must have cursor list`);
        }
        return { type: 'list', node, cursor, path };
    }
    throw new Error('unknown node and cursor combo');
};
