import { Collection, Id, Node } from '../shared/cnodes';
import { cursorSides } from './cursorSides';
import { cursorSplit, idText } from './cursorSplit';
import { Flat, addNeighborAfter, addNeighborBefore, findParent, listKindForKeyKind } from './flatenate';
import { addNeighbor, braced, splitListCell } from './handleListKey';
import { isTag, richNode, selectStart } from './handleNav';
import { Kind, textKind } from './insertId';
import { KeyAction, KeyWhat, moveA } from './keyActionToUpdate';
import { collapseAdjacentIDs, findPath, flatToUpdateNew, flatten, pruneEmptyIds, unflat } from './rough';
import { Config } from './test-utils';
import { Current, Cursor, IdCursor, Path, Top, Update, findTableLoc, lastChild, parentLoc, parentPath, pathWithChildren, selStart } from './utils';

export const handleIdKey = (config: Config, top: Top, current: Extract<Current, { type: 'id' }>, grem: string): KeyAction[] | Update | void => {
    // let node = top.nodes[lastChild(current.path)];
    // if (node.type !== 'id') throw new Error('not id');
    const kind = textKind(grem, config);
    const path = current.path;
    const cursor = current.cursor;
    const node = current.node;

    if (grem === config.tableNew && current.cursor.end === 0) {
        const parent = top.nodes[parentLoc(path)];
        if (
            parent?.type === 'list' &&
            parent.children.length === 1 &&
            (parent.kind === 'round' || parent.kind === 'curly' || parent.kind === 'square')
        ) {
            return [
                {
                    type: 'replace-self',
                    path: parentPath(path),
                    cursor: { type: 'id', end: 0 },
                    node: { type: 'table', kind: parent.kind, loc: false, rows: [[{ ...node, loc: true }]] },
                },
            ];
        }
    }

    const table = handleTableSplit(grem, config, path, top, splitIdCell(current), current.cursor.end);
    if (table) return table;

    const text = idText(top.tmpText, cursor, node);
    if (config.xml && grem === '/' && cursor.end === 1 && text.length === 1 && text[0] === '<') {
        const pnode = top.nodes[parentLoc(path)];
        if (pnode?.type !== 'list' || pnode.kind !== 'smooshed') {
            return [
                {
                    type: 'replace-self',
                    path,
                    node: {
                        type: 'list',
                        kind: { type: 'tag', node: { type: 'id', text: '', loc: true } },
                        children: [{ type: 'id', text: '', loc: false }],
                        loc: false,
                    },
                    cursor: { type: 'id', end: 0 },
                },
            ];
        }
    }

    if (config.xml && grem === '>') {
        const pnode = top.nodes[parentLoc(path)];
        const chars = idText(top.tmpText, cursor, node);
        if (
            pnode?.type === 'list' &&
            pnode.kind === 'smooshed' &&
            pnode.children.length === 2 &&
            pnode.children[1] === node.loc &&
            node.type === 'id' &&
            cursor.end === chars.length
        ) {
            const prev = top.nodes[pnode.children[0]];
            if (prev.type === 'id' && prev.text === '<') {
                return [
                    {
                        type: 'replace-self',
                        path: parentPath(path),
                        node: {
                            type: 'list',
                            // sooo it would be nice if we could say `node already has a loc, thanks`
                            kind: { type: 'tag', node: { ...node, loc: false } },
                            children: [{ type: 'id', text: '', loc: true }],
                            loc: false,
                        },
                        cursor: { type: 'id', end: 0 },
                    },
                ];
            }
        }
    }

    if (typeof kind === 'number') {
        if (node.ccls == null) {
            return [{ type: 'set-id-text', path, end: 1, text: grem, ccls: kind }];
        }

        if (node.ccls === kind) {
            const chars = idText(top.tmpText, cursor, node).slice();
            const { left, right } = cursorSides(cursor, current.start);
            chars.splice(left, right - left, grem);
            return [{ type: 'set-id-text', path, end: left + 1, text: chars.join(''), ccls: kind }];
        }
    }

    const pnode = top.nodes[parentLoc(path)];
    if (grem === '\n' && pnode?.type === 'list' && braced(pnode) && pnode.children.length === 1 && !pnode.forceMultiline) {
        if (idText(top.tmpText, cursor, node).length === 0) {
            // return { nodes: { [pnode.loc]: { ...pnode, forceMultiline: true } } };
            return [{ type: 'toggle-multiline', loc: pnode.loc }];
        }
    }

    const parent = findParent(listKindForKeyKind(kind), parentPath(path), top);

    //
    if (parent?.node.type === 'table') {
        // throw new Error('shouldnt have gotten here?')
        return; // nope, handle above
    }

    const closeUp = handleTagCloser(top, node, grem, parent, path);
    if (closeUp) return closeUp;

    // return handleTextInsert(kind, grem, current, path, parent, top);
    return [
        {
            type: 'insert-text',
            path,
            pos: current.cursor.end,
            what:
                typeof kind === 'number'
                    ? { type: 'text', ccls: kind, grem }
                    : kind === 'sep'
                    ? { type: 'sep', newLine: grem === '\n' }
                    : { type: kind },
        },
    ];
};

export const whatNeighbor = (what: KeyWhat): Flat => {
    return what.type === 'sep'
        ? { type: 'sep', loc: -1, multiLine: what.newLine }
        : what.type === 'space'
        ? { type: 'space', loc: -1 }
        : what.type === 'string'
        ? { type: 'text', spans: [{ type: 'text', text: '' }], loc: -1 }
        : { type: 'id', text: what.grem, loc: -1, ccls: what.ccls };
};

const getSplit = (top: Top, path: Path, at: number | 'before' | 'after') => {
    const node = top.nodes[lastChild(path)];
    if (node.type === 'id') {
        return splitIdCell({ type: 'id', node, path, cursor: { type: 'id', end: typeof at === 'number' ? at : 0 } });
    }
    if (node.type === 'list') {
        const pnode = top.nodes[parentLoc(path)];
        const blank: Node = richNode(pnode) ? { type: 'text', spans: [{ type: 'text', text: '' }], loc: -1 } : { type: 'id', text: '', loc: -1 };
        return splitListCell(node, { type: 'list', where: at === 'before' ? 'before' : 'after' }, blank);
    }
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
            const nloc = result.nextLoc++;
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

export const handleInsertText = (top: Top, path: Path, pos: 'before' | 'after' | number, what: KeyWhat) => {
    const node = top.nodes[lastChild(path)];
    const kind = what.type === 'text' ? what.ccls : what.type;

    const parent = findParent(listKindForKeyKind(kind), parentPath(path), top);

    const flat = parent ? flatten(parent.node, top) : [node];

    const neighbor = whatNeighbor(what);
    if (typeof pos === 'number' && node.type === 'id') {
        const nodes: Update['nodes'] = {};
        const { sel, ncursor } = addIdNeighbor({ neighbor, current: { node, cursor: { type: 'id', end: pos } }, flat, nodes, top });

        return flatToUpdateNew(
            flat,
            { node: sel, cursor: ncursor },
            { isParent: parent != null, node: parent?.node ?? node, path: parent?.path ?? path },
            nodes,
            top,
        );
    } else {
        const pnode = top.nodes[parentLoc(path)];
        const blank: Node = richNode(pnode) ? { type: 'text', spans: [{ type: 'text', text: '' }], loc: -1 } : { type: 'id', text: '', loc: -1 };

        var { sel, ncursor, nodes } = addNeighbor({
            flat,
            current: node,
            neighbor,
            cursor: {
                type: 'list',
                where: typeof pos === 'number' ? 'inside' : pos,
            },
            blank,
        });

        return flatToUpdateNew(
            flat,
            { node: sel, cursor: ncursor },
            { isParent: parent != null, node: parent?.node ?? node, path: parent?.path ?? path },
            nodes,
            top,
        );
    }
};

export const handleTagCloser = (
    top: Top,
    node: Node,
    grem: string,
    parent: void | { node: Collection<number>; path: Path },
    path: Path,
): void | KeyAction[] => {
    const grand = parentPath(parent ? parent.path : path);
    const gnode = top.nodes[lastChild(grand)];
    if (gnode?.type === 'list' && isTag(gnode.kind) && gnode.kind.node === (parent ? parent.node.loc : node.loc)) {
        if (grem === '>') {
            return moveA(
                gnode.children.length
                    ? selectStart(pathWithChildren(grand, gnode.children[0]), top)
                    : selStart(grand, { type: 'list', where: 'after' }),
            );
        } else if (grem === ' ') {
            if (gnode.kind.attributes == null) {
                return [
                    {
                        type: 'tag-set-attributes',
                        path: grand,
                        table: { type: 'table', kind: 'curly', loc: true, rows: [] },
                        cursor: { type: 'list', where: 'inside' },
                    },
                ];
            } else {
                return moveA(selectStart(pathWithChildren(grand, gnode.kind.attributes), top));
            }
        }
    }
};

export const handleTableSplit = (
    grem: string,
    config: Config,
    path: Path,
    top: Top,
    splitCell: (cell: Node, top: Top, loc: number) => SplitRes,
    at: number | 'before' | 'after',
): Update | void | KeyAction[] => {
    if (config.tableRow.includes(grem)) {
        const parent = findParent(2, parentPath(path), top);
        if (parent?.node.type === 'table') {
            return [{ type: 'table-row-split', path, tablePath: parent.path, at, multi: grem === '\n' }];
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

export const splitIdCell =
    (current: Extract<Current, { type: 'id' }>) =>
    (cell: Node, top: Top, loc: number): SplitRes => {
        const flat = flatten(cell, top, undefined, 1);
        const nodes: Update['nodes'] = {};
        const neighbor: Flat = { type: 'sep', loc };
        const { sel, ncursor } = addIdNeighbor({ neighbor, current, flat, nodes, top });
        const one = pruneEmptyIds(flat, { node: sel, cursor: ncursor });
        const two = collapseAdjacentIDs(one.items, one.selection);
        const result = unflat(top, two.items, two.selection.node);
        Object.assign(result.nodes, nodes);
        return { result, two };
    };

function addIdNeighbor({
    neighbor,
    current,
    // cursor,
    flat,
    nodes,
    top,
}: {
    neighbor: Flat;
    current: { cursor: IdCursor; node: Id<number>; start?: number };
    // current: Id<number>;
    // cursor: IdCursor;
    flat: Flat[];
    nodes: Record<string, Node | null>;
    top: Top;
}) {
    let { node, cursor } = current;
    const at = flat.indexOf(node);
    // const tmpText: Update['tmpText'] = {};
    if (at === -1) throw new Error(`flatten didnt work I guess`);
    // if (node.type === 'id' && cursor.type === 'id' && cursor.text) {
    //     node = nodes[node.loc] = { ...node, text: cursor.text.join(''), ccls: cursor.text.length === 0 ? undefined : node.ccls };
    //     flat[at] = node;
    // }
    // if (top.tmpText[node.loc]) {
    //     const text = top.tmpText[node.loc];
    //     node = nodes[node.loc] = { ...node, text: text.join(''), ccls: text.length === 0 ? undefined : node.ccls };
    //     flat[at] = node;
    //     tmpText[node.loc] = undefined;
    // }

    const split = cursorSplit(top.tmpText, node, cursor, current.start);

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
            flat.splice(at + 1, 0, neighbor, (sel = { type: 'id', text: split.right, loc: -1, ccls: split.right === '' ? undefined : node.ccls }));
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
