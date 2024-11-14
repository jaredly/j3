/**
 * Ok, so here we're going to try something new.
 * to reduce all of the complicated logic.
 *
 * round(spaced(smoosh(+ abc) def) 123)
 * will be converted to
 *
 * + abc [space] def [comma] 123
 *
 * and then we do the change on that flat list
 * and then we ~parse it back into the structured representation.

ooooh
ok hrm
this does beg the question:
should it be stored flat?
like,
parsers will definitely want to be working with the structured version
but
ok yeah for display and formatting and stuff we want it structured.
yeah let's store it structured, good talk folks.

Game plan:
- create an alternate `insertId` that should pass all the tests
- profit

 */
import { splitGraphemes } from '../../src/parse/splitGraphemes';
import { Id, List, Node } from '../shared/cnodes';
import { cursorSides, cursorSplit } from './cursorSplit';
import { Kind, textKind } from './insertId';
import { replaceAt } from './replaceAt';
import { Cursor, IdCursor, ListCursor, Path, Top, Update, lastChild, parentPath, selStart } from './utils';
export type Config = { tight: string; space: string; sep: string };

export const handleIdKey = (config: Config, top: Top, path: Path, cursor: IdCursor, grem: string): Update => {
    const current = top.nodes[lastChild(path)];
    if (current.type !== 'id') throw new Error('not id');
    const kind = textKind(grem, config);

    if (kind === 'id' || kind === 'tight') {
        console.log('hand', kind, grem, current.punct, current);
        if (current.punct == null) {
            return {
                nodes: { [current.loc]: { ...current, punct: kind === 'tight', text: grem } },
                selection: { start: selStart(path, { type: 'id', end: 1 }) },
            };
        }

        if (current.punct === (kind === 'tight')) {
            // Just update the selection
            const chars = cursor.text?.slice() ?? splitGraphemes(current.text);
            const { left, right } = cursorSides(cursor);
            chars.splice(left, right - left, grem);
            return { nodes: {}, selection: { start: selStart(path, { ...cursor, text: chars, end: left + 1 }) } };
        }
    }

    const parent = findParent(listKindForKeyKind(kind), parentPath(path), top);
    const flat = parent ? flatten(parent.node, top) : [current];
    const at = flat.indexOf(current);
    if (at === -1) throw new Error(`flatten didnt work I guess`);

    const nodes: Update['nodes'] = {};

    const split = cursorSplit(current.text, cursor);

    // console.log('before', flat);

    const neighbor: Flat =
        kind === 'sep'
            ? { type: 'sep', loc: -1 }
            : kind === 'space'
            ? { type: 'space', loc: -1 }
            : { type: 'id', text: grem, loc: -1, punct: kind === 'tight' };

    let sel: Node = current;
    let ncursor: Cursor = cursor;

    switch (split.type) {
        case 'before': {
            addNeighborBefore(at, flat, neighbor);
            break;
        }
        case 'after': {
            ({ sel, ncursor } = addNeighborAfter(at, flat, neighbor, sel, ncursor));
            break;
        }
        case 'between': {
            nodes[current.loc] = { ...current, text: split.left };
            flat.splice(at + 1, 0, neighbor, (sel = { type: 'id', text: split.right, loc: -1, punct: current.punct }));
            ncursor = { type: 'id', end: 0 };
            break;
        }
    }

    // console.log('after', flat);

    return flatToUpdate(flat, top, nodes, parent, kind, sel, ncursor, current, path);
};

export const listKindForKeyKind = (kind: Kind): 0 | 1 | 2 => (kind === 'sep' ? OTHER : kind === 'space' ? SPACED : SMOOSH);

export type Flat = Node | { type: 'space'; loc: number } | { type: 'sep'; loc: number };

const interleave = <T>(items: T[], sep: T) => {
    const res: T[] = [];
    items.forEach((item, i) => {
        if (i > 0) {
            res.push(sep);
        }
        res.push(item);
    });
    return res;
};

type Rough = { type: 'rough'; children: (Rough | Node)[]; loc: number; kind: 'other' | 'spaced' | 'smooshed' };
const nough = (kind: 'other' | 'spaced' | 'smooshed', children: Rough['children'] = []): Rough => ({ kind, children, loc: -1, type: 'rough' });

const roughen = (flat: Flat[], top: Top, nodes: Update['nodes'], base: List<number>['kind'], sel: { node: Node; cursor: Cursor }) => {
    let smooshed = nough('smooshed');
    let spaced = nough('spaced', [smooshed]);
    const other = nough('other', [spaced]);

    flat.forEach((item) => {
        if (item.type === 'sep') {
            smooshed = nough('smooshed');
            spaced = nough('spaced', [smooshed]);
            other.children.push(spaced);
            if (item.loc !== -1) other.loc = item.loc;
        } else if (item.type === 'space') {
            smooshed = nough('smooshed');
            spaced.children.push(smooshed);
            if (item.loc !== -1) spaced.loc = item.loc;
        } else {
            smooshed.children.push(item);
        }
    });

    let nextLoc = top.nextLoc;

    let selPath: number[] = [];

    const handle = (rough: Rough, path: number[]): number => {
        // lol this is way too complex
        const cpath = rough.children.length === 1 ? path : path.concat(rough.loc === -1 || nodes[rough.loc] ? (rough.loc = nextLoc++) : rough.loc);
        const locs = rough.children.map((child) => {
            if (child.type === 'rough') {
                return handle(child, cpath);
            }
            if (child !== top.nodes[child.loc]) {
                const loc = child.loc === -1 ? nextLoc++ : child.loc;
                nodes[loc] = { ...child, loc };
                if (child === sel.node) {
                    selPath = cpath.concat([loc]);
                }
                return loc;
            }
            if (child === sel.node) {
                selPath = cpath.concat([child.loc]);
            }
            return child.loc;
        });
        if (locs.length === 1) return locs[0];
        const loc = rough.loc;
        const node: Node = {
            type: 'list',
            loc,
            children: locs,
            kind: rough.kind === 'other' ? base : rough.kind,
        };
        nodes[loc] = node;
        return loc;
    };

    return { root: handle(other, []), nextLoc, selection: { children: selPath, cursor: sel.cursor } };
};

export const flatten = (node: Node, top: Top, depth: number = 0): Flat[] => {
    if (node.type !== 'list') return [node];
    if (node.kind === 'smooshed') {
        return node.children.map((id) => top.nodes[id]);
    }
    if (node.kind === 'spaced') {
        return interleave(
            node.children.map((id) => flatten(top.nodes[id], top, depth + 1)),
            [{ type: 'space', loc: node.loc }],
        ).flat();
    }
    if (depth > 0) return [node]; // dont flatten nested lists
    return interleave(
        node.children.map((id) => flatten(top.nodes[id], top, depth + 1)),
        [{ type: 'sep', loc: node.loc }],
    ).flat();
};

/*
kind:
- tight / id / string
    - want a smooshed
- space
    - want a spaced
- sep
    - want a list(other)
*/

const SMOOSH = 0;
const SPACED = 1;
const OTHER = 2;

export const findParent = (kind: 0 | 1 | 2, path: Path, top: Top): void | { node: List<number>; path: Path } => {
    const loc = lastChild(path);
    if (loc == null) return;
    const node = top.nodes[loc];
    if (node.type !== 'list') return;

    const got = node.kind === 'smooshed' ? SMOOSH : node.kind === 'spaced' ? SPACED : OTHER;

    if (got > kind) return;

    // try a level higher?
    if (got < kind) {
        const up = findParent(kind, parentPath(path), top);
        if (up) return up;
    }

    return { node, path };
};

const collapseAdjacentIds = (flat: Flat[]) => {
    const rm: number[] = [];
    flat.forEach((item, i) => {
        if (rm.includes(i)) return;
        const next = flat[i + 1];
        if (item.type === 'id' && i < flat.length - 1 && next.type === 'id') {
            if (item.text === '') {
                rm.push(i);
            } else if (next.text === '') {
                rm.push(i + 1);
            } else if (next.punct === item.punct) {
                if (item.loc === -1) {
                    flat[i + 1] = { ...next, text: item.text + next.text };
                    rm.push(i);
                } else {
                    flat[i] = { ...item, text: item.text + next.text };
                    rm.push(i + 1);
                }
            }
        }
    });
    return flat.filter((_, i) => !rm.includes(i));
};

export function flatToUpdate(
    flat: Flat[],
    top: Top,
    nodes: Record<string, Node | null>,
    parent: void | { node: List<number>; path: Path },
    kind: string,
    sel: Node,
    ncursor: ListCursor | IdCursor,
    current: Node,
    path: Path,
) {
    flat = collapseAdjacentIds(flat);

    const { root, nextLoc, selection } = roughen(
        flat,
        top,
        nodes,
        parent ? parent.node.kind : kind === 'sep' ? 'round' : kind === 'space' ? 'spaced' : 'smooshed',
        { node: sel, cursor: ncursor },
    );

    let nroot = undefined;

    if (parent && root !== parent.node.loc) {
        const up = replaceAt(parent.path.children.slice(0, -1), top, parent.node.loc, root);
        nroot = up.root;
        Object.assign(nodes, up.nodes);
    }
    if (!parent && root !== current.loc) {
        // throw new Error('need rebasee');
        const up = replaceAt(path.children.slice(0, -1), top, current.loc, root);
        nroot = up.root;
        Object.assign(nodes, up.nodes);
    }

    return {
        root: nroot,
        nodes,
        nextLoc,
        selection: {
            start: selStart({ ...path, children: parentPath(parent?.path ?? path).children.concat(selection.children) }, selection.cursor),
        },
    };
}

export function addNeighborAfter(
    at: number,
    flat: Flat[],
    neighbor: Id<number> | { type: 'space'; loc: number } | { type: 'sep'; loc: number },
    sel: Node,
    ncursor: Cursor,
) {
    if (at < flat.length - 1 && flat[at + 1].type === 'space' && neighbor.type === 'space') {
        sel = flat[at + 2] as Node;
        ncursor = sel.type === 'id' ? { type: 'id', end: 0 } : { type: 'list', where: 'before' };
    } else if (at < flat.length - 1 && flat[at + 1].type === 'id') {
        sel = flat[at + 1] as Id<number>;
        ncursor = { type: 'id', end: 0 };
        flat.splice(at + 1, 0, neighbor);
    } else if (neighbor.type === 'id') {
        flat.splice(at + 1, 0, (sel = neighbor));
        ncursor = { type: 'id', end: splitGraphemes(neighbor.text).length };
    } else {
        flat.splice(at + 1, 0, neighbor, (sel = { type: 'id', text: '', loc: -1 }));
        ncursor = { type: 'id', end: 0 };
    }
    return { sel, ncursor };
}

export function addNeighborBefore(at: number, flat: Flat[], neighbor: Id<number> | { type: 'space'; loc: number } | { type: 'sep'; loc: number }) {
    if ((at !== 0 && flat[at - 1].type === 'id') || (at === 0 && neighbor.type === 'id')) {
        flat.splice(at, 0, neighbor);
    } else {
        flat.splice(at, 0, { type: 'id', text: '', loc: -1 }, neighbor);
    }
}
