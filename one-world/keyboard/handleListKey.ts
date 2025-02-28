import { Node, NodeID } from '../shared/cnodes';
import { addNeighborAfter, addNeighborBefore, findParent, Flat, listKindForKeyKind } from './flatenate';
import { handleTableSplit, handleTagCloser } from './handleIdKey';
import { isTag } from './handleNav';
import { textKind } from './insertId';
import { KeyAction, moveA } from './keyActionToUpdate';
import { collapseAdjacentIDs, flatten, pruneEmptyIds, unflat } from './rough';
import { Config } from './test-utils';
import { CollectionCursor, Cursor, lastChild, ListCursor, parentPath, Path, selStart, Top, UNodes } from './utils';

export const braced = (node: Node) => node.type !== 'list' || (node.kind !== 'smooshed' && node.kind !== 'spaced');

export const handleListKey = (config: Config, top: Top, path: Path, cursor: CollectionCursor, grem: string): KeyAction[] | void => {
    const current = top.nodes[lastChild(path)];
    const kind = textKind(grem, config);
    if (cursor.type === 'control' && current.type === 'list') {
        if (grem === ' ' || grem === '\n') {
            return [{ type: 'control-toggle', path, index: cursor.index }];
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
        return [
            {
                type: 'replace-self',
                path,
                cursor: { type: 'list', where: 'inside' },
                node: { type: 'table', kind: current.kind, loc: true, rows: [] },
            },
        ];
    }

    if (grem === '\n' && braced(current) && current.type === 'list' && !current.forceMultiline && cursor.where === 'inside') {
        return [{ type: 'toggle-multiline', loc: current.loc }];
    }

    if (cursor.where === 'inside') {
        if (current.type === 'text') {
            if (kind === 'string') {
                return moveA(selStart(path, { type: 'list', where: 'after' }));
            }
            return [{ type: 'add-span', path, span: { type: 'text', text: grem, loc: '' }, index: 0, cursor: 1 }];
        }
        if (current.type !== 'list' && current.type !== 'table') throw new Error('not list or table');
        if (grem === '>' && current.type === 'list' && isTag(current.kind)) {
            return moveA(selStart(path, { type: 'list', where: 'after' }));
        }
        switch (kind) {
            case 'string': {
                return [
                    {
                        type: 'add-inside',
                        path,
                        children: [{ type: 'text', spans: [{ type: 'text', text: '', loc: true }], loc: false }],
                        cursor: {
                            type: 'text',
                            end: { index: 0, cursor: 0 },
                        },
                    },
                ];
            }
            case 'space':
            case 'sep': {
                if (current.type === 'list' && isTag(current.kind)) {
                    return [{ type: 'add-inside', path, children: [{ type: 'id', text: '', loc: true }], cursor: { type: 'id', end: 0 } }];
                }
                // [add-inside, ... add another insideee]
                return [
                    {
                        type: 'add-inside',
                        path,
                        children:
                            kind === 'space'
                                ? [
                                      {
                                          type: 'list',
                                          loc: false,
                                          kind: 'spaced',
                                          children: [
                                              { type: 'id', text: '', loc: false },
                                              { type: 'id', text: '', loc: true },
                                          ],
                                      },
                                  ]
                                : [
                                      { type: 'id', text: '', loc: false },
                                      { type: 'id', text: '', loc: true },
                                  ],
                        cursor: { type: 'id', end: 0 },
                    },
                ];
            }
            default: {
                return [{ type: 'add-inside', path, children: [{ type: 'id', text: grem, ccls: kind, loc: true }], cursor: { type: 'id', end: 1 } }];
            }
        }
    }

    const table = handleTableSplit(grem, config, path, top, cursor.where === 'before' ? 'before' : 'after');
    if (table) return table;

    const parent = findParent(listKindForKeyKind(kind), parentPath(path), top);
    const closeUp = handleTagCloser(top, current, grem, parent, path);
    if (closeUp) return closeUp;

    return [
        {
            type: 'insert-text',
            path,
            pos: cursor.where === 'after' ? 'after' : 'before',
            what:
                typeof kind === 'number'
                    ? { type: 'text', grem, ccls: kind }
                    : kind === 'sep'
                    ? { type: 'sep', newLine: grem === '\n' }
                    : { type: kind },
        },
    ];
};

export const splitListCell = (current: Node, cursor: ListCursor, blank: Node) => (cell: Node, top: Top, loc: NodeID) => {
    const flat = flatten(cell, top, undefined, 1);
    const nodes: UNodes = {};
    const neighbor: Flat = { type: 'sep', loc };
    const { sel, ncursor } = addNeighbor({ current, cursor, flat, neighbor, blank });
    const one = pruneEmptyIds(flat, { node: sel, cursor: ncursor });
    const two = collapseAdjacentIDs(one.items, one.selection);
    const result = unflat(top, two.items, two.selection.node);
    Object.assign(result.nodes, nodes);
    return { result, two };
};

export function addNeighbor({
    flat,
    current,
    neighbor,
    cursor,
    blank,
}: {
    flat: Flat[];
    current: Node;
    neighbor: Flat;
    cursor: ListCursor;
    blank: Node;
}) {
    let at = flat.indexOf(current);
    if (at === -1) throw new Error(`flatten didnt work I guess`);
    // for (; at < flat.length - 1 && flat[at + 1].type === 'smoosh'; at++); // skip smooshes
    const nodes: UNodes = {};

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
