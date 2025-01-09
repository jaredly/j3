import { splitGraphemes } from '../../src/parse/splitGraphemes';
import { Id, Loc, Node, Nodes } from '../shared/cnodes';
import { cursorSides } from './cursorSides';
import { cursorSplit, Split } from './cursorSplit';
import { Flat, addNeighborAfter, addNeighborBefore, findParent, listKindForKeyKind } from './flatenate';
import { braced } from './handleListKey';
import { Kind, textKind } from './insertId';
import { Config } from './test-utils';
import { collapseAdjacentIDs, findPath, flatToUpdateNew, flatten, flattenRow, pruneEmptyIds, rough, unflat } from './rough';
import { Current, Cursor, IdCursor, Path, Top, Update, findTableLoc, lastChild, parentLoc, parentPath, pathWithChildren, selStart } from './utils';
import { isTag, justSel, selectStart, selUpdate } from './handleNav';

// const isNumber = (grems: undefined | string[], text: string) => {
//     if (grems) {
//         return grems.every((g) => g.match(/[0-9]/));
//     }
//     return text.match(/^[0-9.]*$/);
// };
// const isDot = (grems: undefined | string[], text: string) => {
//     return grems ? grems.length === 1 && grems[0] === '.' : text === '.';
// };

export const handleIdKey = (config: Config, top: Top, current: Extract<Current, { type: 'id' }>, grem: string): Update | void => {
    // let node = top.nodes[lastChild(current.path)];
    // if (node.type !== 'id') throw new Error('not id');
    const kind = textKind(grem, config);
    const path = current.path;
    const cursor = current.cursor;
    const node = current.node;

    if (grem === config.tableNew && current.cursor.end === 0) {
        const parent = top.nodes[parentLoc(path)];
        if (parent?.type === 'list' && (parent.kind === 'round' || parent.kind === 'curly' || parent.kind === 'square')) {
            return { nodes: { [parent.loc]: { type: 'table', kind: parent.kind, loc: parent.loc, rows: [[current.node.loc]] } } };
        }
    }

    const table = handleTableSplit(grem, config, path, top, splitCell(current));
    if (table) return table;

    if (config.xml && grem === '/' && cursor.end === 1 && (cursor.text ? cursor.text.length === 1 && cursor.text[0] === '<' : node.text === '<')) {
        const pnode = top.nodes[parentLoc(path)];
        if (pnode?.type !== 'list' || pnode.kind !== 'smooshed') {
            return {
                nodes: {
                    [node.loc]: {
                        type: 'list',
                        kind: { type: 'tag', node: top.nextLoc },
                        loc: node.loc,
                        children: [top.nextLoc + 1],
                    },
                    [top.nextLoc + 1]: { type: 'id', text: '', loc: top.nextLoc + 1 },
                    [top.nextLoc]: { type: 'id', text: '', loc: top.nextLoc },
                },
                selection: { start: selStart(pathWithChildren(path, top.nextLoc), { type: 'id', end: 0 }) },
                nextLoc: top.nextLoc + 2,
            };
        }
    }

    if (config.xml && grem === '>') {
        const pnode = top.nodes[parentLoc(path)];
        const chars = cursor.text ?? splitGraphemes(node.text);
        if (
            pnode.type === 'list' &&
            pnode.kind === 'smooshed' &&
            pnode.children.length === 2 &&
            pnode.children[1] === node.loc &&
            cursor.end === chars.length
        ) {
            const prev = top.nodes[pnode.children[0]];
            if (prev.type === 'id' && prev.text === '<') {
                return {
                    nodes: {
                        [pnode.loc]: { type: 'list', kind: { type: 'tag', node: node.loc }, children: [prev.loc], loc: pnode.loc },
                        [prev.loc]: { loc: prev.loc, type: 'id', text: '' },
                    },
                    selection: { start: selStart(pathWithChildren(parentPath(path), prev.loc), { type: 'id', end: 0 }) },
                };
            }
        }
    }

    if (typeof kind === 'number') {
        if (node.ccls == null) {
            return {
                nodes: { [node.loc]: { ...node, ccls: kind, text: grem } },
                selection: { start: selStart(path, { type: 'id', end: 1 }) },
            };
        }

        if (node.ccls === kind) {
            // Just update the selection
            const chars = cursor.text?.slice() ?? splitGraphemes(node.text);
            const { left, right } = cursorSides(cursor, current.start);
            chars.splice(left, right - left, grem);
            return { nodes: {}, selection: { start: selStart(path, { ...cursor, text: chars, end: left + 1 }) } };
        }
    }

    const pnode = top.nodes[parentLoc(path)];
    if (grem === '\n' && pnode?.type === 'list' && braced(pnode) && pnode.children.length === 1 && !pnode.forceMultiline) {
        const chars = cursor.text?.slice() ?? splitGraphemes(node.text);
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

    const grand = parentPath(parent ? parent.path : path);
    const gnode = top.nodes[lastChild(grand)];
    if (gnode?.type === 'list' && isTag(gnode.kind) && gnode.kind.node === (parent ? parent.node.loc : node.loc)) {
        if (grem === '>') {
            return selUpdate(
                gnode.children.length
                    ? selectStart(pathWithChildren(grand, gnode.children[0]), top)
                    : selStart(grand, { type: 'list', where: 'after' }),
            );
        } else if (grem === ' ') {
            if (gnode.kind.attributes == null) {
                return {
                    nodes: {
                        [gnode.loc]: { ...gnode, kind: { ...gnode.kind, attributes: top.nextLoc } },
                        [top.nextLoc]: { type: 'table', kind: 'curly', loc: top.nextLoc, rows: [] },
                    },
                    nextLoc: top.nextLoc + 1,
                    selection: { start: selStart(pathWithChildren(grand, top.nextLoc), { type: 'list', where: 'inside' }) },
                };
            } else {
                return selUpdate(selectStart(pathWithChildren(grand, gnode.kind.attributes), top));
            }
        }
    }

    const flat = parent ? flatten(parent.node, top) : [node];

    const nodes: Update['nodes'] = {};

    const neighbor = flatNeighbor(kind, grem);
    const { sel, ncursor } = addNeighbor({ neighbor, current, flat, nodes });

    // console.log(flat);

    return flatToUpdateNew(
        flat,
        { node: sel, cursor: ncursor },
        { isParent: parent != null, node: parent?.node ?? node, path: parent?.path ?? path },
        nodes,
        top,
    );
};

export const handleTableSplit = (grem: string, config: Config, path: Path, top: Top, splitCell: (cell: Node, top: Top, loc: number) => SplitRes) => {
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

            const { result, two } = splitCell(cell, top, loc);
            if (result.sloc == null) throw new Error(`sel node not encountered`);
            if (result.other.length !== 2) throw new Error(`spit should result in 2 tops`);

            const rows = parent.node.rows.slice();
            const newRow = [result.other[1], ...rows[row].slice(col + 1)];
            rows[row] = [...rows[row].slice(0, col), result.other[0]];
            rows.splice(row + 1, 0, newRow);

            if (newRow.length === 1) {
                for (let i = 1; i < rows[row].length; i++) {
                    const nloc = result.nextLoc++;
                    newRow.push(nloc);
                    result.nodes[nloc] = { type: 'id', text: '', loc: nloc };
                }
            }

            result.nodes[loc] = { ...parent.node, rows, forceMultiline: grem === '\n' ? true : parent.node.forceMultiline };

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

            const { result, two } = splitCell(cell, top, loc);
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
};

export type SplitRes = {
    result: { sloc: number | null; other: number[]; nodes: Update['nodes']; forceMultiline: boolean | undefined; nextLoc: number };
    two: { items: Flat[]; selection: { node: Node; cursor: Cursor } };
};
const splitCell =
    (current: Extract<Current, { type: 'id' }>) =>
    (cell: Node, top: Top, loc: number): SplitRes => {
        const flat = flatten(cell, top, undefined, 1);
        const nodes: Update['nodes'] = {};
        const neighbor: Flat = { type: 'sep', loc };
        const { sel, ncursor } = addNeighbor({ neighbor, current, flat, nodes });
        const one = pruneEmptyIds(flat, { node: sel, cursor: ncursor });
        const two = collapseAdjacentIDs(one.items, one.selection);
        const result = unflat(top, two.items, two.selection.node);
        Object.assign(result.nodes, nodes);
        return { result, two };
    };

function addNeighbor({
    neighbor,
    current,
    // cursor,
    flat,
    nodes,
}: {
    neighbor: Flat;
    current: Extract<Current, { type: 'id' }>;
    // current: Id<number>;
    // cursor: IdCursor;
    flat: Flat[];
    nodes: Record<string, Node | null>;
}) {
    let { node, cursor } = current;
    const at = flat.indexOf(node);
    if (at === -1) throw new Error(`flatten didnt work I guess`);
    if (node.type === 'id' && cursor.type === 'id' && cursor.text) {
        node = nodes[node.loc] = { ...node, text: cursor.text.join(''), ccls: cursor.text.length === 0 ? undefined : node.ccls };
        flat[at] = node;
    }

    const split = cursorSplit(node.text, cursor, current.start);

    let sel: Node = node;
    let ncursor: Cursor = { ...cursor };

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
            flat[at] = nodes[node.loc] = { ...node, text: split.left };
            flat.splice(at + 1, 0, neighbor, (sel = { type: 'id', text: split.right, loc: -1, ccls: node.ccls }));
            ncursor = { type: 'id', end: 0 };
            break;
        }
    }
    return { sel, ncursor };
}

export function flatNeighbor(kind: Kind, grem: string): Flat {
    return kind === 'sep'
        ? { type: 'sep', loc: -1, multiLine: grem === '\n' }
        : kind === 'space'
        ? { type: 'space', loc: -1 }
        : kind === 'string'
        ? { type: 'text', spans: [{ type: 'text', text: '' }], loc: -1 }
        : { type: 'id', text: grem, loc: -1, ccls: kind };
}
