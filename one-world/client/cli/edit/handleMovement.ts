import { goLeftRight, IRCache } from '../../../shared/IR/nav';
import { parentPath, Path, serializePath } from '../../../shared/nodes';
import { Store } from '../../StoreContext2';

export const handleMovement = (
    key: string,
    docId: string,
    cache: IRCache,
    store: Store,
): boolean => {
    if (key === 'SHIFT_UP') {
        const ds = store.getDocSession(docId, store.session);
        if (ds.selections.length) {
            const sel = ds.selections[0];
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
    }

    if (key === 'SHIFT_DOWN') {
        const ds = store.getDocSession(docId, store.session);
        if (ds.selections.length) {
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
                        end: path
                            ? { path, key: serializePath(path) }
                            : undefined,
                    },
                ],
            });
            return true;
        }
    }

    if (key === 'RIGHT' || key === 'SHIFT_RIGHT') {
        const ds = store.getDocSession(docId, store.session);
        if (ds.selections.length) {
            const sel = ds.selections[0];
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
    }

    if (key === 'LEFT' || key === 'SHIFT_LEFT') {
        const ds = store.getDocSession(docId, store.session);
        if (ds.selections.length) {
            const sel = ds.selections[0];
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
    }
    return false;
};
