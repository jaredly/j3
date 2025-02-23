import { splitGraphemes } from '../../src/parse/splitGraphemes';
import { Collection, Id, Node, NodeID } from '../shared/cnodes';
import { cursorSides } from './cursorSides';
import { cursorSplit, idText } from './cursorSplit';
import { Flat, addNeighborAfter, addNeighborBefore, findParent, listKindForKeyKind } from './flatenate';
import { braced, splitListCell } from './handleListKey';
import { handleNav, isTag, richNode, selectStart } from './handleNav';
import { Kind, textKind } from './insertId';
import { KeyAction, KeyWhat, moveA } from './keyActionToUpdate';
import { collapseAdjacentIDs, flatten, pruneEmptyIds, unflat } from './rough';
import { Config } from './test-utils';
import { Current, Cursor, IdCursor, Path, Top, UNodes, lastChild, parentLoc, parentPath, pathWithChildren, selStart } from './utils';

export const handleIdKey = (config: Config, top: Top, current: Extract<Current, { type: 'id' }>, grem: string): KeyAction[] | void => {
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

    const table = handleTableSplit(grem, config, path, top, current.cursor.end);
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

        if (
            cursor.end > 0 &&
            current.start == null &&
            ((grem === '.' && node.text.match(/^[0-9]/)) || (grem.match(/^[0-9]+$/) && node.text === '.'))
        ) {
            let skipDecimal = false;
            const parent = top.nodes[parentLoc(path)];
            if (parent?.type === 'list' && parent.kind === 'smooshed') {
                if (grem !== '.') {
                    skipDecimal = true;
                }
                const at = parent.children.indexOf(current.node.loc);
                if (at > 0) {
                    const prev = parent.children[at - 1];
                    const pnode = top.nodes[prev];
                    if (pnode.type === 'id' && pnode.text === '.') {
                        skipDecimal = true;
                    }
                }
            }
            if (!skipDecimal) {
                const chars = splitGraphemes(node.text);
                chars.splice(cursor.end, 0, grem);
                return [{ type: 'set-id-text', path, end: cursor.end + 1, text: chars.join(''), ccls: grem === '.' ? node.ccls : kind }];
            }
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

    if (kind === 'space') {
        // check to see if we should just move to an adjacent space
        if (parent?.node.kind === 'spaced') {
            const right = handleNav('ArrowRight', { top, sel: { start: selStart(current.path, current.cursor) } });
            if (right) {
                const rn = top.nodes[lastChild(right.path)];
                const rp = top.nodes[parentLoc(right.path)];
                if (rp === parent.node && rn.type === 'id' && rn.text === '') {
                    return [{ type: 'move', sel: right }];
                }
            }
        }
    }

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
        ? { type: 'sep', loc: '-1', multiLine: what.newLine }
        : what.type === 'space'
        ? { type: 'space', loc: '-1' }
        : what.type === 'string'
        ? { type: 'text', spans: [{ type: 'text', text: '', loc: '' }], loc: '-1' }
        : { type: 'id', text: what.grem, loc: '-1', ccls: what.ccls };
};

export const getSplit = (top: Top, path: Path, at: number | 'before' | 'after') => {
    const node = top.nodes[lastChild(path)];
    if (node.type === 'id') {
        return splitIdCell({ type: 'id', node, path, cursor: { type: 'id', end: typeof at === 'number' ? at : 0 } });
    }
    if (node.type === 'list') {
        const pnode = top.nodes[parentLoc(path)];
        const blank: Node = richNode(pnode)
            ? { type: 'text', spans: [{ type: 'text', text: '', loc: '' }], loc: '-1' }
            : { type: 'id', text: '', loc: '-1' };
        return splitListCell(node, { type: 'list', where: at === 'before' ? 'before' : 'after' }, blank);
    }
};

export const handleTagCloser = (
    top: Top,
    node: Node,
    grem: string,
    parent: void | { node: Collection<NodeID>; path: Path },
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

export const handleTableSplit = (grem: string, config: Config, path: Path, top: Top, at: number | 'before' | 'after'): void | KeyAction[] => {
    if (config.tableRow.includes(grem)) {
        const parent = findParent(2, parentPath(path), top);
        if (parent?.node.type === 'table') {
            return [{ type: 'table-split', path, tablePath: parent.path, at, rowMulti: grem === '\n' }];
        }
    }

    if (config.tableCol.includes(grem)) {
        const parent = findParent(2, parentPath(path), top);
        if (parent?.node.type === 'table') {
            return [{ type: 'table-split', path, tablePath: parent.path, at }];
        }
    }
};

export type SplitRes = {
    result: { sloc: NodeID | null; other: NodeID[]; nodes: UNodes; forceMultiline: boolean | undefined; nextLoc: number };
    two: { items: Flat[]; selection: { node: Node; cursor: Cursor } };
};

export const splitIdCell =
    (current: Extract<Current, { type: 'id' }>) =>
    (cell: Node, top: Top, loc: NodeID): SplitRes => {
        const flat = flatten(cell, top, undefined, 1);
        const nodes: UNodes = {};
        const neighbor: Flat = { type: 'sep', loc };
        const { sel, ncursor } = addIdNeighbor({ neighbor, current, flat, nodes, top });
        const one = pruneEmptyIds(flat, { node: sel, cursor: ncursor });
        const two = collapseAdjacentIDs(one.items, one.selection);
        const result = unflat(top, two.items, two.selection.node);
        Object.assign(result.nodes, nodes);
        return { result, two };
    };

export function addIdNeighbor({
    neighbor,
    current,
    // cursor,
    flat,
    nodes,
    top,
}: {
    neighbor: Flat;
    current: { cursor: IdCursor; node: Id<NodeID>; start?: number };
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
            flat.splice(at + 1, 0, neighbor, (sel = { type: 'id', text: split.right, loc: '-1', ccls: split.right === '' ? undefined : node.ccls }));
            ncursor = { type: 'id', end: 0 };
            break;
        }
    }
    return { sel, ncursor };
}

export function flatNeighbor(kind: Kind, grem: string): Flat {
    return kind === 'sep'
        ? { type: 'sep', loc: '-1', multiLine: grem === '\n' }
        : kind === 'space'
        ? { type: 'space', loc: '-1' }
        : kind === 'string'
        ? { type: 'text', spans: [{ type: 'text', text: '', loc: '' }], loc: '-1' }
        : { type: 'id', text: grem, loc: '-1', ccls: kind };
}
