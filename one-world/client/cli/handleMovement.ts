import { goLeftRight, IRCache } from '../../shared/IR/nav';
import { Store } from '../StoreContext2';

export const handleMovement = (
    key: string,
    docId: string,
    cache: IRCache,
    store: Store,
): boolean => {
    if (key === 'RIGHT') {
        const ds = store.getDocSession(docId, store.session);
        if (ds.selections.length) {
            const sel = ds.selections[0];
            const next = goLeftRight(sel, cache, false);
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

    if (key === 'LEFT') {
        const ds = store.getDocSession(docId, store.session);
        if (ds.selections.length) {
            const sel = ds.selections[0];
            const next = goLeftRight(sel, cache, true);
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
