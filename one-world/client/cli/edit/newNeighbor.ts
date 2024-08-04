import { lastChild, toSelection } from '../../../shared/IR/nav';
import {
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
    sibling: RecNodeT<boolean>,
    after = true,
) => {
    const state = store.getState();
    const top = state.toplevels[path.root.toplevel];
    const loc = lastChild(path);
    if (path.children.length < 2) {
        const doc = state.documents[path.root.doc];
        return newDocNodeAfter(path, doc, store);
    }
    const parent = parentPath(path);

    const ploc = lastChild(parent);
    const pnode = top.nodes[ploc];
    if (!isCollection(pnode)) {
        return false;
    }
    const idx = pnode.items.indexOf(loc);

    // const nidx = top.nextLoc;
    const { selected, nloc, nodes, nidx } = inflateRecNode(
        top.nextLoc,
        sibling,
    );

    const items = pnode.items.slice();
    items.splice(idx + (after ? 1 : 0), 0, nloc);
    nodes[ploc] = { ...pnode, items };

    // ok we can do this now.
    store.update(topUpdate(top.id, nodes, nidx.next), {
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

const newDocNodeAfter = (path: Path, doc: Doc, store: Store) => {
    if (path.root.ids.length <= 1) return false; // no parent doc node
    const ploc = path.root.ids[path.root.ids.length - 2];
    const loc = path.root.ids[path.root.ids.length - 1];
    const pnode = doc.nodes[ploc];
    const at = pnode.children.indexOf(loc);
    if (at === -1) return false;
    const children = pnode.children.slice();
    children.splice(at + 1, 0, doc.nextLoc);
    const newTop = Math.random().toString(36).slice(2);
    const ts = {
        created: Date.now(),
        updated: Date.now(),
    } as const;

    const spath: Path = {
        root: {
            ...path.root,
            ids: path.root.ids.slice(0, -1).concat([doc.nextLoc]),
            toplevel: newTop,
        },
        children: [0],
    };

    store.update(
        {
            type: 'doc',
            id: path.root.doc,
            action: {
                type: 'update',
                update: {
                    nodes: {
                        [doc.nextLoc]: {
                            id: doc.nextLoc,
                            children: [],
                            toplevel: newTop,
                            ts,
                        },
                        [ploc]: { ...pnode, children },
                    },
                    nextLoc: doc.nextLoc + 1,
                },
            },
        },
        {
            type: 'toplevel',
            id: newTop,
            action: {
                type: 'reset',
                toplevel: {
                    id: newTop,
                    macros: {},
                    nextLoc: 1,
                    nodes: {
                        0: {
                            type: 'id',
                            loc: 0,
                            text: '',
                        },
                    },
                    root: 0,
                    ts,
                },
            },
        },
        {
            type: 'selection',
            doc: path.root.doc,
            selections: [
                {
                    start: {
                        cursor: {
                            type: 'text',
                            end: { index: 0, cursor: 0 },
                        },
                        key: serializePath(spath),
                        path: spath,
                    },
                },
            ],
        },
    );
    return true;
};
