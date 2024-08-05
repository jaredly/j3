import { splitGraphemes } from '../../../../src/parse/splitGraphemes';
import { Action, ToplevelUpdate } from '../../../shared/action2';
import { IRSelection } from '../../../shared/IR/intermediate';
import {
    goFromDocNode,
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
import { Toplevel } from '../../../shared/toplevels';
import { Store } from '../../StoreContext2';
import { isCollection } from '../../TextEdit/actions';
import { topUpdate } from './handleUpdate';

// Handles:
// - collections
// - root
// - strings
// DOES NOT YET
// - spreads/comments
// - rich-block
// - record-access
export const replaceNode = (
    path: Path,
    newLoc: number,
    top: Toplevel,
): ToplevelUpdate['update'] | void => {
    // delete a string!
    if (path.children.length === 1) {
        return { root: newLoc };
    }
    const loc = lastChild(path);
    const parent = parentPath(path);
    const ploc = lastChild(parent);
    const pnode = top.nodes[ploc];

    if (pnode.type === 'string') {
        const idx = pnode.templates.findIndex((t) => t.expr === loc);
        if (idx === -1) return;
        const tpl = pnode.templates.slice();
        tpl[idx] = { expr: newLoc, suffix: tpl[idx].suffix };
        return { nodes: { [ploc]: { ...pnode, templates: tpl } } };
    }

    if (!isCollection(pnode)) return;
    const items = pnode.items.slice();
    const idx = items.indexOf(loc);
    if (idx === -1) return;
    items[idx] = newLoc;
    return { nodes: { [ploc]: { ...pnode, items } } };
    // selection: selectNode(
    //     pathWithChildren(parent, newLoc),
    //     'end',
    //     cache[top.id].irs,
    // ),
};

export const selAction = (path: Path, sel: IRSelection): Action => {
    return { type: 'selection', doc: path.root.doc, selections: [sel] };
};

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

    if (
        node.type === 'string' &&
        node.templates.length === 0 &&
        index === 0 &&
        (current ? current.length === 0 : node.first.length === 0)
    ) {
        const update = replaceNode(path, node.tag, top);
        if (!update) return false;
        store.update(
            {
                type: 'toplevel',
                id: top.id,
                action: { type: 'update', update },
            },
            selAction(
                path,
                selectNode(
                    pathWithChildren(parentPath(path), node.tag),
                    'end',
                    cache[top.id].irs,
                ),
            ),
        );
        return true;
    }

    // that's a thing
    const parent = parentPath(path);

    if (parent.children.length === 0) {
        if (
            node.type === 'id' &&
            (current ? current.length === 0 : node.text.length === 0)
        ) {
            // we can delete
            if (path.root.ids.length > 1) {
                const loc = path.root.ids[path.root.ids.length - 1];
                const ploc = path.root.ids[path.root.ids.length - 2];
                const doc = state.documents[path.root.doc];
                const pnode = doc.nodes[ploc];
                const idx = pnode.children.indexOf(loc);
                if (idx === -1) return false;
                const children = pnode.children.slice();
                children.splice(idx, 1);

                let sel = goFromDocNode(state, path, true, cache);
                if (!sel) {
                    sel = goFromDocNode(state, path, false, cache);
                    if (!sel) return false;
                }

                store.update(
                    {
                        type: 'doc',
                        id: doc.id,
                        action: {
                            type: 'update',
                            update: {
                                nodes: {
                                    [ploc]: { ...pnode, children },
                                    [loc]: undefined,
                                },
                            },
                        },
                    },
                    { type: 'selection', doc: doc.id, selections: [sel] },
                );
                return true;
            }
        }
        return false;
    }

    const ploc = lastChild(parent);
    const pnode = top.nodes[ploc];

    // Joining strings!
    if (pnode.type === 'string') {
        // Here are the things that can have a `text` IR in them:
        if (node.type !== 'id') {
            return false;
        }

        if (current ? current.length : node.text.length) {
            // only empty allowed here
            return false;
        }
        const at = pnode.templates.findIndex((t) => t.expr === loc);
        if (at === -1) return false;
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
            // Here are the things that can have a `text` IR in them:
            if (node.type !== 'id') {
                return false;
            }
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

        if (prevNode.text === '') {
            const items = pnode.items.slice();
            items.splice(idx - 1, 1);
            store.update(
                topUpdate(top.id, {
                    [ploc]: { ...pnode, items },
                    // [prev]: undefined,
                }),
            );
            return true;
        }

        // Here are the things that can have a `text` IR in them:
        if (node.type !== 'id') {
            return false;
        }
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
    return false;
};
