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
import { Cursor, Path, Top, lastChild, parentPath } from './utils';

export const listKindForKeyKind = (kind: Kind): 0 | 1 | 2 => (kind === 'sep' ? OTHER : kind === 'space' ? SPACED : SMOOSH);

// TODO add like rsmoosh and lsmoosh, to track the locs of the smooshes
export type Flat = Node | { type: 'space'; loc: number } | { type: 'smoosh'; loc: number } | { type: 'sep'; loc: number };

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

type FlatParent = { type: 'new'; kind: Kind; current: Node } | { type: 'existing'; node: List<number>; path: Path };

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
    } else if (neighbor.type !== 'sep' && neighbor.type !== 'space' && neighbor.type !== 'smoosh') {
        flat.splice(at + 1, 0, (sel = neighbor));
        ncursor = { type: 'list', where: 'inside' };
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
    if (neighbor.type === 'text') {
        sel = neighbor;
        ncursor = { type: 'list', where: 'inside' };
    }
    return { sel, ncursor };
}
