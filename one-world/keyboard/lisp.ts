// ok
// so, I'd put so much into this `Intermediate Representation`, using that
// as the basis for navigation and rendering and such.
// BUT
// it would seem that I've managed to reduce the /Node/ repsentation down enough
// that I don't need that anymore. Is that so?
// Let's try it, it's for fun.

import { splitGraphemes } from '../../src/parse/splitGraphemes';
import {
    Collection,
    Id,
    List,
    ListKind,
    Node,
    Nodes,
    Text,
} from '../shared/cnodes';

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
type IdCursor = { type: 'id'; start?: number; end: number; text?: string[] };
type TextCursor = {
    type: 'text';
    start?: { index: number; cursor: number };
    end: { index: number; cursor: number; text?: string[] };
};
type ListCursor =
    | { type: 'list'; where: 'before' | 'start' | 'inside' | 'end' | 'after' }
    | { type: 'control'; index: number };

export type Cursor = IdCursor | TextCursor | ListCursor;

type Path = {
    root: { ids: number[]; top: string };
    children: number[];
};

const pathKey = (path: Path) =>
    `${path.root.ids.join(',')};${path.root.top};${path.children.join(',')}`;
const selStart = (path: Path, cursor: Cursor): NodeSelection['start'] => ({
    path,
    cursor,
    key: pathKey(path),
});

type NodeSelection = {
    start: { path: Path; key: string; cursor: Cursor };
    end?: { path: Path; key: string; cursor: Cursor };
};

type Top = { nodes: Nodes; root: number; nextLoc: number };

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

type Update = {
    nodes: Record<string, Node | null>;
    root?: number;
    nextLoc?: number;
    selection?: NodeSelection;
};

const splitOnCursor = (
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

const parentSmooshed = (top: Top, path: number[]): List<number> | null => {
    if (path.length <= 1) return null;
    const ploc = path[path.length - 2];
    const parent = top.nodes[ploc];
    return parent.type === 'list' && parent.kind === 'smooshed' ? parent : null;
};

const wrapId = (
    id: Id<number>,
    kind: ListKind<number>,
    cursor: IdCursor,
    // includes the ID of the current node btw
    path: number[],
    top: Top,
): Update => {
    let [left, mid, right] = splitOnCursor(id, cursor);
    // If selecting to end, pretend it's just a cursor in the middle
    if (mid.length && !right.length) {
        right = mid;
        mid = [];
    }

    if (mid.length) {
        let nextLoc = top.nextLoc;
        const listLoc = nextLoc++;

        if (!right.length)
            throw new Error(
                `this should be treated as a normal split by splitOnCursor`,
            );

        if (left.length) {
            const midLoc = nextLoc++;
            const rightLoc = nextLoc++;
            const nodes: Nodes = {
                [listLoc]: {
                    type: 'list',
                    kind,
                    children: [midLoc],
                    loc: listLoc,
                },
                [id.loc]: { ...id, text: left.join('') },
                [midLoc]: { type: 'id', loc: midLoc, text: mid.join('') },
                [rightLoc]: { type: 'id', loc: rightLoc, text: right.join('') },
            };
            const update = replaceWithSmooshed(
                path,
                { ...top, nextLoc },
                id.loc,
                [id.loc, listLoc, rightLoc],
            );
            Object.assign(update.nodes, nodes);
            return update;
        }

        const rightLoc = nextLoc++;
        const nodes: Nodes = {
            [listLoc]: {
                type: 'list',
                kind,
                children: [id.loc],
                loc: listLoc,
            },
            [id.loc]: { ...id, text: mid.join('') },
            [rightLoc]: { type: 'id', loc: rightLoc, text: right.join('') },
        };
        const update = replaceWithSmooshed(path, { ...top, nextLoc }, id.loc, [
            listLoc,
            rightLoc,
        ]);
        Object.assign(update.nodes, nodes);
        return update;
    }

    if (left.length) {
        let nextLoc = top.nextLoc;
        const listLoc = nextLoc++;
        const rightLoc = nextLoc++;
        const nodes: Nodes = {
            [listLoc]: {
                type: 'list',
                kind,
                children: [rightLoc],
                loc: listLoc,
            },
            [id.loc]: { ...id, text: left.join('') },
            [rightLoc]: {
                type: 'id',
                loc: rightLoc,
                text: right.join(''),
            },
        };

        const update = replaceWithSmooshed(path, { ...top, nextLoc }, id.loc, [
            id.loc,
            listLoc,
        ]);
        Object.assign(update.nodes, nodes);

        return update;
    }

    let nextLoc = top.nextLoc;
    const newLoc = nextLoc++;
    const update = replaceAt(path.slice(0, -1), top, id.loc, newLoc);
    update.nodes[newLoc] = {
        type: 'list',
        kind,
        children: [id.loc],
        loc: newLoc,
    };
    update.nextLoc = nextLoc;
    return update;
};

const replaceWithSmooshed = (
    path: number[],
    top: Top,
    old: number,
    locs: number[],
) => {
    const parent = parentSmooshed(top, path);
    if (parent) {
        const children = parent.children.slice();
        const at = parent.children.indexOf(old);
        if (at === -1) {
            throw new Error(`id ${old} not a child of ${parent.loc}`);
        }
        children.splice(at, 1, ...locs);
        return { nodes: { [parent.loc]: { ...parent, children } } };
    }

    let nextLoc = top.nextLoc;
    const parentLoc = nextLoc++;
    const update = replaceAt(path.slice(0, -1), top, old, parentLoc);
    update.nodes[parentLoc] = {
        type: 'list',
        kind: 'smooshed',
        children: locs,
        loc: parentLoc,
    };
    update.nextLoc = nextLoc;
    return update;
};

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

const replaceWithSpaced = (
    path: number[],
    top: Top,
    old: number,
    locs: number[],
): Update['nodes'] => {
    if (path.length <= 1) throw new Error(`no parent`);
    const ploc = path[path.length - 2];
    const parent = top.nodes[ploc];

    if (parent.type === 'id') throw new Error(`id cant be parent`);
    if (parent.type === 'text') {
        const spans = parent.spans.slice();
        const at = spans.findIndex((s) => s.type === 'embed' && s.item === old);
        if (at === -1) throw new Error(`not in parent`);
        const insert: Text<number>['spans'] = [];
        for (let i = 0; i < locs.length; i++) {
            if (i > 0) {
                insert.push({ type: 'text', text: ' ' });
            }
            insert.push({ type: 'embed', item: locs[i] });
        }
        spans.splice(at, 1, ...insert);
        return { [ploc]: { ...parent, spans } };
    }

    if (parent.type === 'table') {
        const rows = parent.rows.slice();
        const { row, col } = findTableLoc(rows, old);
        rows[row].splice(col, 1, ...locs);
        // soo ... we want to always keep rows the same length, btw
        // TODO: readjust the other table columns thanks
        // const maxCols = rows.reduce((m, r) => Math.max(m, r.length), 0);
        return { [ploc]: { ...parent, rows } };
    }

    if (parent.kind === 'smooshed') {
        throw new Error(`parent is smooshed, cannot insert spaced items`);
    }

    // const parent = parentSmooshed(top, path);
    const children = parent.children.slice();
    const at = parent.children.indexOf(old);
    if (at === -1) {
        throw new Error(`id ${old} not a child of ${parent.loc}`);
    }
    children.splice(at, 1, ...locs);
    return { [parent.loc]: { ...parent, children } };
};

const replaceAt = (
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
    const ploc = path[path.length - 2];
    const pnode = top.nodes[ploc];
    return { nodes: { [ploc]: replaceIn(pnode, old, loc) } };
};

const replaceIn = (node: Node, old: number, loc: number): Node => {
    if (node.type === 'id') {
        throw new Error(`no children of id`);
    }
    if (node.type === 'text') {
        const at = node.spans.findIndex(
            (span) => span.type === 'embed' && span.item === old,
        );
        if (at === -1)
            throw new Error(`cant find ${old} child of text ${node.loc}`);
        const spans = node.spans.slice();
        spans[at] = { type: 'embed', item: loc };
        return { ...node, spans };
    }
    if (node.type === 'list') {
        const at = node.children.indexOf(old);
        if (at === -1)
            throw new Error(`cant find ${old} child of list ${node.loc}`);
        const children = node.children.slice();
        children[at] = loc;
        return { ...node, children };
    }
    if (node.type === 'table') {
        const rows = node.rows.slice();
        let found = false;
        for (let i = 0; i < rows.length; i++) {
            const at = rows[i].indexOf(old);
            if (at !== -1) {
                found = true;
                rows[i] = rows[i].slice();
                rows[i][at] = loc;
                break;
            }
        }
        if (!found)
            throw new Error(`cant find ${old} child of table ${node.loc}`);
        return { ...node, rows };
    }
    throw new Error(`unexpected node type ${(node as any).type}`);
};

const idHandlers: Record<
    string,
    (node: Id<number>, cursor: IdCursor, path: Path, top: Top) => Update
> = {
    ' ': (node, cursor, path, top) => splitInList(node, cursor, path, top),
};

const opens = { '(': 'round', '[': 'square', '{': 'curly' } as const;
Object.entries(opens).forEach(([key, kind]) => {
    idHandlers[key] = (node, cursor, path, top) =>
        wrapId(node, kind, cursor, path.children, top);
});

const ops = [...'.=#@;'];
ops.forEach((key) => {
    // idHandlers[key] = (node, cursor, path, top) => 0; //
});

export const handleKey = (selection: NodeSelection, top: Top, key: string) => {
    if (selection.end) return; // TODO :/

    const current = getCurrent(selection, top);
};

const lastChild = (path: Path) => path.children[path.children.length - 1];
const parentLoc = (path: Path) => path.children[path.children.length - 2];
const gparentLoc = (path: Path) => path.children[path.children.length - 3];
const parentPath = (path: Path): Path => ({
    ...path,
    children: path.children.slice(0, -1),
});
const pathWithChildren = (path: Path, ...children: number[]) => ({
    ...path,
    children: path.children.concat(children),
});

const addBlankAfter = (loc: number, path: Path, top: Top): Update => {
    const ploc = parentLoc(path);
    const pnode = top.nodes[ploc];
    if (pnode.type === 'list' && pnode.kind === 'smooshed') {
        if (path.children.length < 3) throw new Error('neet to split top');
        const gloc = gparentLoc(path);
        const gnode = top.nodes[gloc];
        if (gnode.type === 'list' && gnode.kind === 'smooshed') {
            throw new Error('double smoosked');
        }
        const pat = pnode.children.indexOf(loc);
        if (pat === -1) throw new Error('not in parent');
        if (pat === pnode.children.length - 1) {
            return addBlankAfter(ploc, parentPath(path), top);
        }
        const left = pnode.children.slice(0, pat + 1);
        const right = pnode.children.slice(pat);
        let nextLoc = top.nextLoc;
        const nodes: Update['nodes'] = {};
        const replace: number[] = [];

        if (left.length === 1) {
            if (right.length === 1) {
                nodes[ploc] = null;
                replace.push(left[0], right[0]);
            } else {
                nodes[ploc] = { ...pnode, children: right };
                replace.push(left[0], ploc);
            }
        } else {
            if (right.length === 1) {
                replace.push(ploc, right[0]);
            } else {
                const rloc = nextLoc++;
                nodes[rloc] = {
                    type: 'list',
                    kind: 'smooshed',
                    children: right,
                    loc: rloc,
                };
                replace.push(ploc, rloc);
            }
        }

        return {
            nodes: {
                ...nodes,
                ...replaceWithSpaced(
                    parentPath(path).children,
                    top,
                    ploc,
                    replace,
                ),
            },
            nextLoc,
        };
    }

    let nextLoc = top.nextLoc;
    const nloc = nextLoc++;
    return {
        nodes: {
            [nloc]: { type: 'id', text: '', loc: nloc },
            ...replaceWithSpaced(path.children, top, loc, [loc, nloc]),
        },
        nextLoc,
        selection: {
            start: selStart(pathWithChildren(parentPath(path), nloc), {
                type: 'id',
                end: 0,
            }),
        },
    };
};

function splitInList(
    id: Id<number>,
    cursor: IdCursor,
    path: Path,
    top: Top,
): Update {
    const [left, mid, right] = splitOnCursor(id, cursor);

    if (path.children.length === 1) throw new Error('catn split top yet');

    if (!right.length) {
        return addBlankAfter(id.loc, path, top);
    }
    if (!left.length) {
        // return addBlankBefore(id, path, top);
        throw new Error('blank before');
    }

    const ploc = parentLoc(path);
    const pnode = top.nodes[ploc];
    if (pnode.type === 'list' && pnode.kind === 'smooshed') {
        // need to go up one more level
        // NOTE it should be impossible to get into a double-smooshed situation
        if (path.children.length < 3) throw new Error('neet to split top');
        const gloc = gparentLoc(path);
        const gnode = top.nodes[gloc];
        if (gnode.type === 'list' && gnode.kind === 'smooshed') {
            throw new Error('double smoosked');
        }
        const pat = pnode.children.indexOf(id.loc);
        if (pat === -1) throw new Error('not in parent');
        const cleft = pnode.children.slice(0, pat + 1);
        const cright = pnode.children.slice(pat + 1);
        let nextLoc = top.nextLoc;
        const rloc = nextLoc++;
        cright.unshift(rloc);

        const nodes: Update['nodes'] = {
            [id.loc]: { ...id, text: left.join('') },
            [rloc]: { type: 'id', text: right.join(''), loc: rloc },
        };

        const replace: number[] = [];
        if (cleft.length === 1) {
            replace.push(id.loc);
            nodes[pnode.loc] = null;
        } else {
            replace.push(ploc);
            nodes[pnode.loc] = { ...pnode, children: cleft };
        }

        if (cright.length > 1) {
            if (cleft.length === 1) {
                nodes[pnode.loc] = { ...pnode, children: cright };
                replace.push(ploc);
            } else {
                const rploc = nextLoc++;
                nodes[rploc] = {
                    type: 'list',
                    kind: 'smooshed',
                    children: cright,
                    loc: rploc,
                };
                replace.push(rploc);
            }
        } else {
            replace.push(rloc);
        }

        return {
            nodes: {
                ...nodes,
                ...replaceWithSpaced(
                    path.children.slice(0, -1),
                    { ...top, nextLoc: top.nextLoc },
                    ploc,
                    replace,
                ),
            },
            nextLoc,
        };
    }

    // // a|b -> a b
    // // a()|b -> a() b
    // for (let i = path.length - 1; i >= 0; i--) {
    //     const pnode = top.nodes[path[i]];
    //     if (pnode.type === 'text') {
    //         throw new Error('not impl, need to wrap in () prolly?');
    //     }
    //     if (pnode.type === 'list' && pnode.kind !== 'smooshed') {
    //         // bingo
    //     }
    // }
    // throw new Error('um split bad idk');

    let nextLoc = top.nextLoc;
    const rLoc = nextLoc++;
    return {
        nodes: {
            ...replaceWithSpaced(path.children, top, id.loc, [id.loc, rLoc]),
            [rLoc]: { type: 'id', text: right.join(''), loc: rLoc },
            [id.loc]: { ...id, text: left.join('') },
        },
        nextLoc,
    };
}
