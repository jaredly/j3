import { splitGraphemes } from '../../src/parse/splitGraphemes';
import { Node, childLocs } from '../shared/cnodes';
import { isTag, selectEnd, selectStart } from './handleNav';
import { SelStart } from './handleShiftNav';
import {
    Cursor,
    Highlight,
    NodeSelection,
    Top,
    SelectionStatuses,
    lastChild,
    pathKey,
    Path,
    pathWithChildren,
    Current,
    getNode,
    parentLoc,
    parentPath,
} from './utils';

const cursorHighlight = (node: Node, left?: Cursor, right?: Cursor, inside: number | null = null): Highlight | undefined => {
    if (node.type === 'id') {
        if (left && left.type !== 'id') throw new Error(`id must have id cursor`);
        if (right && right.type !== 'id') throw new Error(`id must have id cursor`);
        return { type: 'id', spans: [{ start: left?.end, end: right?.end }] };
    }

    // hrmmmm
    // ok, so `inside` is gonna need some more info folks. like "span at"

    if (node.type === 'text') {
        return {
            type: 'text',
            spans: node.spans.map((span, i) => {
                if (!left && right?.type === 'list' && (right.where === 'before' || right.where === 'start')) return false;
                if (!right && left?.type === 'list' && (left.where === 'after' || left.where === 'end')) return false;
                if (left?.type === 'text') {
                    if (left.end.index > i) return false;
                    if (inside != null && inside <= i) return false;
                    if (left.end.index === i) {
                        if (right?.type === 'text' && right.end.index === i) {
                            return [{ start: left.end.cursor, end: right.end.cursor }];
                        }
                        return [{ start: left.end.cursor }];
                    }
                }
                if (left?.type === 'list' && (left.where === 'before' || left.where === 'start')) {
                    if (inside != null && inside <= i) return false;
                }
                if (right?.type === 'list' && (right.where === 'after' || right.where === 'end')) {
                    if (inside != null && inside >= i) return false;
                }
                if (right?.type === 'text') {
                    if (right.end.index < i) return false;
                    if (inside != null && inside >= i) return false;
                    if (right.end.index === i) {
                        return [{ end: right.end.cursor }];
                    }
                }
                return true;
            }),
            opener: left ? left.type === 'list' && left.where === 'before' : inside == null && !(right?.type === 'list' && right.where === 'before'),
            closer: right ? right.type === 'list' && right.where === 'after' : inside == null && !(left?.type === 'list' && left.where === 'after'),
        };
    }

    if (node.type === 'list' || node.type === 'table') {
        let opener = true;
        let closer = true;
        if (left?.type === 'list') {
            if (left.where === 'inside' || left.where === 'after' || left.where === 'end') {
                opener = false;
            }
            if (inside != null && !right) closer = false;
        }
        if (right?.type === 'list') {
            if (right.where === 'inside' || right.where === 'before' || right.where === 'start') {
                closer = false;
            }
            if (inside != null && !left) opener = false;
        }
        return { type: 'list', opener, closer };
    }
};

const leftCursor = (cursor: Cursor): Cursor => {
    switch (cursor.type) {
        case 'id':
            return { type: 'id', end: 0 };
        case 'text':
        case 'list':
            return { type: 'list', where: 'before' };
        case 'control':
            return cursor;
    }
};

const rightCursor = (cursor: Cursor, node: Node): Cursor => {
    switch (cursor.type) {
        case 'id':
            return { type: 'id', end: node.type === 'id' ? splitGraphemes(node.text).length : 1 };
        case 'text':
        case 'list':
            return { type: 'list', where: 'after' };
        case 'control':
            return cursor;
    }
};

const leftSide = (sel: SelStart): SelStart => ({ ...sel, cursor: leftCursor(sel.cursor) });
const rightSide = (sel: SelStart, top: Top): SelStart => ({ ...sel, cursor: rightCursor(sel.cursor, top.nodes[lastChild(sel.path)]) });

// for alt+drag
export const atomify = (start: SelStart, sel: SelStart, top: Top): [SelStart, SelStart] => {
    const startLeft = compareSelections(start, sel, top) === -1;
    if (startLeft) return [leftSide(start), rightSide(sel, top)];
    return [rightSide(start, top), leftSide(sel)];
};

const upToList = (path: Path, top: Top) => {
    const ploc = parentLoc(path);
    const pnode = top.nodes[ploc];
    if (!pnode) return;
    if (pnode.type === 'list' && pnode.kind !== 'smooshed' && pnode.kind !== 'spaced') {
        return path;
    }
    return upToList(parentPath(path), top);
};

// for ctrl+drag, select "up to an argument of a list"
export const argify = (start: SelStart, sel: SelStart, top: Top): [SelStart, SelStart] => {
    const startLeft = compareSelections(start, sel, top) === -1;
    const spath = upToList(start.path, top);
    const epath = upToList(sel.path, top);
    if (!spath || !epath) return [start, sel];
    const start1 = startLeft ? selectStart(spath, top) : selectEnd(spath, top);
    const sel1 = startLeft ? selectEnd(epath, top) : selectStart(epath, top);
    if (!start1 || !sel1) return [start, sel];
    return [start1, sel1];
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

    return orderSelections(selection.start, selection.end, top);
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

const innerSide = (outer: SelStart, inner: SelStart, top: Top): { side: 'before' | 'after'; at: number } => {
    const node = top.nodes[lastChild(outer.path)];
    const child = inner.path.children[outer.path.children.length];
    if (outer.cursor.type === 'list') {
        const at =
            node.type === 'list' && !isTag(node.kind)
                ? node.children.indexOf(child)
                : node.type === 'text'
                ? node.spans.findIndex((s) => s.type === 'embed' && s.item === child)
                : childLocs(node).indexOf(child);
        // TODO table plesssss
        if (at === -1) {
            throw new Error(`cant find location of child for inner side`);
        }
        if (outer.cursor.where === 'before' || outer.cursor.where === 'start') {
            return { side: 'before', at };
        }
        return { side: 'after', at };
    }

    if (outer.cursor.type === 'text') {
        const node = top.nodes[lastChild(outer.path)];
        if (node.type !== 'text') {
            throw new Error(`node not a text`);
        }
        const child = inner.path.children[outer.path.children.length];
        const at = node.spans.findIndex((s) => s.type === 'embed' && s.item === child);
        if (at === -1) throw new Error(`text span child`);
        if (at === outer.cursor.end.index) {
            return { side: outer.cursor.end.cursor === 0 ? 'before' : 'after', at };
        } else {
            return { side: at < outer.cursor.end.index ? 'after' : 'before', at };
        }
    }
    console.warn(`unexpected outer cursor type ${outer.cursor.type}`);
    return { side: 'after', at: -1 };
};

export const compareSelections = (one: SelStart, two: SelStart, top: Top) => {
    if (one.path.root.top !== two.path.root.top) throw new Error(`sorry not yettt`);
    if (one.key === two.key) {
        if (ltCursor(one.cursor, two.cursor)) {
            return -1;
        } else {
            return 1;
        }
    }
    for (let i = 1; i < one.path.children.length && i < two.path.children.length; i++) {
        const o = one.path.children[i];
        const t = two.path.children[i];
        if (o === t) continue;
        const pnode = top.nodes[one.path.children[i - 1]];
        if (pnode.type === 'text') {
            const oat = pnode.spans.findIndex((s) => s.type === 'embed' && s.item === o);
            const tat = pnode.spans.findIndex((s) => s.type === 'embed' && s.item === t);
            if (oat === -1 || tat === -1) throw new Error(`not innnn`);
            return oat < tat ? -1 : 1;
        }
        const locs = childLocs(pnode);
        const oat = locs.indexOf(o);
        const tat = locs.indexOf(t);
        if (oat === -1 || tat === -1) throw new Error(`not innnn`);
        return oat < tat ? -1 : 1;
    }

    const [outer, inner] = one.path.children.length < two.path.children.length ? [one, two] : [two, one];
    const side = innerSide(outer, inner, top);
    if (side.side === 'before') {
        return outer === one ? -1 : 1;
    } else {
        return inner === one ? -1 : 1;
    }
};

export const orderSelections = (one: SelStart, two: SelStart, top: Top): SelectionStatuses => {
    const [left, neighbors, right, inside] = collectSelectedNodes(one, two, top);
    const statuses: SelectionStatuses = {};
    neighbors.forEach((n) => (statuses[pathKey(n.path)] = { cursors: [], highlight: n.hl }));

    statuses[left.key] = {
        cursors: [left.cursor],
        highlight: cursorHighlight(top.nodes[lastChild(left.path)], left.cursor, undefined, inside?.side === 'before' ? inside.at : null),
    };

    statuses[right.key] = {
        cursors: [right.cursor],
        highlight: cursorHighlight(top.nodes[lastChild(right.path)], undefined, right.cursor, inside?.side === 'after' ? inside.at : null),
    };

    return statuses;
};

export type Neighbor = { path: Path; hl: Highlight };

const getNeighbors = (path: Path, i: number, top: Top, side: 'before' | 'after') => {
    const result: Neighbor[] = [];
    for (; i < path.children.length - 1; i++) {
        const parent = path.children[i];
        const next = path.children[i + 1];
        const pnode = top.nodes[parent];
        const ppath: Path = { ...path, children: path.children.slice(0, i + 1) };
        if (pnode.type === 'text') {
            const at = pnode.spans.findIndex((s) => s.type === 'embed' && s.item === next);
            if (at === -1) throw new Error(`child not in parent spans`);

            result.push({
                hl: {
                    type: 'text',
                    spans: pnode.spans.map((span, i) => (side === 'before' ? i < at : i > at)),
                    opener: side === 'before',
                    closer: side === 'after',
                },
                path: ppath,
            });
        } else {
            if (pnode.type === 'list' || pnode.type === 'table') {
                result.push({
                    path: ppath,
                    hl: { type: 'list', opener: side === 'before', closer: side === 'after' },
                });
            }

            const children = childLocs(pnode);
            const at = children.indexOf(next);
            if (at === -1) throw new Error(`child not in parent children`);
            const neighbors = (side === 'after' ? children.slice(at + 1) : children.slice(0, at)).map((c) => pathWithChildren(ppath, c));
            neighbors.forEach((path) => result.push({ path, hl: { type: 'full' } }));
        }
    }
    return result;
};

export const getCurrent = (selection: NodeSelection, top: Top): Current => {
    const sel = selection.end ?? selection.start;
    const path = sel.path;
    const node = getNode(path, top);
    if (node == null) throw new Error('bad path');
    const cursor = sel.cursor;
    if (node.type === 'id') {
        if (cursor.type !== 'id') {
            throw new Error(`id select must have cursor id`);
        }
        let ec = selection.end ? selection.start.cursor : undefined;
        if (ec && ec.type !== 'id') {
            ec = undefined;
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

export const collectSelectedNodes = (
    one: SelStart,
    two: SelStart,
    top: Top,
): [SelStart, Neighbor[], SelStart, { side: 'before' | 'after'; at: number } | null] => {
    const neighbors: Neighbor[] = [];
    if (one.path.root.top !== two.path.root.top) throw new Error(`sorry not yettt`);
    if (one.key === two.key) {
        if (ltCursor(one.cursor, two.cursor)) {
            return [one, neighbors, two, null];
        } else {
            return [two, neighbors, one, null];
        }
    }
    for (let i = 1; i < one.path.children.length && i < two.path.children.length; i++) {
        const o = one.path.children[i];
        const t = two.path.children[i];
        if (o === t) continue;
        const pnode = top.nodes[one.path.children[i - 1]];
        const ppath: Path = { ...one.path, children: one.path.children.slice(0, i) };
        if (pnode.type === 'text') {
            const oat = pnode.spans.findIndex((s) => s.type === 'embed' && s.item === o);
            const tat = pnode.spans.findIndex((s) => s.type === 'embed' && s.item === t);
            if (oat === -1 || tat === -1) throw new Error(`not innnn`);

            neighbors.push({
                path: ppath,
                hl: {
                    type: 'text',
                    spans: pnode.spans.map((span, i) => {
                        if (i > Math.min(oat, tat) && i < Math.max(oat, tat)) {
                            return true;
                        }
                        return false;
                    }),
                    opener: false,
                    closer: false,
                },
            });

            neighbors.push(...getNeighbors(one.path, i, top, oat < tat ? 'after' : 'before'));
            neighbors.push(...getNeighbors(two.path, i, top, oat < tat ? 'before' : 'after'));
            return oat < tat ? [one, neighbors, two, null] : [two, neighbors, one, null];
        }
        const locs = childLocs(pnode);
        const oat = locs.indexOf(o);
        const tat = locs.indexOf(t);
        if (oat === -1 || tat === -1) throw new Error(`not innnn`);
        const mid = oat < tat ? locs.slice(oat + 1, tat) : locs.slice(tat + 1, oat);
        mid.forEach((c) => neighbors.push({ path: pathWithChildren(ppath, c), hl: { type: 'full' } }));
        neighbors.push(...getNeighbors(one.path, i, top, oat < tat ? 'after' : 'before'));
        neighbors.push(...getNeighbors(two.path, i, top, oat < tat ? 'before' : 'after'));
        return oat < tat ? [one, neighbors, two, null] : [two, neighbors, one, null];
    }

    const [outer, inner] = one.path.children.length < two.path.children.length ? [one, two] : [two, one];
    const side = innerSide(outer, inner, top);
    if (side.side === 'before') {
        neighbors.push(...getNeighbors(inner.path, outer.path.children.length - 1, top, 'before'));
        return [outer, neighbors, inner, side];
    } else {
        neighbors.push(...getNeighbors(inner.path, outer.path.children.length - 1, top, 'after'));
        return [inner, neighbors, outer, side];
    }
};
