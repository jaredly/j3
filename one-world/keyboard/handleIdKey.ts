import { splitGraphemes } from '../../src/parse/splitGraphemes';
import { Id, Loc, Node } from '../shared/cnodes';
import { cursorSides } from './cursorSides';
import { cursorSplit, Split } from './cursorSplit';
import { Flat, addNeighborAfter, addNeighborBefore, findParent, listKindForKeyKind } from './flatenate';
import { braced } from './handleListKey';
import { Kind, textKind } from './insertId';
import { Config } from './test-utils';
import { collapseAdjacentIDs, findPath, flatToUpdateNew, flatten, flattenRow, pruneEmptyIds, rough, unflat } from './rough';
import { Cursor, IdCursor, Path, Top, Update, findTableLoc, lastChild, parentLoc, parentPath, pathWithChildren, selStart } from './utils';

export const handleIdKey = (config: Config, top: Top, path: Path, cursor: IdCursor, grem: string): Update | void => {
    let current = top.nodes[lastChild(path)];
    if (current.type !== 'id') throw new Error('not id');
    const kind = textKind(grem, config);

    if (grem === config.tableNew && cursor.end === 0) {
        const parent = top.nodes[parentLoc(path)];
        if (parent?.type === 'list' && (parent.kind === 'round' || parent.kind === 'curly' || parent.kind === 'square')) {
            return { nodes: { [parent.loc]: { type: 'table', kind: parent.kind, loc: parent.loc, rows: [[current.loc]] } } };
        }
    }

    if (config.tableRow.includes(grem)) {
        const parent = findParent(2, parentPath(path), top);
        if (parent?.node.type === 'table') {
            const celloc = path.children[parent.path.children.length];
            const { row, col } = findTableLoc(parent.node.rows, celloc);
            if (parent.node.rows[row][col] !== celloc) {
                throw new Error(`coudlnt find cell in table`);
            }

            const item = parent.node.rows[row][col];
            const loc = parent.node.loc;

            // This is the thing to split
            const cell = top.nodes[item];

            const { result, two } = splitCell(cell, top, loc, current, cursor);
            if (result.sloc == null) throw new Error(`sel node not encountered`);
            if (result.other.length !== 2) throw new Error(`spit should result in 2 tops`);

            const rows = parent.node.rows.slice();
            const newRow = [result.other[1], ...rows[row].slice(col + 1)];
            rows[row] = [...rows[row].slice(0, col), result.other[0]];
            rows.splice(row + 1, 0, newRow);

            result.nodes[loc] = { ...parent.node, rows };

            const selPath = findPath(loc, result.nodes, result.sloc);
            if (!selPath) throw new Error(`can't find sel in selpath.`);

            return {
                nodes: result.nodes,
                nextLoc: result.nextLoc,
                selection: {
                    start: selStart(pathWithChildren(parentPath(parent.path), ...selPath), two.selection.cursor),
                },
            };
        }
    }

    if (config.tableCol.includes(grem)) {
        const parent = findParent(2, parentPath(path), top);
        if (parent?.node.type === 'table') {
            const celloc = path.children[parent.path.children.length];
            const { row, col } = findTableLoc(parent.node.rows, celloc);
            if (parent.node.rows[row][col] !== celloc) {
                throw new Error(`coudlnt find cell in table`);
            }

            const item = parent.node.rows[row][col];
            const loc = parent.node.loc;

            // This is the thing to split
            const cell = top.nodes[item];

            const { result, two } = splitCell(cell, top, loc, current, cursor);
            if (result.sloc == null) throw new Error(`sel node not encountered`);

            const rows = parent.node.rows.slice();
            rows[row] = rows[row].slice();
            rows[row].splice(col, 1, ...result.other);

            result.nodes[loc] = { ...parent.node, rows };

            const selPath = findPath(loc, result.nodes, result.sloc);
            if (!selPath) throw new Error(`can't find sel in selpath.`);

            return {
                nodes: result.nodes,
                nextLoc: result.nextLoc,
                selection: {
                    start: selStart(pathWithChildren(parentPath(parent.path), ...selPath), two.selection.cursor),
                },
            };
        }
    }

    if (typeof kind === 'number') {
        if (current.ccls == null) {
            return {
                nodes: { [current.loc]: { ...current, ccls: kind, text: grem } },
                selection: { start: selStart(path, { type: 'id', end: 1 }) },
            };
        }

        if (current.ccls === kind) {
            // Just update the selection
            const chars = cursor.text?.slice() ?? splitGraphemes(current.text);
            const { left, right } = cursorSides(cursor);
            chars.splice(left, right - left, grem);
            return { nodes: {}, selection: { start: selStart(path, { ...cursor, start: undefined, text: chars, end: left + 1 }) } };
        }
    }

    const pnode = top.nodes[parentLoc(path)];
    if (grem === '\n' && pnode?.type === 'list' && braced(pnode) && pnode.children.length === 1 && !pnode.forceMultiline) {
        const chars = cursor.text?.slice() ?? splitGraphemes(current.text);
        if (chars.length === 0) {
            return { nodes: { [pnode.loc]: { ...pnode, forceMultiline: true } } };
        }
    }

    const parent = findParent(listKindForKeyKind(kind), parentPath(path), top);

    //
    if (parent?.node.type === 'table') {
        // throw new Error('shouldnt have gotten here?')
        return; // nope, handle above
    }

    const flat = parent ? flatten(parent.node, top) : [current];

    const nodes: Update['nodes'] = {};

    const neighbor = flatNeighbor(kind, grem);
    const { sel, ncursor } = addNeighbor({ neighbor, current, cursor, flat, nodes });

    return flatToUpdateNew(
        flat,
        { node: sel, cursor: ncursor },
        { isParent: parent != null, node: parent?.node ?? current, path: parent?.path ?? path },
        nodes,
        top,
    );
};

function splitCell(cell: Node, top: Top, loc: number, current: Id<number>, cursor: IdCursor) {
    const flat = flatten(cell, top, undefined, 1);
    const nodes: Update['nodes'] = {};
    const neighbor: Flat = { type: 'sep', loc };
    const { sel, ncursor } = addNeighbor({ neighbor, current, cursor, flat, nodes });
    const one = pruneEmptyIds(flat, { node: sel, cursor: ncursor });
    const two = collapseAdjacentIDs(one.items, one.selection);
    const result = unflat(top, two.items, two.selection.node);
    Object.assign(result.nodes, nodes);
    return { result, two };
}

function addNeighbor({
    neighbor,
    current,
    cursor,
    flat,
    nodes,
}: {
    neighbor: Flat;
    current: Id<number>;
    cursor: IdCursor;
    flat: Flat[];
    nodes: Record<string, Node | null>;
}) {
    const at = flat.indexOf(current);
    if (at === -1) throw new Error(`flatten didnt work I guess`);
    if (current.type === 'id' && cursor.type === 'id' && cursor.text) {
        current = nodes[current.loc] = { ...current, text: cursor.text.join(''), ccls: cursor.text.length === 0 ? undefined : current.ccls };
        flat[at] = current;
    }

    const split = cursorSplit(current.text, cursor);

    let sel: Node = current;
    let ncursor: Cursor = { ...cursor, start: undefined };

    switch (split.type) {
        case 'before': {
            ({ sel, ncursor } = addNeighborBefore(at, flat, neighbor, sel, ncursor));
            break;
        }
        case 'after': {
            ({ sel, ncursor } = addNeighborAfter(at, flat, neighbor, sel, ncursor));
            break;
        }
        case 'between': {
            nodes[current.loc] = { ...current, text: split.left };
            flat.splice(at + 1, 0, neighbor, (sel = { type: 'id', text: split.right, loc: -1, ccls: current.ccls }));
            ncursor = { type: 'id', end: 0 };
            break;
        }
    }
    return { sel, ncursor };
}

function flatNeighbor(kind: Kind, grem: string): Flat {
    return kind === 'sep'
        ? { type: 'sep', loc: -1, multiLine: grem === '\n' }
        : kind === 'space'
        ? { type: 'space', loc: -1 }
        : kind === 'string'
        ? { type: 'text', spans: [], loc: -1 }
        : { type: 'id', text: grem, loc: -1, ccls: kind };
}
