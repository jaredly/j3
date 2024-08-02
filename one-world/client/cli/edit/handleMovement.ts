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
        const top = up.source.top;
        const path: Path = {
            root: cache[top].root,
            children: cache[top].paths[up.source.loc].concat([up.source.loc]),
        };
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
) => {
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
        const node = top.nodes[loc];
        return firstLastChild(
            {
                root: path.root,
                children: path.children.slice(0, i + 1).concat([loc]),
            },
            top.nodes,
            side === 'left' ? 'last' : 'first',
        );
    }
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

        const next = goLeftRight(sel, cache, false, key === 'SHIFT_RIGHT');
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

        const next = goLeftRight(sel, cache, true, key === 'SHIFT_LEFT');
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
