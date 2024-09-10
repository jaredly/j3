import { splitGraphemes } from '../../../../src/parse/splitGraphemes';
import { Action, ToplevelUpdate } from '../../../shared/action2';
import { IR, IRCursor, IRSelection } from '../../../shared/IR/intermediate';
import {
    goLeftRight,
    IRCache,
    IRCache2,
    irNavigable,
    lastChild,
    parentLoc,
    selectNode,
    toSelection,
} from '../../../shared/IR/nav';
import {
    fromMap,
    Node,
    parentPath,
    Path,
    pathWithChildren,
    serializePath,
} from '../../../shared/nodes';
import {
    DocSelection,
    DocSession,
    PersistedState,
} from '../../../shared/state2';
import { Toplevel } from '../../../shared/toplevels';
import { getNodeForPath } from '../../selectNode';
import { Store } from '../../StoreContext2';
import { isCollection } from '../../TextEdit/actions';
import { MultiSelect, resolveMultiSelect } from '../resolveMultiSelect';
import { addTableColumn } from './addTableColumn';
import { handleMovement } from './handleMovement';
import { handleRichText } from './handleRichText';
import { joinLeft, replaceNode, selAction } from './joinLeft';
import { newNeighbor } from './newNeighbor';
import { split } from './split';
import { swap, swapTop } from './swap';
import { wrapNodesWith, wrapWith } from './wrapWith';

const getIRText = (cache: IRCache2<unknown>, path: Path, index: number) => {
    const irRoot = cache[path.root.toplevel].irs[lastChild(path)];
    if (!irRoot) return '';
    const ir = irNavigable(irRoot).filter((t) => t.type === 'text')[
        index
    ] as Extract<IR, { type: 'text' }>;

    // console.log(irRoot, irNavigable(irRoot));

    return ir.text;
};

export const handleUpdate = (
    key: string,
    docId: string,
    cache: IRCache2<unknown>,
    store: Store,
): boolean => {
    if (handleRichText(key, docId, store)) {
        return true;
    }

    const ds = store.getDocSession(docId, store.session);
    if (!ds.selections.length) return false;
    const sel = ds.selections[0];
    if (sel.type !== 'ir') {
        return handleNamespaceUpdate(key, docId, sel, cache, store);
    }

    if (sel.end && sel.end.key !== sel.start.key) {
        return handleMutliSelect(store, sel, sel.end, key, ds);
    }

    // ctrl-space apparently
    if (key === 'NUL') {
        store.update({
            type: 'selection',
            doc: docId,
            selections: ds.selections,
            autocomplete: true,
        });
        return true;
    }

    if (key === 'CTRL_V') {
        if (!ds.clipboard.length) return false;
        // TODO: If current is empty, replace it
        return newNeighbor(sel.start.path, store, ds.clipboard);
    }

    if (sel.start.cursor.type !== 'text') {
        return handleNonTextUpdate(key, sel, cache, store);
    }

    const norm = normalizeSelection(sel, cache);
    if (!norm) return false;

    if (key === 'BACKSPACE' && norm.start == null) {
        if (norm.end === 0) {
            if (
                !joinLeft(sel.start.path, norm.text, norm.index, cache, store)
            ) {
                handleMovement('LEFT', sel.start.path.root.doc, cache, store);
            }
            return true;
        }
        norm.start = norm.end - 1;
    }

    const state = store.getState();
    const path = sel.start.path;
    const top = state.toplevels[path.root.toplevel];
    const node = top.nodes[lastChild(path)];

    // ifff | is at the /end/ of a thing

    if (node.type === 'id') {
        if (
            handleIDUpdate({
                key,
                path,
                norm,
                sel,
                node,
                top,
                store,
                cache,
            })
        ) {
            return true;
        }
    }

    if (
        key === '"' &&
        node.type === 'string' &&
        norm.start == null &&
        norm.end == norm.text.length &&
        norm.index === node.templates.length
    ) {
        const next = goLeftRight(sel, cache, false, false, store.getState());
        if (next) {
            store.update({
                type: 'selection',
                doc: docId,
                selections: [next],
            });
            return true;
        } else {
            return false;
        }
    }

    if (
        node.type === 'string' &&
        norm.start == null &&
        norm.end > 0 &&
        key === '{' &&
        norm.text[norm.end - 1] === '$'
    ) {
        const top = store.getState().toplevels[path.root.toplevel];
        const nidx = top.nextLoc;
        const loc = lastChild(path);
        const up = { ...node };
        up.templates = up.templates.slice();
        if (norm.index === 0) {
            up.first = norm.text.slice(0, norm.end - 1).join('');
            up.templates.unshift({
                expr: nidx,
                suffix: norm.text.slice(norm.end).join(''),
            });
        } else {
            up.templates[norm.index - 1] = {
                ...up.templates[norm.index - 1],
                suffix: norm.text.slice(0, norm.end - 1).join(''),
            };
            up.templates.splice(norm.index, 0, {
                expr: nidx,
                suffix: norm.text.slice(norm.end).join(''),
            });
        }
        const map: ToplevelUpdate['update']['nodes'] = {
            [nidx]: {
                type: 'id',
                text: '',
                loc: nidx,
            },
            [loc]: up,
        };

        store.update(topUpdate(top.id, map, nidx + 1), {
            type: 'selection',
            doc: path.root.doc,
            selections: [
                toSelection({
                    cursor: {
                        type: 'text',
                        end: { index: 0, cursor: 0 },
                    },
                    path: pathWithChildren(path, nidx),
                }),
            ],
        });
        return true;
    }

    const text =
        key === 'BACKSPACE' ? [] : key === 'ENTER' ? '\n' : splitGraphemes(key);
    if (text.length > 1) return false;

    const updated = norm.text
        .slice(0, norm.start ?? norm.end)
        .concat(text)
        .concat(norm.text.slice(norm.end));

    store.update({
        type: 'selection',
        doc: docId,
        selections: [
            {
                type: 'ir',
                start: {
                    path: sel.start.path,
                    key: serializePath(sel.start.path),
                    cursor: {
                        type: 'text',
                        end: {
                            cursor: (norm.start ?? norm.end) + text.length,
                            index: norm.index,
                            text: updated,
                        },
                    },
                },
            },
        ],
        autocomplete: true,
    });
    return true;
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

export type CLoc = {
    start?: number;
    end: number;
    text: string[];
    index: number;
};

export const normalizeSelection = (
    sel: IRSelection,
    cache: IRCache2<unknown>,
): CLoc | null => {
    if (sel.start.cursor.type !== 'text') return null;
    const { start, end } = sel.start.cursor;
    if (start && end.index !== start?.index) return null; // TODO
    const { index } = end;

    const text =
        end.text ?? splitGraphemes(getIRText(cache, sel.start.path, index));

    if (sel.end) {
        return { start: 0, end: text.length, text, index };
    }

    if (!start || start.cursor === end.cursor) {
        return { start: undefined, end: end.cursor, text, index };
    }

    if (end.cursor < start.cursor) {
        return { start: end.cursor, end: start.cursor, text, index };
    }

    return { start: start.cursor, end: end.cursor, text, index };
};

export const findTableLoc = (
    node: Extract<Node, { type: 'table' }>,
    loc: number,
) => {
    for (let row = 0; row < node.rows.length; row++) {
        for (let col = 0; col < node.rows[row].length; col++) {
            if (node.rows[row][col] === loc) {
                return { row, col };
            }
        }
    }
    return { row: 0, col: 0 };
};

export const handleIDUpdate = ({
    key,
    path,
    norm,
    sel,
    node,
    top,
    store,
    cache,
}: {
    key: string;
    path: Path;
    norm: CLoc;
    sel: IRSelection;
    node: Extract<Node, { type: 'id' }>;
    top: Toplevel;
    store: Store;
    cache: IRCache2<unknown>;
}): boolean => {
    if (key === ' ' || key === 'ENTER') {
        // OK so ...
        // if we have an autocomplete open, we don't actually want to split.

        split(path, norm, node, store, cache);
        return true;
    }

    if (norm.end === 0) {
        if (key === '[' || key === '(' || key === '{') {
            // only work with empty?
            wrapWith(key, path, store);
            return true;
        }

        if (key === '|') {
            const pnode = top.nodes[parentLoc(path)];
            if (isCollection(pnode) && pnode.items.length === 1) {
                // const idx = pnode.items.indexOf(node.loc)
                // First item of a `() {} []` collection, at the start,
                // and typing a '|'
                if (pnode.items[0] === node.loc) {
                    store.update(
                        topUpdate(top.id, {
                            [pnode.loc]: {
                                type: 'table',
                                loc: pnode.loc,
                                rows: [[node.loc]],
                                kind:
                                    pnode.type === 'list'
                                        ? '('
                                        : pnode.type === 'array'
                                        ? '['
                                        : '{',
                            },
                        }),
                    );
                    return true;
                }
            }
        }
    }

    if (key === '|' && norm.start == null && norm.end === norm.text.length) {
        const pnode = top.nodes[parentLoc(path)];
        if (pnode.type === 'table') {
            const actions = addTableColumn(pnode, path, top.id, top.nextLoc);
            store.update(...actions);
            return true;
        }
    }

    if (norm.text.length === 0 && key === '\\') {
        const top = store.getState().toplevels[path.root.toplevel];
        const npath = pathWithChildren(path, top.nextLoc);
        store.update(
            topUpdate(
                top.id,
                {
                    [node.loc]: {
                        type: 'rich-block',
                        items: [top.nextLoc],
                        loc: node.loc,
                        style: {},
                    },
                    [top.nextLoc]: {
                        type: 'rich-inline',
                        loc: top.nextLoc,
                        spans: [{ type: 'text', text: '', style: {} }],
                    },
                },
                top.nextLoc + 1,
            ),
            {
                type: 'selection',
                doc: path.root.doc,
                selections: [
                    {
                        type: 'ir',
                        start: {
                            path: npath,
                            key: serializePath(npath),
                            cursor: {
                                type: 'text',
                                end: { index: 0, cursor: 0 },
                            },
                        },
                    },
                ],
            },
        );
        return true;
    }

    if (key === '"') {
        if (
            (norm.start == null || norm.start === norm.text.length) &&
            norm.end === norm.text.length
        ) {
            const path = sel.start.path;
            const top = store.getState().toplevels[path.root.toplevel];
            const nidx = top.nextLoc;

            const update = replaceNode(path, nidx, top);
            if (!update) return false;
            update.nodes = {
                ...update.nodes,
                [nidx]: {
                    type: 'string',
                    first: '',
                    tag: node.loc,
                    loc: nidx,
                    templates: [],
                },
            };
            update.nextLoc = nidx + 1;

            store.update(
                {
                    type: 'toplevel',
                    id: top.id,
                    action: { type: 'update', update },
                },
                selAction(
                    path,
                    toSelection({
                        cursor: {
                            type: 'text',
                            end: { index: 0, cursor: 0 },
                        },
                        path: pathWithChildren(parentPath(path), nidx),
                    }),
                ),
            );
            return true;
        }
    }

    return false;
};

export const handleNonTextUpdate = (
    key: string,
    sel: IRSelection,
    cache: IRCache2<unknown>,
    store: Store,
) => {
    if (key === 'BACKSPACE') {
        if (
            sel.start.cursor.type === 'side' &&
            sel.start.cursor.side === 'start'
        ) {
            if (joinLeft(sel.start.path, undefined, 0, cache, store)) {
                return true;
            }
        }
        return handleMovement('LEFT', sel.start.path.root.doc, cache, store);
    }

    if (
        key === '|' &&
        (sel.start.cursor.type !== 'side' || sel.start.cursor.side === 'end')
    ) {
        const path = sel.start.path;
        const top = store.getState().toplevels[path.root.toplevel];
        const pnode = top.nodes[parentLoc(path)];
        if (pnode.type === 'table') {
            const actions = addTableColumn(pnode, path, top.id, top.nextLoc);
            store.update(...actions);
            return true;
        }
    }

    if (key === ' ' || key === 'ENTER') {
        // If the next thing ... is like ... a sibling,
        // and it's an empty id, then just go to it
        // hrmmm does adding ...
        // TODO: if parent is a table, bail
        const path = sel.start.path;
        const top = store.getState().toplevels[path.root.toplevel];
        const pnode = top.nodes[parentLoc(path)];
        if (pnode && pnode.type === 'table') {
            const { row, col } = findTableLoc(pnode, lastChild(path));
            if (col < pnode.rows[row].length - 1) {
                // Just select the next thing
                const next = pnode.rows[row][col + 1];
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

        return newNeighbor(
            sel.start.path,
            store,
            [
                {
                    type: 'id',
                    text: '',
                    loc: true,
                },
            ],
            sel.start.cursor.type !== 'side' || sel.start.cursor.side === 'end',
        );
    }

    return false;
};

export const deleteMulti = (
    which: MultiSelect,
    state: PersistedState,
    leaveABlank = true,
): Action[] | void => {
    if (which.type === 'doc') return;
    if (which.children.length === 1) {
        return [
            topUpdate(which.parent.root.toplevel, {
                [which.children[0]]: {
                    type: 'id',
                    text: '',
                    loc: which.children[0],
                },
            }),
            {
                type: 'selection',
                doc: which.parent.root.doc,
                selections: [
                    toSelection({
                        cursor: {
                            type: 'text',
                            end: { index: 0, cursor: 0 },
                        },
                        path: pathWithChildren(which.parent, which.children[0]),
                    }),
                ],
            },
        ];
    } else {
        const ploc = lastChild(which.parent);
        const top = state.toplevels[which.parent.root.toplevel];
        const pnode = top.nodes[ploc];
        if (!pnode || !isCollection(pnode)) return;
        const idx = pnode.items.indexOf(which.children[0]);
        const items = pnode.items.filter(
            (loc) => !which.children.includes(loc),
        );
        if (!leaveABlank) {
            return [
                topUpdate(which.parent.root.toplevel, {
                    [ploc]: { ...pnode, items },
                }),
            ];
        }
        items.splice(idx, 0, top.nextLoc);
        return [
            topUpdate(
                which.parent.root.toplevel,
                {
                    [ploc]: {
                        ...pnode,
                        items,
                    },
                    [top.nextLoc]: {
                        type: 'id',
                        text: '',
                        loc: top.nextLoc,
                    },
                },
                top.nextLoc + 1,
            ),
            {
                type: 'selection',
                doc: which.parent.root.doc,
                selections: [
                    toSelection({
                        cursor: {
                            type: 'text',
                            end: { index: 0, cursor: 0 },
                        },
                        path: pathWithChildren(which.parent, top.nextLoc),
                    }),
                ],
            },
        ];
    }
};

export const handleMutliSelect = (
    store: Store,
    sel: IRSelection,
    end: NonNullable<IRSelection['end']>,
    key: string,
    ds: DocSession,
): boolean => {
    const state = store.getState();
    const multi = resolveMultiSelect(sel.start.path, end.path, state);
    if (!multi) return false;

    if (key === 'CTRL_C') {
        if (multi.type === 'doc') {
            const doc = state.documents[multi.doc];
            ds.clipboard = multi.children.map((nid) => {
                const top = state.toplevels[doc.nodes[nid].toplevel];
                return fromMap(() => false, top.root, top.nodes);
            });
        } else {
            const top = state.toplevels[multi.parent.root.toplevel];
            ds.clipboard = multi.children.map((nid) => {
                return fromMap(() => false, nid, top.nodes);
            });
        }
        return true;
    }

    if (key === '[' || key === '(' || key === '{') {
        if (multi.type === 'top') {
            // only work with empty?
            wrapNodesWith(key, multi.parent, multi.children, store);
        }
        return true;
    }

    if (key === 'CTRL_UP' || key === 'CTRL_DOWN') {
        if (multi.type !== 'top') {
            const actions = swapTop(
                sel.start,
                end.path,
                multi,
                state,
                key === 'CTRL_DOWN' ? 'down' : 'up',
            );
            if (!actions) return false;
            store.update(...actions);
            return true;
        }
        return false;
    }

    if (
        key === 'CTRL_LEFT' ||
        key === 'CTRL_RIGHT' ||
        key === 'CTRL_SHIFT_LEFT' ||
        key === 'CTRL_SHIFT_RIGHT'
    ) {
        const ups = swap(
            store.getState(),
            sel.start,
            end.path,
            key.endsWith('LEFT') ? 'left' : 'right',
            key.includes('SHIFT'),
        );
        if (!ups) return false;
        store.update(...ups);
        return true;
    }

    if (key === 'BACKSPACE') {
        const state = store.getState();
        if (multi.type === 'doc') return false;
        const ups = deleteMulti(multi, state);
        if (!ups) return false;
        store.update(...ups);
        return true;
    }

    return false;
};

function handleNamespaceUpdate(
    key: string,
    docId: string,
    sel: Extract<DocSelection, { type: 'namespace' }>,
    cache: IRCache2<unknown>,
    store: Store,
): boolean {
    if (key === 'LEFT') {
        const start = Math.max(0, sel.end - 1);
        store.update({
            type: 'selection',
            doc: docId,
            selections: [{ ...sel, start, end: start }],
        });
        return true;
    }
    const nid = sel.root.ids[sel.root.ids.length - 1];
    const node = store.getState().documents[docId].nodes[nid];
    const text = sel.text ?? splitGraphemes(node.namespace ?? '');

    if (key === 'RIGHT') {
        const start = Math.min(text.length, sel.end + 1);
        store.update({
            type: 'selection',
            doc: docId,
            selections: [{ ...sel, start, end: start }],
        });
        return true;
    }
    const updated = text.slice();
    let at = Math.min(Math.max(0, sel.end), text.length);

    if (key === 'BACKSPACE') {
        if (at === 0) return false;
        updated.splice(at - 1, 1);
        at--;
        key = '';
    }

    if (key === '/') {
        key = '⫽';
    }

    const parts = splitGraphemes(key);
    updated.splice(at, 0, ...parts);
    at += parts.length;

    store.update({
        type: 'selection',
        doc: docId,
        selections: [{ ...sel, start: at, end: at, text: updated }],
    });
    return true;
}
