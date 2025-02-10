import { Table, Node } from '../../shared/cnodes';
import { getSplit } from '../handleIdKey';
import { flatten, pruneEmptyIds, collapseAdjacentIDs, unflat, findPath, fixSelection } from '../rough';
import { Top, Path, Cursor, Update, lastChild, selStart, pathWithChildren, parentPath, findTableLoc } from '../utils';
import { rebalanceSmooshed, joinSmooshed, disolveSmooshed } from './list';

const prevTableLoc = (table: Table<unknown>, at: { row: number; col: number }) => {
    if (at.row === 0 && at.col === 0) return;
    if (at.col === 0) return { row: at.row - 1, col: table.rows[at.row - 1].length - 1 };
    return { row: at.row, col: at.col - 1 };
};

export const joinTable = (top: Top, path: Path, node: Node, cursor: Cursor, at: { row: number; col: number }): void | Update => {
    const pnode = top.nodes[lastChild(path)];
    if (pnode.type !== 'table') return;
    const pat = prevTableLoc(pnode, at);
    if (!pat) return;

    const lloc = at.col === 0 ? pnode.rows[at.row - 1][pnode.rows[at.row - 1].length - 1] : pnode.rows[at.row][at.col - 1];
    const rloc = pnode.rows[at.row][at.col];
    const left = flatten(top.nodes[lloc], top, {}, 1);
    const right = flatten(top.nodes[rloc], top, {}, 1);

    const flat = [...left, ...right];

    const one = pruneEmptyIds(flat, { node, cursor });
    const two = collapseAdjacentIDs(one.items, one.selection);
    const result = unflat(top, two.items, two.selection.node);
    const ncursor = two.selection.cursor;
    if (result.sloc == null) {
        throw new Error(`sel node not encountered`);
    }

    if (result.other.length !== 1) throw new Error(`join should result in 1 top`);

    const rows = pnode.rows.slice();
    rows[at.row] = rows[at.row].slice();
    rows[at.row].splice(at.col - 1, 1); // , ...result.other);
    if (pat.row !== at.row) {
        rows[pat.row] = rows[pat.row].concat(rows[at.row]);
        rows.splice(at.row, 1);
    }
    rows[pat.row][pat.col] = result.other[0];

    result.nodes[pnode.loc] = { ...pnode, rows };

    const selPath = findPath(pnode.loc, result.nodes, result.sloc);
    if (!selPath) throw new Error(`can't find sel in selpath.`);

    const up: Update = {
        nodes: result.nodes,
        nextLoc: result.nextLoc,
        selection: {
            start: fixSelection(selStart(pathWithChildren(parentPath(path), ...selPath), ncursor), result.nodes, top),
        },
    };

    rebalanceSmooshed(up, top);
    joinSmooshed(up, top);
    disolveSmooshed(up, top);

    return up;
};
export const splitTableRow = (top: Top, path: Path, tablePath: Path, at: number | 'before' | 'after', multi: boolean) => {
    const table = top.nodes[lastChild(tablePath)];
    if (table.type !== 'table') return;

    const splitCell = getSplit(top, path, at);
    if (!splitCell) return;

    const celloc = path.children[tablePath.children.length];
    const { row, col } = findTableLoc(table.rows, celloc);
    if (table.rows[row][col] !== celloc) {
        return;
    }

    const item = table.rows[row][col];
    const loc = table.loc;

    // This is the thing to split
    const cell = top.nodes[item];

    const { result, two } = splitCell(cell, top, loc);
    if (result.sloc == null) throw new Error(`sel node not encountered`);
    if (result.other.length !== 2) throw new Error(`spit should result in 2 tops`);

    const rows = table.rows.slice();
    const newRow = [result.other[1], ...rows[row].slice(col + 1)];
    rows[row] = [...rows[row].slice(0, col), result.other[0]];
    rows.splice(row + 1, 0, newRow);

    if (newRow.length === 1) {
        for (let i = 1; i < rows[row].length; i++) {
            const nloc = result.nextLoc++ + '';
            newRow.push(nloc);
            result.nodes[nloc] = { type: 'id', text: '', loc: nloc };
        }
    }

    result.nodes[loc] = { ...table, rows, forceMultiline: multi ? true : table.forceMultiline };

    const selPath = findPath(loc, result.nodes, result.sloc);
    if (!selPath) throw new Error(`can't find sel in selpath.`);

    return {
        nodes: result.nodes,
        nextLoc: result.nextLoc,
        selection: {
            start: selStart(pathWithChildren(parentPath(tablePath), ...selPath), two.selection.cursor),
        },
    };
};

export const splitTableCol = (top: Top, path: Path, tablePath: Path, at: number | 'before' | 'after') => {
    const table = top.nodes[lastChild(tablePath)];
    if (table.type !== 'table') return;

    const splitCell = getSplit(top, path, at);
    if (!splitCell) return;

    const celloc = path.children[tablePath.children.length];
    const { row, col } = findTableLoc(table.rows, celloc);
    if (table.rows[row][col] !== celloc) {
        throw new Error(`coudlnt find cell in table`);
    }

    const item = table.rows[row][col];
    const loc = table.loc;

    // This is the thing to split
    const cell = top.nodes[item];

    const { result, two } = splitCell(cell, top, loc);
    if (result.sloc == null) throw new Error(`sel node not encountered`);

    const rows = table.rows.slice();
    rows[row] = rows[row].slice();
    rows[row].splice(col, 1, ...result.other);

    result.nodes[loc] = { ...table, rows };

    const selPath = findPath(loc, result.nodes, result.sloc);
    if (!selPath) throw new Error(`can't find sel in selpath.`);

    return {
        nodes: result.nodes,
        nextLoc: result.nextLoc,
        selection: {
            start: selStart(pathWithChildren(parentPath(tablePath), ...selPath), two.selection.cursor),
        },
    };
};
