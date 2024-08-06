import { lastChild, toSelection } from '../../../shared/IR/nav';
import { Path, parentPath, pathWithChildren } from '../../../shared/nodes';
import { Store } from '../../StoreContext2';
import { replaceNode } from './joinLeft';

export const wrapWith = (
    key: '[' | '(' | '{',
    path: Path,
    current: string[] | undefined,
    store: Store,
) => {
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

    const update = replaceNode(path, top.nextLoc, top);
    if (!update) return false;
    update.nodes = {
        ...update.nodes,
        [top.nextLoc]: {
            type: key === '[' ? 'array' : key === '(' ? 'list' : 'record',
            items: [node.loc],
            loc: top.nextLoc,
        },
    };
    update.nextLoc = top.nextLoc + 1;

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
                    path: pathWithChildren(parent, top.nextLoc, node.loc),
                }),
            ],
        },
    );

    return;
};
