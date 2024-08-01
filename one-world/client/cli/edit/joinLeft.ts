import { splitGraphemes } from '../../../../src/parse/splitGraphemes';
import {
    IRCache,
    lastChild,
    selectNode,
    toSelection,
} from '../../../shared/IR/nav';
import {
    Node,
    Path,
    parentPath,
    pathWithChildren,
} from '../../../shared/nodes';
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
    if (node.type !== 'id') {
        return false;
    }
    // that's a thing
    const parent = parentPath(path);
    const ploc = lastChild(parent);
    const pnode = top.nodes[ploc];
    if (pnode.type === 'string') {
        if (current ? current.length : node.text.length) {
            // only empty allowed here
            return false;
        }
        const at = pnode.templates.findIndex((t) => t.expr === loc);
        let newParent: Node = { ...pnode };
        let cursor;
        if (at === 0) {
            newParent.first = pnode.first + pnode.templates[at].suffix;
            newParent.templates = pnode.templates.slice(1);
            cursor = splitGraphemes(pnode.first).length;
        } else {
            const tpl = pnode.templates.slice();
            cursor = splitGraphemes(tpl[at - 1].suffix).length;
            tpl[at - 1] = {
                ...tpl[at - 1],
                suffix: tpl[at - 1].suffix + tpl[at].suffix,
            };
            tpl.splice(at, 1);
            newParent.templates = tpl;
        }

        store.update(
            {
                type: 'toplevel',
                id: top.id,
                action: {
                    type: 'update',
                    update: { nodes: { [ploc]: newParent } },
                },
            },
            {
                type: 'selection',
                doc: path.root.doc,
                selections: [
                    toSelection({
                        cursor: { type: 'text', end: { index: at, cursor } },
                        path: parent,
                    }),
                ],
            },
        );
        return true;
    }

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
    return false;
};
