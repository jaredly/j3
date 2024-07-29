import { lastChild, toSelection } from '../../../shared/IR/nav';
import { Path, parentPath, pathWithChildren } from '../../../shared/nodes';
import { Store } from '../../StoreContext2';
import { isCollection } from '../../TextEdit/actions';
import { topUpdate } from './handleUpdate';

export const wrapWith = (
    key: '[' | '(' | '{',
    path: Path,
    current: string[] | undefined,
    store: Store,
) => {
    const state = store.getState();
    const top = state.toplevels[path.root.toplevel];
    const loc = lastChild(path);
    const node = top.nodes[loc];

    const parent = parentPath(path);

    if (!parent.children.length) {
        const nidx = top.nextLoc;

        store.update(
            {
                type: 'toplevel',
                id: top.id,
                action: {
                    type: 'update',
                    update: {
                        nodes: {
                            [nidx]: {
                                type:
                                    key === '['
                                        ? 'array'
                                        : key === '('
                                        ? 'list'
                                        : 'record',
                                items: [node.loc],
                                loc: nidx,
                            },
                        },
                        root: nidx,
                        nextLoc: nidx + 1,
                    },
                },
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
                        path: pathWithChildren(parent, nidx, node.loc),
                    }),
                ],
            },
        );
        return;
    }

    const ploc = lastChild(parent);
    const pnode = top.nodes[ploc];
    // ugh I probably should just make a type === 'collection'...
    if (isCollection(pnode)) {
        const idx = pnode.items.indexOf(loc);
        const nidx = top.nextLoc;
        const items = pnode.items.slice();
        items[idx] = nidx;

        store.update(
            topUpdate(
                top.id,
                {
                    [ploc]: { ...pnode, items },
                    [nidx]: {
                        type:
                            key === '['
                                ? 'array'
                                : key === '('
                                ? 'list'
                                : 'record',
                        items: [node.loc],
                        loc: nidx,
                    },
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
                        path: pathWithChildren(parent, nidx, node.loc),
                    }),
                ],
            },
        );
    }
};
