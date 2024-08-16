import { splitGraphemes } from '../../../../src/parse/splitGraphemes';
import {
    idSelection,
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
import { CLoc, findTableLoc, topUpdate } from './handleUpdate';

export const split = (
    path: Path,
    norm: CLoc,
    node: Extract<Node, { type: 'id' }>,
    store: Store,
    cache: IRCache,
) => {
    const state = store.getState();
    const top = state.toplevels[path.root.toplevel];
    const loc = lastChild(path);
    // Here are the things that can have a `text` IR in them:
    // that's a thing
    const parent = parentPath(path);
    if (!parent.children.length) return;
    const ploc = lastChild(parent);
    const pnode = top.nodes[ploc];
    // ugh I probably should just make a type === 'collection'...
    if (isCollection(pnode)) {
        const idx = pnode.items.indexOf(loc);
        const nidx = top.nextLoc;
        const items = pnode.items.slice();
        items.splice(idx + 1, 0, nidx);
        const text = norm.text;
        // ok we can do this now.
        store.update(
            topUpdate(
                top.id,
                {
                    [ploc]: { ...pnode, items },
                    [node.loc]: {
                        ...node,
                        text: text.slice(0, norm.start ?? norm.end).join(''),
                    },
                    [nidx]: {
                        type: 'id',
                        text: text.slice(norm.end).join(''),
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
                        path: pathWithChildren(parent, nidx),
                    }),
                ],
            },
        );
        return true;
    } else if (pnode.type === 'table') {
        const { row, col } = findTableLoc(pnode, node.loc);
        const width = pnode.rows.reduce((m, r) => Math.max(m, r.length), 0);
        const rows = pnode.rows.slice();
        if (col === rows[row].length - 1) {
            // STOPSHIP: fill with empty IDs pleaseee
            rows.splice(row + 1, 0, [top.nextLoc]);
            store.update(
                topUpdate(
                    top.id,
                    {
                        [pnode.loc]: {
                            ...pnode,
                            rows,
                        },
                        [node.loc]: {
                            ...node,
                            text: norm.text
                                .slice(0, norm.start ?? norm.end)
                                .join(''),
                        },
                        [top.nextLoc]: {
                            type: 'id',
                            text: norm.text.slice(norm.end).join(''),
                            loc: top.nextLoc,
                        },
                    },
                    top.nextLoc + 1,
                ),
                {
                    type: 'selection',
                    doc: path.root.doc,
                    selections: [
                        idSelection(
                            pathWithChildren(parentPath(path), top.nextLoc),
                        ),
                    ],
                },
            );
            return true;
        } else {
            const next = rows[row][col + 1];
            store.update({
                type: 'selection',
                doc: path.root.doc,
                selections: [
                    selectNode(
                        pathWithChildren(parentPath(path), next),
                        'start',
                        cache[top.id].irs,
                    ),
                ],
            });

            return true;
        }
    }
    // } else if (node.type === 'string') {
    //     if (norm.index > 0) {
    //         // collapse things
    //     }
    //     // also a thing
    // } else if (node.type === 'rich-inline') {
    //     // otherwise, it should probably be a 'go left' kind of situation.
    //     // return handleMovement('LEFT', path.root.doc, cache, store);
    // }
    return false;
};
