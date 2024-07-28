import { splitGraphemes } from '../../../src/parse/splitGraphemes';
import { Action, ToplevelUpdate } from '../../shared/action2';
import { IR } from '../../shared/IR/intermediate';
import {
    goLeftRight,
    IRCache,
    irNavigable,
    lastChild,
    selectNode,
    toSelection,
} from '../../shared/IR/nav';
import {
    parentPath,
    Path,
    pathWithChildren,
    serializePath,
} from '../../shared/nodes';
import { Store } from '../StoreContext2';
import { isCollection } from '../TextEdit/actions';
import { handleMovement } from './handleMovement';

const getIRText = (cache: IRCache, path: Path, index: number) => {
    const irRoot = cache[path.root.toplevel].irs[lastChild(path)];
    if (!irRoot) return '';
    const ir = irNavigable(irRoot).filter((t) => t.type === 'text')[
        index
    ] as Extract<IR, { type: 'text' }>;
    return ir.text;
};

export const handleUpdate = (
    key: string,
    docId: string,
    cache: IRCache,
    store: Store,
): boolean => {
    const ds = store.getDocSession(docId, store.session);
    if (!ds.selections.length) return false;

    // TODO multiselect
    const sel = ds.selections[0];
    if (sel.end) return false; // ugh
    if (sel.start.cursor.type !== 'text') return false; // not a text update
    const { start, end } = sel.start.cursor;
    if (start && end.index !== start?.index) return false; // TODO

    let [st, ed] = start
        ? start.cursor < end.cursor
            ? [start.cursor, end.cursor]
            : [end.cursor, start.cursor]
        : [end.cursor, end.cursor];

    if (key === 'BACKSPACE' && !start) {
        if (end.cursor === 0) {
            // join-left
            if (!joinLeft(sel.start.path, end.text, end.index, cache, store)) {
                handleMovement('LEFT', sel.start.path.root.doc, cache, store);
            }
            return true;
        } else {
            st -= 1;
        }
    }

    const current =
        end.text ?? splitGraphemes(getIRText(cache, sel.start.path, end.index));

    const text = key === 'BACKSPACE' ? [] : splitGraphemes(key);
    if (text.length > 1) return false;

    const updated = current.slice(0, st).concat(text).concat(current.slice(ed));

    store.update({
        type: 'selection',
        doc: docId,
        selections: [
            {
                start: {
                    path: sel.start.path,
                    key: serializePath(sel.start.path),
                    cursor: {
                        type: 'text',
                        end: {
                            cursor: st + text.length,
                            index: end.index,
                            text: updated,
                        },
                    },
                },
            },
        ],
    });
    return true;

    // if (key === 'RIGHT') {
    //     const ds = store.getDocSession(docId, store.session);
    //     if (ds.selections.length) {
    //         const sel = ds.selections[0];
    //         const next = goLeftRight(sel, cache, false);
    //         if (next) {
    //             store.update({
    //                 type: 'in-session',
    //                 action: { type: 'multi', actions: [] },
    //                 doc: docId,
    //                 selections: [next],
    //             });
    //             return true;
    //         }
    //     }
    // }
    // if (key === 'LEFT') {
    //     const ds = store.getDocSession(docId, store.session);
    //     if (ds.selections.length) {
    //         const sel = ds.selections[0];
    //         const next = goLeftRight(sel, cache, true);
    //         if (next) {
    //             store.update({
    //                 type: 'in-session',
    //                 action: { type: 'multi', actions: [] },
    //                 doc: docId,
    //                 selections: [next],
    //             });
    //             return true;
    //         }
    //     }
    // }
    // return false;
};

export const topUpdate = (
    id: string,
    nodes: ToplevelUpdate['update']['nodes'],
    nidx?: number,
): Action => ({
    type: 'toplevel',
    id,
    action: {
        type: 'update',
        update: nidx != null ? { nodes, nextLoc: nidx } : { nodes },
    },
});

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
            if (idx > 0) {
                const prev = pnode.items[idx - 1];
                const prevNode = top.nodes[prev];
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
        } else {
            // ignore it?
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
