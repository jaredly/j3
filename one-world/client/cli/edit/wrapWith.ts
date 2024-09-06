import { ToplevelUpdate } from '../../../shared/action2';
import { lastChild, toSelection } from '../../../shared/IR/nav';
import {
    Path,
    parentPath,
    pathWithChildren,
    serializePath,
} from '../../../shared/nodes';
import { Store } from '../../StoreContext2';
import { isCollection } from '../../TextEdit/actions';
import { replaceNode } from './joinLeft';

export const wrapNodesWith = (
    key: '[' | '(' | '{',
    parent: Path,
    children: number[],
    store: Store,
) => {
    const state = store.getState();
    const top = state.toplevels[parent.root.toplevel];
    const ploc = lastChild(parent);
    const pnode = top.nodes[ploc];
    if (!isCollection(pnode)) return;
    const sidx = pnode.items.indexOf(children[0]);
    const eidx = pnode.items.indexOf(children[children.length - 1]);
    if (sidx === -1 || eidx === -1) return;
    const items = pnode.items.slice();
    const nloc = top.nextLoc;
    const removed = items.splice(sidx, eidx - sidx + 1, nloc);

    const update: ToplevelUpdate['update'] = {
        nodes: {
            [ploc]: { ...pnode, items },
            [nloc]: {
                type: key === '[' ? 'array' : key === '(' ? 'list' : 'record',
                items: removed,
                loc: nloc,
            },
        },
        nextLoc: nloc + 1,
    };

    const npath = pathWithChildren(parent, nloc);
    const pkey = serializePath(npath);
    store.update(
        {
            type: 'toplevel',
            id: top.id,
            action: { type: 'update', update },
        },
        {
            type: 'selection',
            doc: parent.root.doc,
            selections: [
                {
                    start: {
                        path: npath,
                        key: pkey,
                        cursor: { type: 'side', side: 'start' },
                    },
                    end: { path: npath, key: pkey },
                },
            ],
        },
    );

    return;
};

export const wrapWith = (key: '[' | '(' | '{', path: Path, store: Store) => {
    const state = store.getState();
    const top = state.toplevels[path.root.toplevel];

    let loc = lastChild(path);
    let node = top.nodes[loc];
    let parent = parentPath(path);
    if (parent.children.length) {
        // Go up!!!
        const pnode = top.nodes[lastChild(parent)];
        if (pnode.type === 'string' && pnode.tag === loc) {
            path = parent;
            parent = parentPath(path);
            loc = lastChild(path);
            node = top.nodes[loc];
        }
    }

    const wrapperLoc = top.nextLoc;
    const update = replaceNode(path, wrapperLoc, top);
    if (!update) return false;
    update.nodes = {
        ...update.nodes,
        [wrapperLoc]: {
            type: key === '[' ? 'array' : key === '(' ? 'list' : 'record',
            items: [node.loc],
            loc: wrapperLoc,
        },
    };
    if (node.type === 'id' && node.ref?.type === 'placeholder') {
        update.nodes[node.loc] = { ...node, ref: undefined };
    }
    update.nextLoc = wrapperLoc + 1;

    store.update(
        {
            type: 'toplevel',
            id: top.id,
            action: { type: 'update', update },
        },
        {
            type: 'selection',
            doc: path.root.doc,
            selections: [
                toSelection({
                    cursor: {
                        type: 'text',
                        end: { index: 0, cursor: 0 },
                    },
                    path: pathWithChildren(parent, wrapperLoc, node.loc),
                }),
            ],
        },
    );

    return;
};
