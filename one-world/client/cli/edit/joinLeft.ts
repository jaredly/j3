import { splitGraphemes } from '../../../../src/parse/splitGraphemes';
import {
    IRCache,
    lastChild,
    selectNode,
    toSelection,
} from '../../../shared/IR/nav';
import { Path, parentPath, pathWithChildren } from '../../../shared/nodes';
import { Store } from '../../StoreContext2';
import { isCollection } from '../../TextEdit/actions';
import { topUpdate } from './handleUpdate';

export const joinLeft = (
    path: Path,
    current: string[] | undefined,
    index: number,
    cache: IRCache,
    store: Store,
): boolean => {
    const state = store.getState();
    const top = state.toplevels[path.root.toplevel];
    const loc = lastChild(path);
    const node = top.nodes[loc];
    // Here are the things that can have a `text` IR in them:
    if (node.type === 'id') {
        // that's a thing
        const parent = parentPath(path);
        const ploc = lastChild(parent);
        const pnode = top.nodes[ploc];
        // ugh I probably should just make a type === 'collection'...
        if (isCollection(pnode)) {
            const idx = pnode.items.indexOf(loc);
            if (idx === 0) {
                const gparent = parentPath(parent);
                if (!gparent.children.length) {
                    if (pnode.items.length === 1) {
                        // pnode items
                        store.update(
                            {
                                type: 'toplevel',
                                id: top.id,
                                action: {
                                    type: 'update',
                                    update: {
                                        nodes: { [ploc]: undefined },
                                        root: loc,
                                    },
                                },
                            },
                            {
                                type: 'selection',
                                doc: path.root.doc,
                                selections: [
                                    selectNode(
                                        pathWithChildren(gparent, loc),
                                        'start',
                                        cache[top.id].irs,
                                    ),
                                ],
                            },
                        );
                        return true;
                    }
                    return false;
                }
                const gploc = lastChild(gparent);
                const gpnode = top.nodes[gploc];

                if (isCollection(gpnode)) {
                    const items = gpnode.items.slice();
                    const pidx = items.indexOf(ploc);
                    if (pidx === -1) return false;
                    items.splice(pidx, 1, ...pnode.items);
                    store.update(
                        topUpdate(top.id, {
                            [gploc]: { ...pnode, items },
                            [ploc]: undefined,
                        }),
                        {
                            type: 'selection',
                            doc: path.root.doc,
                            selections: [
                                selectNode(
                                    pathWithChildren(gparent, loc),
                                    'start',
                                    cache[top.id].irs,
                                ),
                            ],
                        },
                    );

                    return true;
                }
                return false;
                // if (pnode.items.length > 1) {
                //     return false;
                // }
            }

            const prev = pnode.items[idx - 1];
            const prevNode = top.nodes[prev];
            if (prevNode.type !== 'id') {
                if (current ? current.length : node.text.length) {
                    return false;
                }
                const items = pnode.items.slice();
                items.splice(idx, 1);
                store.update(
                    topUpdate(top.id, {
                        [ploc]: { ...pnode, items },
                        [node.loc]: undefined,
                    }),
                    {
                        type: 'selection',
                        doc: path.root.doc,
                        selections: [
                            selectNode(
                                pathWithChildren(parent, prev),
                                'end',
                                cache[top.id].irs,
                            ),
                        ],
                    },
                );
                return true;
            }
            if (prevNode.type === 'id') {
                const cursor = splitGraphemes(prevNode.text).length;
                const items = pnode.items.slice();
                items.splice(idx, 1);
                // ok we can do this now.
                store.update(
                    topUpdate(top.id, {
                        [ploc]: { ...pnode, items },
                        [node.loc]: undefined,
                        [prev]: {
                            ...prevNode,
                            text:
                                prevNode.text +
                                (current ? current.join('') : node.text),
                        },
                    }),
                    {
                        type: 'selection',
                        doc: path.root.doc,
                        selections: [
                            toSelection({
                                cursor: {
                                    type: 'text',
                                    end: { index: 0, cursor },
                                },
                                path: pathWithChildren(parent, prev),
                            }),
                        ],
                    },
                );
                return true;
            }
        }
        // ->
    } else if (node.type === 'string') {
        if (index > 0) {
            // collapse things
        }
        // also a thing
    } else if (node.type === 'rich-inline') {
        // otherwise, it should probably be a 'go left' kind of situation.
        // return handleMovement('LEFT', path.root.doc, cache, store);
    }
    return false;
};
