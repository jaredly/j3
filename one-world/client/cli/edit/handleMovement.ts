import { goLeftRight, IRCache } from '../../../shared/IR/nav';
import { Store } from '../../StoreContext2';

export const handleMovement = (
    key: string,
    docId: string,
    cache: IRCache,
    store: Store,
): boolean => {
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
