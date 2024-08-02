import { lastChild, toSelection } from '../../../shared/IR/nav';
import {
    Path,
    parentPath,
    pathWithChildren,
    serializePath,
} from '../../../shared/nodes';
import { Store } from '../../StoreContext2';
import { isCollection } from '../../TextEdit/actions';
import { topUpdate } from './handleUpdate';

export const newNeighbor = (path: Path, store: Store, after = true) => {
    const state = store.getState();
    const top = state.toplevels[path.root.toplevel];
    const loc = lastChild(path);
    const node = top.nodes[loc];
    // Here are the things that can have a `text` IR in them:
    // that's a thing
    const parent = parentPath(path);
    if (!parent.children.length) {
        if (parent.root.ids.length <= 1) return false; // no parent doc node
        const doc = state.documents[parent.root.doc];
        const ploc = parent.root.ids[parent.root.ids.length - 2];
        const loc = parent.root.ids[parent.root.ids.length - 1];
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
                ...parent.root,
                ids: parent.root.ids.slice(0, -1).concat([doc.nextLoc]),
            },
            children: [0],
        };

        store.update(
            {
                type: 'doc',
                id: parent.root.doc,
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
                doc: parent.root.doc,
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
    }

    const ploc = lastChild(parent);
    const pnode = top.nodes[ploc];
    // ugh I probably should just make a type === 'collection'...
    if (!isCollection(pnode)) {
        return false;
    }
    const idx = pnode.items.indexOf(loc);
    const nidx = top.nextLoc;
    const items = pnode.items.slice();
    items.splice(idx + (after ? 1 : 0), 0, nidx);
    // ok we can do this now.
    store.update(
        topUpdate(
            top.id,
            {
                [ploc]: { ...pnode, items },
                [nidx]: { type: 'id', text: '', loc: nidx },
            },
            nidx + 1,
        ),
        {
            type: 'selection',
            doc: path.root.doc,
            selections: [
                toSelection({
                    cursor: {
                        type: 'text',
                        end: { index: 0, cursor: 0 },
                    },
                    path: pathWithChildren(parent, nidx),
                }),
            ],
        },
    );
    return true;
    // ->
};
