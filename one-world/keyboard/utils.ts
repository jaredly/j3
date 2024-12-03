import { splitGraphemes } from '../../src/parse/splitGraphemes';
import { Nodes, Id, Collection, Text, Node } from '../shared/cnodes';

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
    start?: number;
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

export type NodeSelection = {
    start: { path: Path; key: string; cursor: Cursor; returnToHoriz?: number };
    multi?: { end: { path: Path; key: string; cursor?: Cursor }; aux?: { path: Path; key: string; cursor?: Cursor } };
};

export type Top = { nodes: Nodes; root: number; nextLoc: number };

export const getNode = (path: Path, top: Top) => top.nodes[path.children[path.children.length - 1]];

export type Current =
    | { type: 'id'; node: Id<number>; cursor: Extract<Cursor, { type: 'id' }>; path: Path }
    | {
          type: 'text';
          node: Text<number>;
          cursor: Extract<Cursor, { type: 'text' | 'list' }>;
          path: Path;
      }
    | {
          type: 'list';
          node: Collection<number>;
          cursor: Extract<Cursor, { type: 'list' | 'control' }>;
          path: Path;
      };

export const getCurrent = (selection: NodeSelection, top: Top): Current => {
    const path = selection.start.path;
    const node = getNode(path, top);
    if (node == null) throw new Error('bad path');
    const cursor = selection.start.cursor;
    if (node.type === 'id') {
        if (cursor.type !== 'id') {
            throw new Error(`id select must have cursor id`);
        }
        return { type: 'id', node, cursor, path };
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

export const splitOnCursor = (id: Id<number>, cursor: IdCursor): [string[], string[], string[]] => {
    const text = cursor.text ?? splitGraphemes(id.text);
    const left = cursor.start ? Math.min(cursor.start, cursor.end) : cursor.end;
    const right = cursor.start ? Math.max(cursor.start, cursor.end) : cursor.end;
    return [text.slice(0, left), text.slice(left, right), text.slice(right)];
};

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
