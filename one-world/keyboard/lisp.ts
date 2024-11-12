// ok
// so, I'd put so much into this `Intermediate Representation`, using that
// as the basis for navigation and rendering and such.
// BUT
// it would seem that I've managed to reduce the /Node/ repsentation down enough
// that I don't need that anymore. Is that so?
// Let's try it, it's for fun.

import { splitGraphemes } from '../../src/parse/splitGraphemes';
import { Collection, Id, List, Node, Nodes, Text } from '../shared/cnodes';
import { addBlankAfter } from './addBlankAfter';
import { replaceIn } from './replaceIn';
import { replaceWithSmooshed } from './replaceWithSmooshed';
import { splitInList } from './splitInList';
import { wrapId } from './wrapId';

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
export type IdCursor = {
    type: 'id';
    start?: number;
    end: number;
    text?: string[];
};
type TextCursor = {
    type: 'text';
    start?: { index: number; cursor: number };
    end: { index: number; cursor: number; text?: string[] };
};
type ListCursor =
    | { type: 'list'; where: 'before' | 'start' | 'inside' | 'end' | 'after' }
    | { type: 'control'; index: number };

export type Cursor = IdCursor | TextCursor | ListCursor;

export type Path = {
    root: { ids: number[]; top: string };
    children: number[];
};

export const pathKey = (path: Path) =>
    `${path.root.ids.join(',')};${path.root.top};${path.children.join(',')}`;
export const selStart = (
    path: Path,
    cursor: Cursor,
): NodeSelection['start'] => ({
    path,
    cursor,
    key: pathKey(path),
});

export type PartialSel = { children: number[]; cursor: Cursor };

export type NodeSelection = {
    start: { path: Path; key: string; cursor: Cursor };
    end?: { path: Path; key: string; cursor: Cursor };
};

export type Top = { nodes: Nodes; root: number; nextLoc: number };

const getNode = (path: Path, top: Top) =>
    top.nodes[path.children[path.children.length - 1]];

type Current =
    | { type: 'id'; node: Id<number>; cursor: Extract<Cursor, { type: 'id' }> }
    | {
          type: 'text';
          node: Text<number>;
          cursor: Extract<Cursor, { type: 'text' }>;
      }
    | {
          type: 'list';
          node: Collection<number>;
          cursor: Extract<Cursor, { type: 'list' | 'control' }>;
      };

const getCurrent = (selection: NodeSelection, top: Top): Current => {
    const node = getNode(selection.start.path, top);
    if (node == null) throw new Error('bad path');
    const cursor = selection.start.cursor;
    if (node.type === 'id') {
        if (cursor.type !== 'id') {
            throw new Error(`id select must have cursor id`);
        }
        return { type: 'id', node, cursor };
    }
    if (node.type === 'text') {
        if (cursor.type !== 'text') {
            throw new Error(`text select must have cursor text`);
        }
        return { type: 'text', node, cursor };
    }
    if (node.type === 'list' || node.type === 'table') {
        if (cursor.type !== 'list' && cursor.type !== 'control') {
            throw new Error(`list/table select must have cursor list`);
        }
        return { type: 'list', node, cursor };
    }
    throw new Error('unknown node and cursor combo');
};

export type Update = {
    nodes: Record<string, Node | null>;
    root?: number;
    nextLoc?: number;
    selection?: NodeSelection;
};

export const splitOnCursor = (
    id: Id<number>,
    cursor: IdCursor,
): [string[], string[], string[]] => {
    const text = cursor.text ?? splitGraphemes(id.text);
    return [
        text.slice(0, cursor.start ?? cursor.end),
        text.slice(cursor.start ?? cursor.end, cursor.end),
        text.slice(cursor.end),
    ];
};

// const splitSmooshed =  (path: number[], top: Top): Update => {
// }

export const parentSmooshed = (
    top: Top,
    path: number[],
): List<number> | null => {
    if (path.length <= 1) return null;
    const ploc = path[path.length - 2];
    const parent = top.nodes[ploc];
    return parent.type === 'list' && parent.kind === 'smooshed' ? parent : null;
};

export const withPartial = (path: Path, sel?: PartialSel) =>
    sel
        ? {
              start: selStart(
                  pathWithChildren(path, ...sel.children),
                  sel.cursor,
              ),
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

export const replaceAt = (
    path: number[],
    top: Top,
    old: number,
    loc: number,
): Update => {
    if (path.length === 0) {
        if (old !== top.root) {
            throw new Error(
                `expected ${old} to be root of top, but found ${top.root}`,
            );
        }
        return { nodes: {}, root: loc };
    }
    const ploc = path[path.length - 1];
    const pnode = top.nodes[ploc];
    return { nodes: { [ploc]: replaceIn(pnode, old, loc) } };
};

const idHandlers: Record<
    string,
    (node: Id<number>, cursor: IdCursor, path: Path, top: Top) => Update | void
> = {
    ' ': (node, cursor, path, top) => splitInList(node, cursor, path, top),
};

const listHandlers: Record<
    string,
    (
        node: Collection<number>,
        cursor: ListCursor,
        path: Path,
        top: Top,
    ) => Update | void
> = {
    ' ': (node, cursor, path, top) => {
        if (cursor.type === 'control') return;
        switch (cursor.where) {
            case 'after':
            case 'end':
                return addBlankAfter(node.loc, path, top);
        }
    },
};

const opens = { '(': 'round', '[': 'square', '{': 'curly' } as const;
Object.entries(opens).forEach(([key, kind]) => {
    idHandlers[key] = (node, cursor, path, top) =>
        wrapId(node, kind, cursor, path, top);
});

const closes = { ')': 'round', ']': 'square', '}': 'curly' } as const;
Object.entries(closes).forEach(([key, kind]) => {
    idHandlers[key] = (node, cursor, path, top): Update | void =>
        afterCloser(top, path, kind);
    listHandlers[key] = (node, cursor, path, top): Update | void =>
        afterCloser(top, path, kind);
});

const afterCloser = (
    top: Top,
    path: Path,
    kind: List<number>['kind'],
): Update | void => {
    for (let i = path.children.length - 1; i >= 0; i--) {
        const pnode = top.nodes[path.children[i]];
        if (pnode.type === 'list' && pnode.kind === kind) {
            return {
                nodes: {},
                selection: {
                    start: selStart(
                        { ...path, children: path.children.slice(0, i + 1) },
                        { type: 'list', where: 'after' },
                    ),
                },
            };
        }
    }
};

export const isBlank = (id: Id<number>, cursor: IdCursor) => {
    return cursor.text ? cursor.text.length === 0 : id.text === '';
};

export const isPunct = (id: Id<number>, cursor: IdCursor) => {
    return cursor.text
        ? cursor.text.every((t) => ops.includes(t))
        : splitGraphemes(id.text).every((t) => ops.includes(t));
};

const ops = [...'.=#@;+'];

// ops.forEach((key) => {
//     idHandlers[key] = (id, cursor, path, top) => {
//         if (isPunct(id, cursor)) {
//             return idType(id, cursor, path, key);
//         }
//         return splitSmooshed(id, cursor, path, top, key);
//     };
// });

const splitSmooshed = (
    id: Id<number>,
    cursor: IdCursor,
    path: Path,
    top: Top,
    key: string,
) => {
    let [left, mid, right] = splitOnCursor(id, cursor);

    if (!left.length && !right.length) {
        throw new Error('not for splitting');
    }

    const nodes: Nodes = {};
    const replace: number[] = [];
    let nextLoc = top.nextLoc;
    if (left.length) {
        nodes[id.loc] = { ...id, text: left.join('') };
        replace.push(id.loc);
    }

    const n = nextLoc++;
    nodes[n] = { type: 'id', text: key, loc: n };
    replace.push(n);

    if (right.length) {
        if (!left.length) {
            nodes[id.loc] = { ...id, text: right.join('') };
            replace.push(id.loc);
        } else {
            const r = nextLoc++;
            nodes[r] = { type: 'id', text: right.join(''), loc: r };
            replace.push(r);
        }
    }

    const update = replaceWithSmooshed(
        path,
        { ...top, nextLoc },
        id.loc,
        replace,
        {
            children: [n],
            cursor: { type: 'id', end: 1 },
        },
    );
    Object.assign(update.nodes, nodes);
    return update;
};

const idType = (
    node: Id<number>,
    cursor: IdCursor,
    path: Path,
    top: Top,
    key: string,
): Update => {
    if (!isBlank(node, cursor)) {
        if (ops.includes(key)) {
            if (!isPunct(node, cursor)) {
                return splitSmooshed(node, cursor, path, top, key);
            }
        } else if (isPunct(node, cursor)) {
            return splitSmooshed(node, cursor, path, top, key);
        }
    }

    let [left, mid, right] = splitOnCursor(node, cursor);
    return {
        nodes: {},
        selection: {
            start: selStart(path, {
                type: 'id',
                text: [...left, key, ...right],
                end: left.length + 1,
            }),
        },
    };
};

export const handleKey = (
    selection: NodeSelection,
    top: Top,
    key: string,
): Update | void => {
    if (selection.end) return; // TODO :/

    const current = getCurrent(selection, top);

    if (current.type === 'id') {
        const fn = idHandlers[key];
        if (fn != null) {
            return fn(current.node, current.cursor, selection.start.path, top);
        }
        return idType(
            current.node,
            current.cursor,
            selection.start.path,
            top,
            key,
        );
    }

    if (current.type === 'list') {
        const fn = listHandlers[key];
        if (fn != null) {
            return fn(current.node, current.cursor, selection.start.path, top);
        }
        // return idType(current.node, current.cursor, selection.start.path, key);
    }

    // throw new Error(`not handling ${current.type}: ${key}`);
    // TODO: after an update:
    // - verify the `nextLoc` invariant
    // - verify the smooshed invariant
    // - verify that the selection is valid
};

export const lastChild = (path: Path) =>
    path.children[path.children.length - 1];
export const parentLoc = (path: Path) =>
    path.children[path.children.length - 2];
export const gparentLoc = (path: Path) =>
    path.children[path.children.length - 3];
export const parentPath = (path: Path): Path => ({
    ...path,
    children: path.children.slice(0, -1),
});
export const pathWithChildren = (path: Path, ...children: number[]) => ({
    ...path,
    children: path.children.concat(children),
});
