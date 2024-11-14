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
import { List, Node, RecList } from '../shared/cnodes';
import { cursorSides, cursorSplit } from './cursorSplit';
import { Kind, textKind } from './insertId';
import { splitSmooshId, splitSmooshList, splitSpacedId, splitSpacedList } from './splitSmoosh';
import { IdCursor, CollectionCursor, Path, Top, Update, lastChild, selStart, ListCursor, TextCursor, parentPath } from './utils';
export type Config = { tight: string; space: string; sep: string };

export const insertId2 = (config: Config, top: Top, path: Path, cursor: IdCursor, grem: string): Update => {
    const current = top.nodes[lastChild(path)];
    if (current.type !== 'id') throw new Error('not id');
    const kind = textKind(grem, config);

    if (kind === 'id' || kind === 'tight') {
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

    const parent = findParent(kind === 'sep' ? OTHER : kind === 'space' ? SPACED : SMOOSH, parentPath(path), top);
    if (!parent) throw new Error(`not hndling yet`);
    const flat = flatten(parent.node, top);
    const at = flat.indexOf(current);
    if (at === -1) throw new Error(`flatten didnt work I guess`);

    const nodes: Update['nodes'] = {};

    const split = cursorSplit(current.text, cursor);

    // console.log(flat);

    const neighbor: Flat =
        kind === 'sep'
            ? { type: 'sep', loc: -1 }
            : kind === 'space'
            ? { type: 'space', loc: -1 }
            : { type: 'id', text: grem, loc: -1, punct: kind === 'tight' };

    switch (split.type) {
        case 'before': {
            flat.splice(at, 0, { type: 'id', text: '', loc: -1 }, neighbor);
            break;
        }
        case 'after': {
            flat.splice(at + 1, 0, neighbor, { type: 'id', text: '', loc: -1 });
            break;
        }
        case 'between': {
            nodes[current.loc] = { ...current, text: split.left };
            flat.splice(at + 1, 0, neighbor, { type: 'id', text: split.right, loc: -1 });
            break;
        }
    }

    console.log(flat);

    const { root, nextLoc } = roughen(flat, top, nodes, parent.node.kind);
    if (root !== parent.node.loc) {
        throw new Error('need rebasee');
    }

    return { nodes, nextLoc };
};

type Flat = Node | { type: 'space'; loc: number } | { type: 'sep'; loc: number };

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

const roughen = (flat: Flat[], top: Top, nodes: Update['nodes'], base: List<number>['kind']) => {
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

    // console.log(JSON.stringify(other, 0, 2));

    const handle = (rough: Rough): number => {
        const locs = rough.children.map((child) => {
            if (child.type === 'rough') {
                return handle(child);
            }
            if (child !== top.nodes[child.loc]) {
                const loc = child.loc === -1 ? nextLoc++ : child.loc;
                nodes[loc] = { ...child, loc };
                return loc;
            }
            return child.loc;
        });
        if (locs.length === 1) return locs[0];
        const loc = rough.loc === -1 ? nextLoc++ : rough.loc;
        const node: Node = {
            type: 'list',
            loc,
            children: locs,
            kind: rough.kind === 'other' ? base : rough.kind,
        };
        nodes[loc] = node;
        return loc;
    };

    return { root: handle(other), nextLoc };
};

const flatten = (node: Node, top: Top): Flat[] => {
    if (node.type !== 'list') return [node];
    if (node.kind === 'smooshed') {
        return node.children.map((id) => top.nodes[id]);
    }
    if (node.kind === 'spaced') {
        return interleave(
            node.children.flatMap((id) => flatten(top.nodes[id], top)),
            { type: 'space', loc: node.loc },
        );
    }
    return interleave(
        node.children.flatMap((id) => flatten(top.nodes[id], top)),
        { type: 'sep', loc: node.loc },
    );
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

const findParent = (kind: 0 | 1 | 2, path: Path, top: Top): void | { node: List<number>; path: Path } => {
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
