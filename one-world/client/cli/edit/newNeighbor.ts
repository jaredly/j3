import { Action } from '../../../shared/action2';
import { IRCursor, IRSelection } from '../../../shared/IR/intermediate';
import { lastChild, toSelection } from '../../../shared/IR/nav';
import {
    Nodes,
    Path,
    RecNodeT,
    parentPath,
    pathWithChildren,
    serializePath,
} from '../../../shared/nodes';
import { Doc, getDoc, PersistedState } from '../../../shared/state2';
import { getTopForPath } from '../../selectNode';
import { Store } from '../../StoreContext2';
import { inflateRecNode, isCollection } from '../../TextEdit/actions';
import { findTableLoc, topUpdate } from './handleUpdate';

export const newNeighbor = (
    path: Path,
    store: Store,
    siblings: RecNodeT<boolean>[],
    after = true,
) => {
    const actions = newNeighborActions(path, store.getState(), siblings, after);
    if (!actions) return false;
    store.update(...actions);
    return true;
};

// NOTE This does a /multiselect/ on the created node, UNLESS it's an empty ID.
export const newNeighborActions = (
    path: Path,
    state: PersistedState,
    siblings: RecNodeT<boolean>[],
    after = true,
): Action[] | void => {
    if (!siblings.length) return;

    const top = getTopForPath(path, state);
    const loc = lastChild(path);
    if (path.children.length < 2) {
        const doc = getDoc(state, path.root.doc);
        return newDocNodeNeighbor(path, doc, siblings, after);
    }
    const parent = parentPath(path);

    const ploc = lastChild(parent);
    const pnode = top.nodes[ploc];

    let nextLoc = top.nextLoc;
    const nlocs: number[] = [];
    const allNodes: Nodes = {};
    let selecteds: {
        cursor: IRCursor;
        children: number[];
        node: RecNodeT<boolean>;
    }[] = [];
    // const nidx = top.nextLoc;
    siblings.forEach((sibling) => {
        const { selected, nloc, nodes, nidx } = inflateRecNode(
            nextLoc,
            sibling,
        );
        nextLoc = nidx.next;
        nlocs.push(nloc);
        Object.assign(allNodes, nodes);
        selecteds.push({ ...selected, node: sibling });
    });

    const selected = selecteds[selecteds.length - 1];
    const epath = pathWithChildren(parent, ...selecteds[0].children);

    const isEmpty = (node: RecNodeT<boolean>) =>
        node.type === 'id' && node.text === '';

    if (pnode.type === 'table') {
        // if (siblings.length)
        const { row, col } = findTableLoc(pnode, loc);
        const width = pnode.rows.reduce((w, r) => Math.max(w, r.length), 0);
        const rows = pnode.rows.slice();
        if (col === rows[row].length - 1) {
            while (nlocs.length < width) {
                allNodes[nextLoc] = { type: 'id', text: '', loc: nextLoc };
                nlocs.push(nextLoc++);
            }
            rows.splice(row + 1, 0, nlocs);
        } else {
            rows[row] = rows[row].slice();
            rows[row].splice(col + 1, 0, ...nlocs);
        }
        allNodes[pnode.loc] = { ...pnode, rows };
        return [
            topUpdate(top.id, path.root.doc, allNodes, nextLoc),
            {
                type: 'selection',
                doc: path.root.doc,
                selections: [
                    {
                        ...toSelection({
                            cursor: selected.cursor,
                            path: pathWithChildren(
                                parent,
                                ...selected.children,
                            ),
                        }),
                        end: isEmpty(selected.node)
                            ? undefined
                            : { path: epath, key: serializePath(epath) },
                    },
                ],
            },
        ];
    }

    if (!isCollection(pnode)) {
        return;
    }
    const idx = pnode.items.indexOf(loc);
    const items = pnode.items.slice();
    items.splice(idx + (after ? 1 : 0), 0, ...nlocs);
    allNodes[ploc] = { ...pnode, items };

    // ok we can do this now.
    return [
        topUpdate(top.id, path.root.doc, allNodes, nextLoc),
        {
            type: 'selection',
            doc: path.root.doc,
            selections: [
                {
                    ...toSelection({
                        cursor: selected.cursor,
                        path: pathWithChildren(parent, ...selected.children),
                    }),
                    end: isEmpty(selected.node)
                        ? undefined
                        : { path: epath, key: serializePath(epath) },
                },
            ],
        },
    ];
};

export const newDocNodeNeighbor = (
    path: Path,
    doc: Doc,
    siblings: RecNodeT<boolean>[],
    after = true,
): Action[] | void => {
    if (path.root.ids.length <= 1) return;
    const ploc = path.root.ids[path.root.ids.length - 2];
    const loc = path.root.ids[path.root.ids.length - 1];
    const pnode = doc.nodes[ploc];
    const at = pnode.children.indexOf(loc);
    if (at === -1) return;

    let nextDocNode = doc.nextLoc;

    const children = pnode.children.slice();
    const docNodes: Doc['nodes'] = {
        [ploc]: { ...pnode, children },
    };

    const topActions: Action[] = [];
    const docLocs: number[] = [];
    const selections: IRSelection[] = [];
    const ts = {
        created: Date.now(),
        updated: Date.now(),
    } as const;

    siblings.forEach((sibling) => {
        const docLoc = nextDocNode++;
        docLocs.push(docLoc);

        const { selected, nloc, nodes, nidx } = inflateRecNode(0, sibling);
        const newTop = Math.random().toString(36).slice(2);

        selections.push(
            toSelection({
                cursor: selected.cursor,
                path: {
                    root: {
                        type: 'doc-node',
                        doc: doc.id,
                        ids: path.root.ids.slice(0, -1).concat([docLoc]),
                        toplevel: newTop,
                    },
                    children: selected.children,
                },
            }),
        );

        docNodes[docLoc] = {
            id: docLoc,
            children: [],
            toplevel: newTop,
            ts,
        };

        topActions.push({
            type: 'toplevel',
            id: newTop,
            doc: path.root.doc,
            action: {
                type: 'reset',
                toplevel: {
                    id: newTop,
                    auxiliaries: [],
                    nextLoc: nidx.next,
                    module: doc.module,
                    nodes,
                    root: nloc,
                    ts,
                },
            },
        });
    });

    children.splice(at + (after ? 1 : 0), 0, ...docLocs);

    return [
        {
            type: 'doc',
            id: path.root.doc,
            action: {
                type: 'update',
                update: {
                    nodes: docNodes,
                    nextLoc: nextDocNode,
                },
            },
        },
        ...topActions,
        {
            type: 'selection',
            doc: path.root.doc,
            selections: [
                {
                    type: 'ir',
                    start: selections[0].start,
                    end: {
                        path: selections[selections.length - 1].start.path,
                        key: selections[selections.length - 1].start.key,
                    },
                },
            ],
        },
    ];
};
