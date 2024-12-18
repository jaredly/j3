import { isRich, List, Node, Nodes } from '../shared/cnodes';
import { findParent, listKindForKeyKind, Flat, addNeighborBefore, addNeighborAfter } from './flatenate';
import { isTag, justSel, richNode } from './handleNav';
import { Kind, textKind } from './insertId';
import { Config } from './test-utils';
import { collapseAdjacentIDs, flatten, flatToUpdateNew, pruneEmptyIds, unflat } from './rough';
import {
    Top,
    Path,
    CollectionCursor,
    Update,
    lastChild,
    selStart,
    pathWithChildren,
    parentPath,
    Cursor,
    findTableLoc,
    ListCursor,
    parentLoc,
} from './utils';
import { flatNeighbor, handleTableSplit } from './handleIdKey';

export const braced = (node: Node) => node.type !== 'list' || (node.kind !== 'smooshed' && node.kind !== 'spaced');

export const handleListKey = (config: Config, top: Top, path: Path, cursor: CollectionCursor, grem: string): Update | void => {
    const current = top.nodes[lastChild(path)];
    const kind = textKind(grem, config);
    if (cursor.type === 'control' && current.type === 'list') {
        if (grem === ' ' || grem === '\n') {
            if (typeof current.kind !== 'string') {
                if (current.kind.type === 'checks') {
                    const loc = current.children[cursor.index];
                    return {
                        nodes: {
                            [current.loc]: {
                                ...current,
                                kind: { type: 'checks', checked: { ...current.kind.checked, [loc]: !current.kind.checked[loc] } },
                            },
                        },
                    };
                }
                if (current.kind.type === 'opts') {
                    const loc = current.children[cursor.index];
                    return { nodes: { [current.loc]: { ...current, kind: { type: 'opts', which: loc === current.kind.which ? undefined : loc } } } };
                }
            }
        }
        return;
    }
    if (cursor.type !== 'list') throw new Error('controls not handled yet');

    if (
        grem === config.tableNew &&
        current.type === 'list' &&
        current.children.length === 0 &&
        cursor.where === 'inside' &&
        (current.kind === 'round' || current.kind === 'square' || current.kind === 'curly')
    ) {
        return { nodes: { [current.loc]: { type: 'table', kind: current.kind, rows: [], loc: current.loc } } };
    }

    if (grem === '\n' && braced(current) && current.type === 'list' && !current.forceMultiline && cursor.where === 'inside') {
        let nextLoc = top.nextLoc;
        const loc = nextLoc++;
        return {
            nodes: { [current.loc]: { ...current, forceMultiline: true, children: [loc] }, [loc]: { type: 'id', text: '', loc } },
            nextLoc,
            selection: { start: selStart(pathWithChildren(path, loc), { type: 'id', end: 0 }) },
        };
    }

    if (cursor.where === 'inside') {
        if (current.type === 'text') {
            if (kind === 'string') {
                return justSel(path, { type: 'list', where: 'after' });
            }
            return {
                nodes: {
                    [current.loc]: {
                        ...current,
                        spans: [{ type: 'text', text: grem }],
                    },
                },
                selection: {
                    start: selStart(path, {
                        type: 'text',
                        end: {
                            index: 0,
                            cursor: 1,
                        },
                    }),
                },
            };
        }
        if (current.type !== 'list' && current.type !== 'table') throw new Error('not list');
        switch (kind) {
            case 'string': {
                let nextLoc = top.nextLoc;
                const loc = nextLoc++;
                return {
                    nodes: {
                        [loc]: { type: 'text', spans: [{ type: 'text', text: '' }], loc },
                        [current.loc]: current.type === 'table' ? { ...current, rows: [[loc]] } : { ...current, children: [loc] },
                    },
                    nextLoc,
                    selection: { start: selStart(pathWithChildren(path, loc), { type: 'text', end: { index: 0, cursor: 0 } }) },
                };
            }
            case 'space':
            case 'sep': {
                if (current.type === 'list' && isTag(current.kind)) {
                    let nextLoc = top.nextLoc;
                    const loc = nextLoc++;
                    return {
                        nodes: {
                            [loc]: { type: 'id', loc, text: '' },
                            [current.loc]: { ...current, children: [loc] },
                        },
                        nextLoc,
                        selection: { start: selStart(pathWithChildren(path, loc), { type: 'id', end: 0 }) },
                    };
                }
                let nextLoc = top.nextLoc;
                const left = nextLoc++;
                const right = nextLoc++;
                const nodes: Nodes = {};
                let children = [left, right];
                let selPath = pathWithChildren(path, right);
                if (kind === 'space') {
                    const wrap = nextLoc++;
                    nodes[wrap] = { type: 'list', kind: 'spaced', children, loc: wrap };
                    children = [wrap];
                    selPath = pathWithChildren(path, wrap, right);
                }
                return {
                    nodes: {
                        ...nodes,
                        [left]: { type: 'id', loc: left, text: '' },
                        [right]: { type: 'id', loc: right, text: '' },
                        [current.loc]: current.type === 'table' ? { ...current, rows: [children] } : { ...current, children },
                    },
                    nextLoc,
                    selection: { start: selStart(selPath, { type: 'id', end: 0 }) },
                };
            }
            default: {
                let nextLoc = top.nextLoc;
                const loc = nextLoc++;
                return {
                    nodes: {
                        [loc]: { type: 'id', loc, text: grem, ccls: kind },
                        [current.loc]: current.type === 'table' ? { ...current, rows: [[loc]] } : { ...current, children: [loc] },
                    },
                    nextLoc,
                    selection: { start: selStart(pathWithChildren(path, loc), { type: 'id', end: 1 }) },
                };
            }
        }
    }

    const pnode = top.nodes[parentLoc(path)];
    const blank: Node = richNode(pnode) ? { type: 'text', spans: [{ type: 'text', text: '' }], loc: -1 } : { type: 'id', text: '', loc: -1 };

    const table = handleTableSplit(grem, config, path, top, splitCell(current, cursor, blank));
    if (table) return table;

    const parent = findParent(listKindForKeyKind(kind), parentPath(path), top);

    const flat = parent ? flatten(parent.node, top) : [current];
    var { sel, ncursor, nodes } = addNeighbor({ flat, current, neighbor: flatNeighbor(kind, grem), cursor, blank });

    return flatToUpdateNew(
        flat,
        { node: sel, cursor: ncursor },
        { isParent: parent != null, node: parent?.node ?? current, path: parent?.path ?? path },
        nodes,
        top,
    );
};

export const splitCell = (current: Node, cursor: ListCursor, blank: Node) => (cell: Node, top: Top, loc: number) => {
    const flat = flatten(cell, top, undefined, 1);
    const nodes: Update['nodes'] = {};
    const neighbor: Flat = { type: 'sep', loc };
    const { sel, ncursor } = addNeighbor({ current, cursor, flat, neighbor, blank });
    const one = pruneEmptyIds(flat, { node: sel, cursor: ncursor });
    const two = collapseAdjacentIDs(one.items, one.selection);
    const result = unflat(top, two.items, two.selection.node);
    Object.assign(result.nodes, nodes);
    return { result, two };
};

function addNeighbor({ flat, current, neighbor, cursor, blank }: { flat: Flat[]; current: Node; neighbor: Flat; cursor: ListCursor; blank: Node }) {
    let at = flat.indexOf(current);
    if (at === -1) throw new Error(`flatten didnt work I guess`);
    // for (; at < flat.length - 1 && flat[at + 1].type === 'smoosh'; at++); // skip smooshes
    const nodes: Update['nodes'] = {};

    let sel: Node = current;
    let ncursor: Cursor = cursor;

    switch (cursor.where) {
        case 'before':
        case 'start':
            ({ sel, ncursor } = addNeighborBefore(at, flat, neighbor, sel, ncursor, blank));
            break;
        case 'after':
        case 'end':
            ({ sel, ncursor } = addNeighborAfter(at, flat, neighbor, sel, ncursor, blank));
            break;
    }
    return { sel, ncursor, nodes };
}
