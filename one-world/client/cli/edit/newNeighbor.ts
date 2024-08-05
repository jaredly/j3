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
import { Doc, PersistedState } from '../../../shared/state2';
import { Store } from '../../StoreContext2';
import { inflateRecNode, isCollection } from '../../TextEdit/actions';
import { topUpdate } from './handleUpdate';

export const newNeighbor = (
    path: Path,
    store: Store,
    siblings: RecNodeT<boolean>[],
    after = true,
) => {
    if (!siblings.length) return false;

    const state = store.getState();
    const top = state.toplevels[path.root.toplevel];
    const loc = lastChild(path);
    if (path.children.length < 2) {
        const doc = state.documents[path.root.doc];
        return newDocNodeNeighbor(path, doc, store, siblings, after);
    }
    const parent = parentPath(path);

    const ploc = lastChild(parent);
    const pnode = top.nodes[ploc];
    if (!isCollection(pnode)) {
        return false;
    }
    const idx = pnode.items.indexOf(loc);

    let nextLoc = top.nextLoc;
    const nlocs: number[] = [];
    const allNodes: Nodes = {};
    let selecteds: { cursor: IRCursor; children: number[] }[] = [];
    // const nidx = top.nextLoc;
    siblings.forEach((sibling) => {
        const { selected, nloc, nodes, nidx } = inflateRecNode(
            nextLoc,
            sibling,
        );
        nextLoc = nidx.next;
        nlocs.push(nloc);
        Object.assign(allNodes, nodes);
        selecteds.push(selected);
    });

    const items = pnode.items.slice();
    items.splice(idx + (after ? 1 : 0), 0, ...nlocs);
    allNodes[ploc] = { ...pnode, items };

    const selected = selecteds[selecteds.length - 1];

    // ok we can do this now.
    store.update(topUpdate(top.id, allNodes, nextLoc), {
        type: 'selection',
        doc: path.root.doc,
        selections: [
            toSelection({
                cursor: selected.cursor,
                path: pathWithChildren(parent, ...selected.children),
            }),
        ],
    });
    return true;
    // ->
};

const newDocNodeNeighbor = (
    path: Path,
    doc: Doc,
    store: Store,
    siblings: RecNodeT<boolean>[],
    after = true,
): boolean => {
    if (path.root.ids.length <= 1) return false; // no parent doc node
    const ploc = path.root.ids[path.root.ids.length - 2];
    const loc = path.root.ids[path.root.ids.length - 1];
    const pnode = doc.nodes[ploc];
    const at = pnode.children.indexOf(loc);
    if (at === -1) return false;

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
            action: {
                type: 'reset',
                toplevel: {
                    id: newTop,
                    macros: {},
                    nextLoc: nidx.next,
                    nodes,
                    root: nloc,
                    ts,
                },
            },
        });
    });

    children.splice(at + (after ? 1 : 0), 0, ...docLocs);

    store.update(
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
                    start: selections[0].start,
                    end: {
                        path: selections[selections.length - 1].start.path,
                        key: selections[selections.length - 1].start.key,
                    },
                },
            ],
        },
    );
    return true;
};
