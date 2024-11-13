import { Nodes } from '../shared/cnodes';
import { cursorSplit } from './cursorSplit';
import { joinAdjacent, joinAdjacentList } from './joinAdjacent';
import { lastChild, pathWithChildren } from './utils';
import { Top, Path, IdCursor, Update, PartialSel, ListCursor, selStart } from './utils';
import { parentList, replaceWithList } from './replaceWithSmooshed';

/* Places that a cursor can be:

- ID
    - start
    - middle
    - end
- Text
    - index 0 start
    - index 1..n start
    - index n end
    - index 0..n-1 end
    - middle
- List (ignoring start/end and control, which are special)
    - before
    - inside
    - after

Kinds of transformations that we can be doing:
*/
/*

ID cursor
- edit the text of an ID (very simple)
    - unless you delete the text entirely, and it's a punct in between two texts (or vice versa)
- split(smooshed,spaced,outer) the current ID (encompasses adding to the front/back) and maybe drop somethin in between

- split an ID with a Punct or vice versa, at the smooshed level
- split a smooshed with a space
- split an other with a sep

*/
/*
Assumptions
- position possibilities:
    - left (produces [new id], current)
    - right (produces current, [new id])
    - middle (produces current, [new insert], [new rest])

- if no smoosh parent, we replace self w/ new list of things
- if yes smoosh parent:
    - if (left) and the (left sib) is the right kind, just update that
    - if (right) and the (right sib) is the right kind, just update that
    - otherwise, replace self with new things

- the insert is of a different 'kind' than the current ID
*/

export const splitSmooshList = (top: Top, path: Path, cursor: Extract<ListCursor, { type: 'list' }>, grem: string, punct: boolean): Update | void => {
    const list = top.nodes[lastChild(path)];
    if (list.type !== 'list') throw new Error(`not a list ${list.type} at loc ${list.loc}`);
    const nodes: Nodes = {};

    const parent = parentList(top, path.children, 'smooshed');

    if (parent && (cursor.where === 'after' || cursor.where === 'before')) {
        const up = joinAdjacentList(parent, list, path, cursor.where, top, grem);
        if (up) return up;
    }

    let nextLoc = top.nextLoc;
    const inserts: number[] = [];
    let sel: PartialSel;

    switch (cursor.where) {
        case 'before': {
            const left = nextLoc++;
            inserts.push(left, list.loc);
            nodes[left] = { type: 'id', text: grem, loc: left, punct };
            sel = {
                children: [left],
                cursor: { type: 'id', end: 1 },
            };
            break;
        }
        case 'after': {
            const right = nextLoc++;
            inserts.push(list.loc, right);
            nodes[right] = { type: 'id', text: grem, loc: right, punct };
            sel = {
                children: [right],
                cursor: { type: 'id', end: 1 },
            };
            break;
        }
        case 'inside':
            const loc = nextLoc++;
            return {
                nodes: {
                    [loc]: { type: 'id', text: grem, loc, punct },
                    [list.loc]: { ...list, children: [loc] },
                },
                selection: { start: selStart(pathWithChildren(path, loc), { type: 'id', end: 1 }) },
            };
        default:
            return;
    }

    const up = replaceWithList(path, { ...top, nextLoc }, list.loc, inserts, 'smooshed', sel);
    Object.assign(up.nodes, nodes);

    return up;
};

export const splitSmooshId = (top: Top, path: Path, cursor: IdCursor, grem: string, punct: boolean): Update => {
    const id = top.nodes[lastChild(path)];
    if (id.type !== 'id') throw new Error(`not an ID ${id.type} at loc ${id.loc}`);
    const nodes: Nodes = {};

    const split = cursorSplit(id.text, cursor);
    const parent = parentList(top, path.children, 'smooshed');

    if (parent) {
        const up = joinAdjacent(parent, id, path, split, top, grem);
        if (up) return up;
    }

    let nextLoc = top.nextLoc;
    const inserts: number[] = [];
    let sel: PartialSel;

    switch (split.type) {
        case 'before': {
            const left = nextLoc++;
            inserts.push(left, id.loc);
            nodes[left] = { type: 'id', text: grem, loc: left, punct };
            nodes[id.loc] = { ...id, text: split.text };
            sel = {
                children: [left],
                cursor: { type: 'id', end: 1 },
            };
            break;
        }
        case 'after': {
            const right = nextLoc++;
            inserts.push(id.loc, right);
            nodes[right] = { type: 'id', text: grem, loc: right, punct };
            nodes[id.loc] = { ...id, text: split.text };
            sel = {
                children: [right],
                cursor: { type: 'id', end: 1 },
            };
            break;
        }
        case 'between': {
            const mid = nextLoc++;
            const right = nextLoc++;
            inserts.push(id.loc, mid, right);
            nodes[id.loc] = { ...id, text: split.left };
            nodes[mid] = { type: 'id', text: grem, loc: mid, punct };
            nodes[right] = { type: 'id', text: split.right, loc: right, punct: id.punct };
            sel = {
                children: [mid],
                cursor: { type: 'id', end: 1 },
            };
            break;
        }
    }

    const up = replaceWithList(path, { ...top, nextLoc }, id.loc, inserts, 'smooshed', sel);
    Object.assign(up.nodes, nodes);

    return up;
};
