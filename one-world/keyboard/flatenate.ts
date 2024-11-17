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
import { Kind } from './insertId';
import { interleave } from './interleave';
import { replaceAt } from './replaceAt';
import { Cursor, ListCursor, Path, Top, Update, lastChild, parentPath, selStart } from './utils';

export const listKindForKeyKind = (kind: Kind): 0 | 1 | 2 => (kind === 'sep' ? OTHER : kind === 'space' ? SPACED : SMOOSH);

export type Flat = Node | { type: 'space'; loc: number } | { type: 'sep'; loc: number };

type Rough = { type: 'rough'; children: (Rough | Node)[]; loc: number; kind: 'other' | 'spaced' | 'smooshed' };
const nough = (kind: 'other' | 'spaced' | 'smooshed', children: Rough['children'] = []): Rough => ({ kind, children, loc: -1, type: 'rough' });

const roughen = (flat: Flat[], top: Top, nodes: Update['nodes'], parent: FlatParent, sel: { node: Node; cursor: Cursor }) => {
    let smooshed = nough('smooshed');
    let spaced = nough('spaced', [smooshed]);
    const other = nough('other', [spaced]);
    if (parent.type === 'existing') {
        if (parent.node.kind === 'smooshed') {
            smooshed.loc = parent.node.loc;
        } else if (parent.node.kind === 'spaced') {
            spaced.loc = parent.node.loc;
        } else {
            other.loc = parent.node.loc;
        }
    }

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
        let node: Node = {
            type: 'list',
            loc,
            children: locs,
            kind:
                rough.kind === 'other'
                    ? parent.type === 'existing'
                        ? parent.node.kind
                        : parent.kind === 'sep'
                        ? 'round'
                        : parent.kind === 'space'
                        ? 'spaced'
                        : 'smooshed'
                    : rough.kind,
        };
        if (parent.type === 'existing' && parent.node.loc === loc) {
            node = { ...parent.node, children: locs };
        }
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

export const collapseAdjacentIds = (flat: Flat[], sel: Node, ncursor: Cursor): [Flat[], Node, Cursor] => {
    const res: Flat[] = [];
    for (let i = 0; i < flat.length; i++) {
        const node = flat[i];
        if (node.type !== 'id') {
            res.push(node);
            continue;
        }
        const tojoin = [node];
        let text = node.text;
        let loc = node.loc;
        let ccls = node.text === '' ? undefined : node.ccls;
        for (; i < flat.length - 1 && flat[i + 1].type === 'id'; i++) {
            const next = flat[i + 1] as Id<number>;
            if (next.text === '' || ccls == null || next.ccls === ccls) {
                text += next.text;
                tojoin.push(next);
                if (next.ccls != null && next.text !== '') ccls = next.ccls;
                if (loc === -1) loc = next.loc;
            } else {
                break;
            }
        }
        if (tojoin.length === 1) {
            res.push(tojoin[0]);
            continue;
        }
        if (sel.type === 'id' && typeof ncursor !== 'string' && ncursor.type === 'id' && tojoin.includes(sel)) {
            let pos = ncursor.end;
            for (let i = 0; i < tojoin.length; i++) {
                if (tojoin[i] === sel) {
                    break;
                }
                pos += splitGraphemes(tojoin[i].text).length;
            }
            ncursor = { type: 'id', end: pos };
            sel = { type: 'id', ccls: ccls, text, loc };
            res.push(sel);
        } else {
            res.push({ type: 'id', ccls: ccls, text, loc });
        }
    }
    return [res, sel, ncursor];
};

type FlatParent = { type: 'new'; kind: Kind; current: Node } | { type: 'existing'; node: List<number>; path: Path };

export function flatToUpdate(flat: Flat[], top: Top, nodes: Record<string, Node | null>, parent: FlatParent, sel: Node, ncursor: Cursor, path: Path) {
    [flat, sel, ncursor] = collapseAdjacentIds(flat, sel, ncursor);

    const { root, nextLoc, selection } = roughen(
        flat,
        top,
        nodes,
        parent,
        // parent.type === 'existing' ? parent.node.kind : parent.kind === 'sep' ? 'round' : parent.kind === 'space' ? 'spaced' : 'smooshed',
        { node: sel, cursor: ncursor },
    );

    let nroot = undefined;

    if (parent.type === 'existing' && root !== parent.node.loc) {
        const up = replaceAt(parent.path.children.slice(0, -1), top, parent.node.loc, root);
        nroot = up.root;
        Object.assign(nodes, up.nodes);
    }
    if (parent.type === 'new' && root !== parent.current.loc) {
        // throw new Error('need rebasee');
        const up = replaceAt(path.children.slice(0, -1), top, parent.current.loc, root);
        nroot = up.root;
        Object.assign(nodes, up.nodes);
    }

    // let scursor = selection.cursor
    // if (scursor === 'start' || scursor === 'end') {
    //     selection.children
    //     if (sel.type === 'id') {
    //         scursor = {type: 'id', end: scursor === 'start' ? 0 : splitGraphemes(sel.text).length}
    //     } else {
    //         scursor = {type: 'list', where: scursor === 'start' ? 'before' : 'after'}
    //     }
    // }

    return {
        root: nroot,
        nodes,
        nextLoc,
        selection: {
            start: selStart(
                { ...path, children: parentPath(parent.type === 'existing' ? parent.path : path).children.concat(selection.children) },
                selection.cursor,
            ),
        },
    };
}

export function addNeighborAfter(at: number, flat: Flat[], neighbor: Flat, sel: Node, ncursor: Cursor) {
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

export function addNeighborBefore(at: number, flat: Flat[], neighbor: Flat, sel: Node, ncursor: Cursor) {
    if ((at !== 0 && flat[at - 1].type === 'id') || (at === 0 && neighbor.type === 'id')) {
        flat.splice(at, 0, neighbor);
    } else {
        flat.splice(at, 0, { type: 'id', text: '', loc: -1 }, neighbor);
    }
    if (neighbor.type === 'id') {
        sel = neighbor;
        ncursor = { type: 'id', end: splitGraphemes(neighbor.text).length };
    }
    return { sel, ncursor };
}
