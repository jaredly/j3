import { splitGraphemes } from '../../src/parse/splitGraphemes';
import { Nodes, Id, Collection, Text, Node, TextSpan } from '../shared/cnodes';
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
- highlight : SelectionHighlight

*/

export type SelectionStatuses = Record<
    string,
    {
        cursors: Cursor[];
        highlight?: Highlight;
    }
>;

export type Highlight =
    | { type: 'full' }
    | { type: 'id'; start?: number; end?: number }
    | { type: 'list'; opener: boolean; closer: boolean; paired?: number }
    // TODO table??
    | { type: 'text'; spans: (boolean | { start?: number; end?: number })[]; opener: boolean; closer: boolean };

/*

TopAction = {
    type: 'update',
    nodes: Record<string, Node | null>;
    root?: number;
    nextLoc?: number;
    // the selectionChange would update the Selection to the new dealio, right?
    selectionChange?: SelectionChange;
}

{
    type: 'selection',
}

Action...

ok, so an update should ... also have like a 'selectionDiff'

*/

export type SelectionUpdate =
    | {
          type: 'id';
          fromPath: Path;
          toPath: Path;
          fromOffset: number;
          toOffset: number;
      }
    | {
          // jumping, annnd. it should only apply to the single one.
          type: 'jump';
          // from: NodeSelection,
          to: NodeSelection;
      }
    | {
          type: 'text';
          fromPath: Path;
          toPath: Path;
          fromIndex: number;
          fromOffset: number;
          toIndex: number;
          toOffset: number;
      };

export type Update = {
    nodes: Record<string, Node | null>;
    root?: number;
    nextLoc?: number;
    selection?: NodeSelection;
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
