import { splitGraphemes } from '../../../../src/parse/splitGraphemes';
import { BlockEntry } from '../../../shared/IR/block-to-text';
import { matchesSpan } from '../../../shared/IR/highlightSpan';
import { IRSelection } from '../../../shared/IR/intermediate';
import {
    goLeftRight,
    IRCache,
    lastChild,
    selectNode,
    toSelection,
} from '../../../shared/IR/nav';
import {
    childLocs,
    parentPath,
    Path,
    pathWithChildren,
    serializePath,
} from '../../../shared/nodes';
import { PersistedState } from '../../../shared/state2';
import { Toplevel } from '../../../shared/toplevels';
import { Store } from '../../StoreContext2';
import { isCollection } from '../../TextEdit/actions';
import { selectionFromLocation, selectionLocation } from '../selectionLocation';
import { selAction } from './joinLeft';

export const handleUpDown = (
    key: string,
    docId: string,
    cache: IRCache,
    store: Store,
    sourceMaps: BlockEntry[],
) => {
    const ds = store.getDocSession(docId, store.session);
    if (!ds.selections.length) return false;
    const sel = ds.selections[0];

    if (key === 'UP' || key === 'DOWN') {
        const result = selectionLocation(
            sourceMaps,
            sel.start.path,
            sel.start.cursor,
        );
        if (!result) return false;
        let [x, y] = result.pos;
        let up;
        for (let i = 0; i < 20; i++) {
            y += key === 'UP' ? -1 : 1;
            up = sourceMaps.find((m) => matchesSpan(x, y, m.shape));
            if (up) break;
        }
        if (!up) return false;
        // const top = up.source.top;
        // const ids = cache[top].paths[up.source.loc];
        // if (!ids) return false;
        const path: Path = up.source.path;
        // {
        //     root: cache[top].root,
        //     children: ids.concat([up.source.loc]),
        // };
        const cursor = selectionFromLocation(up, { x, y });
        store.update({
            type: 'selection',
            doc: docId,
            selections: [toSelection({ cursor, path })],
        });
        return true;
    }
};

const firstLastChild = (
    path: Path,
    nodes: Toplevel['nodes'],
    which: 'first' | 'last',
): Path => {
    const loc = lastChild(path);
    const node = nodes[loc];
    if (isCollection(node) && node.items.length) {
        return firstLastChild(
            pathWithChildren(
                path,
                node.items[which === 'first' ? 0 : node.items.length - 1],
            ),
            nodes,
            which,
        );
    }
    return path;
};

const adjacent = (
    path: Path,
    state: PersistedState,
    side: 'left' | 'right',
): Path | void => {
    const top = state.toplevels[path.root.toplevel];
    for (let i = path.children.length - 2; i >= 0; i--) {
        const parent = top.nodes[path.children[i]];
        if (!isCollection(parent)) continue;
        const items = parent.items.slice();
        const idx = items.indexOf(path.children[i + 1]);
        if (side === 'left' ? idx === 0 : idx === items.length - 1) continue;
        const loc = items[idx + (side === 'left' ? -1 : 1)];
        return firstLastChild(
            {
                root: path.root,
                children: path.children.slice(0, i + 1).concat([loc]),
            },
            top.nodes,
            side === 'left' ? 'last' : 'first',
        );
    }

    if (path.root.ids.length > 1) {
        const doc = state.documents[path.root.doc];
        if (side === 'right') {
            const last = path.root.ids[path.root.ids.length - 1];
            const node = doc.nodes[last];
            if (node.children.length) {
                const child = doc.nodes[node.children[0]];
                return {
                    root: {
                        type: 'doc-node',
                        doc: doc.id,
                        ids: path.root.ids.concat([child.id]),
                        toplevel: child.toplevel,
                    },
                    children: [state.toplevels[child.toplevel].root],
                };
            }
        }

        for (let i = path.root.ids.length - 2; i >= 0; i--) {
            const parent = doc.nodes[path.root.ids[i]];
            const idx = parent.children.indexOf(path.root.ids[i + 1]);
            if (side === 'left') {
                if (idx === 0) {
                    // const self = doc.nodes[path.root.ids[i + 1]];
                    const top = state.toplevels[parent.toplevel];
                    if (!top) return;
                    // select the toplevel
                    return firstLastChild(
                        {
                            root: {
                                doc: doc.id,
                                toplevel: parent.toplevel,
                                type: 'doc-node',
                                ids: path.root.ids.slice(0, i + 1),
                            },
                            children: [top.root],
                        },
                        top.nodes,
                        'last',
                    );
                }
            } else if (idx === parent.children.length - 1) {
                continue;
            }
            const loc = parent.children[idx + (side === 'left' ? -1 : 1)];
            let sib = doc.nodes[loc];
            if (!sib)
                throw new Error(
                    `badloc maybe idx (${idx}) loc (${loc}) children: ${parent.children}`,
                );
            if (side === 'right') {
                const top = state.toplevels[sib.toplevel];
                return firstLastChild(
                    {
                        root: {
                            doc: doc.id,
                            toplevel: sib.toplevel,
                            type: 'doc-node',
                            ids: path.root.ids.slice(0, i + 1).concat([sib.id]),
                        },
                        children: [top.root],
                    },
                    top.nodes,
                    'first',
                );
            } else {
                const ids = path.root.ids.slice(0, i + 1).concat([sib.id]);
                while (sib.children.length) {
                    sib = doc.nodes[sib.children[sib.children.length - 1]];
                    ids.push(sib.id);
                }
                const top = state.toplevels[sib.toplevel];
                return firstLastChild(
                    {
                        root: {
                            doc: doc.id,
                            toplevel: sib.toplevel,
                            type: 'doc-node',
                            ids,
                        },
                        children: [top.root],
                    },
                    top.nodes,
                    'last',
                );
            }
        }
    }
};

export const handleClose = (
    key: string,
    docId: string,
    cache: IRCache,
    store: Store,
): boolean => {
    const ds = store.getDocSession(docId, store.session);
    if (!ds.selections.length) return false;
    const sel = ds.selections[0];

    if (sel.end) return false;
    if (sel.start.cursor.type === 'text' && sel.start.cursor.start)
        return false;

    const top = store.getState().toplevels[sel.start.path.root.toplevel];

    switch (key) {
        case '}': {
            const loc = lastChild(sel.start.path);
            const parent = parentPath(sel.start.path);
            const node = top.nodes[lastChild(parent)];
            if (node.type === 'string') {
                const idx = node.templates.findIndex((t) => t.expr === loc);
                if (idx !== -1) {
                    store.update(
                        selAction(
                            parent,
                            toSelection({
                                cursor: {
                                    type: 'text',
                                    end: { cursor: 0, index: idx + 1 },
                                },
                                path: parent,
                            }),
                        ),
                    );
                    return true;
                }
            }
        }
        case ']':
        case ')':
            let parent = parentPath(sel.start.path);
            while (parent.children.length) {
                const node = top.nodes[lastChild(parent)];
                if (
                    (node.type === 'array' && key === ']') ||
                    (key === ')' && node.type === 'list') ||
                    (key === '}' && node.type === 'record')
                ) {
                    store.update(
                        selAction(
                            parent,
                            selectNode(parent, 'end', cache[top.id].irs),
                        ),
                    );
                    return true;
                }
                parent = parentPath(parent);
            }
            return false;
        case '"': {
            if (sel.start.cursor.type === 'text') {
                const loc = lastChild(sel.start.path);
                const node = top.nodes[lastChild(sel.start.path)];
                if (
                    node.type === 'string' &&
                    sel.start.cursor.end.index === node.templates.length
                ) {
                    const text = node.templates.length
                        ? node.templates[node.templates.length - 1].suffix
                        : node.first;
                    if (
                        sel.start.cursor.end.cursor ===
                        splitGraphemes(text).length
                    ) {
                        store.update(
                            selAction(
                                sel.start.path,
                                toSelection({
                                    cursor: { type: 'side', side: 'end' },
                                    path: sel.start.path,
                                }),
                            ),
                        );

                        return true;
                    }
                }
            }
        }
    }
    return false;
};

export const handleMovement = (
    key: string,
    docId: string,
    cache: IRCache,
    store: Store,
): boolean => {
    const ds = store.getDocSession(docId, store.session);
    if (!ds.selections.length) return false;
    const sel = ds.selections[0];

    if (handleClose(key, docId, cache, store)) {
        return true;
    }

    if (key === 'TAB' || key === 'SHIFT_TAB') {
        const next = adjacent(
            sel.start.path,
            store.getState(),
            key === 'TAB' ? 'right' : 'left',
        );
        if (!next) return false;
        const selection = selectNode(
            next,
            key === 'TAB' ? 'end' : 'start',
            cache[next.root.toplevel].irs,
        );
        selection.end = {
            path: selection.start.path,
            key: selection.start.key,
        };
        store.update({
            type: 'selection',
            doc: docId,
            selections: [selection],
        });
        return true;
    }

    if (key === 'SHIFT_UP') {
        const path = sel.end ? parentPath(sel.end.path) : sel.start.path;
        if (!path.children.length) return false;
        store.update({
            type: 'selection',
            doc: docId,
            selections: [
                {
                    start: sel.start,
                    end: { path, key: serializePath(path) },
                },
            ],
        });
        return true;
    }

    if (key === 'SHIFT_DOWN') {
        const sel = ds.selections[0];
        if (!sel.end) return false;

        const slen = sel.start.path.children.length;
        const elen = sel.end.path.children.length;
        // if (slen <= elen)

        const path: Path | null =
            slen <= elen
                ? null
                : {
                      ...sel.start.path,
                      children: sel.start.path.children.slice(0, elen + 1),
                  };

        // const path = sel.end ? parentPath(sel.end.path) : sel.start.path;
        // if (!path.children.length) return false;
        store.update({
            type: 'selection',
            doc: docId,
            selections: [
                {
                    start: sel.start,
                    end: path ? { path, key: serializePath(path) } : undefined,
                },
            ],
        });
        return true;
    }

    if (key === 'RIGHT' || key === 'SHIFT_RIGHT') {
        const sel = ds.selections[0];

        // here we go for real for real
        if (key === 'SHIFT_RIGHT' && sel.end) {
            const path = sel.end.path;
            if (path.children.length > 1) {
                const next = getAdjacent(
                    sel.start,
                    path,
                    store.getState(),
                    'right',
                );
                if (!next) return true;
                store.update({
                    type: 'selection',
                    doc: docId,
                    selections: [next],
                });
            }

            return true;
        }

        const next = goLeftRight(
            sel,
            cache,
            false,
            key === 'SHIFT_RIGHT',
            store.getState(),
        );
        if (next) {
            store.update({
                type: 'selection',
                doc: docId,
                selections: [next],
            });
            return true;
        }
    }

    if (key === 'LEFT' || key === 'SHIFT_LEFT') {
        const sel = ds.selections[0];

        // here we go for real for real
        if (key === 'SHIFT_LEFT' && sel.end) {
            const path = sel.end.path;
            if (path.children.length > 1) {
                const next = getAdjacent(
                    sel.start,
                    path,
                    store.getState(),
                    'left',
                );
                if (!next) return true;
                store.update({
                    type: 'selection',
                    doc: docId,
                    selections: [next],
                });
            }

            return true;
        }

        const next = goLeftRight(
            sel,
            cache,
            true,
            key === 'SHIFT_LEFT',
            store.getState(),
        );
        if (next) {
            store.update({
                type: 'selection',
                doc: docId,
                selections: [next],
            });
            return true;
        }
    }
    return false;
};

const getAdjacent = (
    start: IRSelection['start'],
    path: Path,
    state: PersistedState,
    dir: 'right' | 'left',
): IRSelection | null => {
    const ploc = path.children[path.children.length - 2];
    const top = state.toplevels[path.root.toplevel];
    const items = childLocs(top.nodes[ploc]);
    const at = items.indexOf(lastChild(path));
    if (at === -1) return null;
    const next =
        at === (dir === 'right' ? items.length - 1 : 0)
            ? parentPath(path)
            : pathWithChildren(
                  parentPath(path),
                  items[at + (dir === 'right' ? 1 : -1)],
              );
    return { start, end: { path: next, key: serializePath(next) } };
};
