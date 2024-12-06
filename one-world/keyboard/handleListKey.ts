import { Node, Nodes } from '../shared/cnodes';
import { findParent, listKindForKeyKind, Flat, addNeighborBefore, addNeighborAfter } from './flatenate';
import { justSel } from './handleNav';
import { textKind } from './insertId';
import { Config } from './test-utils';
import { flatten, flatToUpdateNew } from './rough';
import { Top, Path, CollectionCursor, Update, lastChild, selStart, pathWithChildren, parentPath, Cursor } from './utils';

export const braced = (node: Node) => node.type !== 'list' || (node.kind !== 'smooshed' && node.kind !== 'spaced');

export const handleListKey = (config: Config, top: Top, path: Path, cursor: CollectionCursor, grem: string): Update | void => {
    const current = top.nodes[lastChild(path)];
    const kind = textKind(grem, config);
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
                        spans: [
                            {
                                type: 'text',
                                text: grem,
                            },
                        ],
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
        if (current.type !== 'list') throw new Error('not list');
        switch (kind) {
            case 'string': {
                let nextLoc = top.nextLoc;
                const loc = nextLoc++;
                return {
                    nodes: {
                        [loc]: { type: 'text', spans: [], loc },
                        [current.loc]: { ...current, children: [loc] },
                    },
                    nextLoc,
                    selection: { start: selStart(pathWithChildren(path, loc), { type: 'list', where: 'inside' }) },
                };
            }
            case 'space':
            case 'sep': {
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
                        [current.loc]: { ...current, children },
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
                        [current.loc]: { ...current, children: [loc] },
                    },
                    nextLoc,
                    selection: { start: selStart(pathWithChildren(path, loc), { type: 'id', end: 1 }) },
                };
            }
        }
    }

    const parent = findParent(listKindForKeyKind(kind), parentPath(path), top);
    const flat = parent ? flatten(parent.node, top) : [current];
    let at = flat.indexOf(current);
    if (at === -1) throw new Error(`flatten didnt work I guess`);
    // for (; at < flat.length - 1 && flat[at + 1].type === 'smoosh'; at++); // skip smooshes
    const nodes: Update['nodes'] = {};
    const neighbor: Flat =
        kind === 'sep'
            ? { type: 'sep', loc: -1 }
            : kind === 'space'
            ? { type: 'space', loc: -1 }
            : kind === 'string'
            ? { type: 'text', spans: [], loc: -1 }
            : { type: 'id', text: grem, loc: -1, ccls: kind };

    let sel: Node = current;
    let ncursor: Cursor = cursor;

    switch (cursor.where) {
        case 'before':
        case 'start':
            ({ sel, ncursor } = addNeighborBefore(at, flat, neighbor, sel, ncursor));
            break;
        case 'after':
        case 'end':
            ({ sel, ncursor } = addNeighborAfter(at, flat, neighbor, sel, ncursor));
            break;
    }

    return flatToUpdateNew(
        flat,
        { node: sel, cursor: ncursor },
        { isParent: parent != null, node: parent?.node ?? current, path: parent?.path ?? path },
        nodes,
        top,
    );
};
