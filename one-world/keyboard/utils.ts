import { splitGraphemes } from '../../src/parse/splitGraphemes';
import { Nodes, Id, Collection, Text, Node, childLocs, TextSpan } from '../shared/cnodes';
import { SelStart } from './handleShiftNav';

export const spanLength = (span: TextSpan<unknown>, text: undefined | TextCursor['end'], index: number) =>
    index === text?.index && text?.text ? text.text.length : span.type === 'text' ? splitGraphemes(span.text).length : 1;

// import { IRSelection } from "../shared/IR/intermediate";
/*
ok: kinds of places a cursor could be:

ID
- just an index into the graphemes list

Text
- index into a text span
- if it's in an embed, the node has its own selection
- fully selecting a /custom/ or /include/ probably? although that could be
  handled by having 'text' spans on either side. yeah I think I'll want to enforce
  that you can't have two non-text spans next to each other.

List
- |(lol) before the opener
- (lol)| after the closer
- "selecting" the opener or closer
- (|) technically the 'inside' of an empty list
- same for [] {} <>
- spaced and smooshed don't have any cursor positions of their own
- <tag {|lol|yes;some|things|}>inner;children</tag>
    - doesn't look like there are any special positions here either.
- rich[list] has bullets that might be selectable as a group
- rich[checks] and [opts] have bullets that can be selected individually
- rich[callout] should have the icon be selectable, and activating it opens a dropdown menu to switch the kind

Table
- before/after and 'select brace' ought to cover it

*/

export const lastChild = (path: Path) => path.children[path.children.length - 1];
export const parentLoc = (path: Path) => path.children[path.children.length - 2];
export const gparentLoc = (path: Path) => path.children[path.children.length - 3];
export const parentPath = (path: Path): Path => ({
    ...path,
    children: path.children.slice(0, -1),
});
export const pathWithChildren = (path: Path, ...children: number[]) => ({
    ...path,
    children: path.children.concat(children),
});

export type IdCursor = {
    type: 'id';
    end: number;
    text?: string[];
};

export type TextCursor = {
    type: 'text';
    start?: { index: number; cursor: number };
    end: { index: number; cursor: number; text?: string[] };
};
export type ListWhere = 'before' | 'start' | 'inside' | 'end' | 'after';
export type CollectionCursor = ListCursor | { type: 'control'; index: number };
export type ListCursor = { type: 'list'; where: ListWhere };

export type Cursor = IdCursor | TextCursor | CollectionCursor;

export type Path = {
    root: { ids: number[]; top: string };
    children: number[];
};

export const pathKey = (path: Path) => `${path.root.ids.join(',')};${path.root.top};${path.children.join(',')}`;
export const selStart = (path: Path, cursor: Cursor): NodeSelection['start'] => ({
    path,
    cursor,
    key: pathKey(path),
});

export type PartialSel = { children: number[]; cursor: Cursor };

export const selectedPath = (sel: NodeSelection) => (sel.end ? null : sel.start.path);
export const selectedLoc = (sel: NodeSelection) => {
    const path = selectedPath(sel);
    return path ? lastChild(path) : null;
};

export const singleSelect = (sel: SelStart): NodeSelection => ({ start: sel });

// TODO maybe join path & key into a `pk: {path, key}` thing
export type NodeSelection = {
    start: { path: Path; key: string; cursor: Cursor; returnToHoriz?: number; level?: number };
    end?: { path: Path; key: string; cursor: Cursor; level?: number; excel?: number };
    multi?: { end: { path: Path; key: string; cursor?: Cursor }; aux?: { path: Path; key: string; cursor?: Cursor } };
};

export type Top = { nodes: Nodes; root: number; nextLoc: number };

export const getNode = (path: Path, top: Top) => top.nodes[path.children[path.children.length - 1]];

export type Current =
    | { type: 'id'; node: Id<number>; cursor: IdCursor; start?: number; path: Path }
    | {
          type: 'text';
          node: Text<number>;
          cursor: TextCursor | ListCursor;
          path: Path;
      }
    | {
          type: 'list';
          node: Collection<number>;
          cursor: CollectionCursor;
          path: Path;
      };

/*

ok so actually what I want is:
- cursors[] Cursor
- highlight ; SelectionHighlight


*/

type SelectionStatuses = Record<
    string,
    {
        cursors: Cursor[];
        highlight?: Highlight;
    }
>;

type Highlight =
    | { type: 'full' }
    | { type: 'id'; start?: number; end?: number }
    | { type: 'list'; opener: boolean; closer: boolean }
    // TODO table??
    | { type: 'text'; spans: (boolean | { start?: number; end?: number })[] };

// type SelectionStatus =
//     | { type: 'start' | 'end' | 'at'; at: number; text?: string[] }
//     | {
//           type: 'text';
//           // we list out, for each span, what the selection status is
//           spans: (boolean | { type: 'start' | 'end'; at: number; text?: string[] } | { type: 'sub'; start: number; end: number; text?: string[] })[];
//       }
//     // TODO text pls
//     // OHHHK, so if we're between controls, for example,
//     // we need to go over the /items/ of the list, and mark them as `covered`.
//     // yes that makes sense.
//     | { type: 'control'; index: number; rest?: 'before' | 'after' }
//     | { type: 'list'; where: ListWhere; cover?: boolean }
//     | { type: 'sub'; start: number; end: number; text?: string[] }
//     | { type: 'covered' };

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

const ltCursor = (one: Cursor, two: Cursor) => {
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

const orderSelections = (one: SelStart, two: SelStart, top: Top): [SelStart, Path[], SelStart] => {
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
    const path = selection.start.path;
    if (selection.end && selection.end.key !== selection.start.key) {
        // we have a problem
        throw new Error('todo multi');
    }
    const node = getNode(path, top);
    if (node == null) throw new Error('bad path');
    const cursor = selection.start.cursor;
    if (node.type === 'id') {
        if (cursor.type !== 'id') {
            throw new Error(`id select must have cursor id`);
        }
        const ec = selection.end?.cursor;
        if (ec && ec.type !== 'id') {
            throw new Error(`id select must have cursor id (end)`);
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

export type Update = {
    nodes: Record<string, Node | null>;
    root?: number;
    nextLoc?: number;
    selection?: NodeSelection;
};

// export const splitOnCursor = (id: Id<number>, cursor: IdCursor): [string[], string[], string[]] => {
//     const text = cursor.text ?? splitGraphemes(id.text);
//     const left = cursor.start ? Math.min(cursor.start, cursor.end) : cursor.end;
//     const right = cursor.start ? Math.max(cursor.start, cursor.end) : cursor.end;
//     return [text.slice(0, left), text.slice(left, right), text.slice(right)];
// };

export const withPartial = (path: Path, sel?: PartialSel) =>
    sel
        ? {
              start: selStart(pathWithChildren(path, ...sel.children), sel.cursor),
          }
        : undefined;

export const findTableLoc = (rows: number[][], loc: number) => {
    for (let row = 0; row < rows.length; row++) {
        for (let col = 0; col < rows[row].length; col++) {
            if (rows[row][col] === loc) {
                return { row, col };
            }
        }
    }
    return { row: 0, col: 0 };
};
