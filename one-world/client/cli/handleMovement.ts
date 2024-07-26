import termkit from 'terminal-kit';
import { BlockEntry } from '../../shared/IR/block-to-text';
import { goLeftRight, IRCache } from '../../shared/IR/nav';
import { Store } from '../StoreContext2';
import { renderSelection } from './render';

export const handleMovement = (
    term: termkit.Terminal,
    key: string,
    docId: string,
    cache: IRCache,
    sourceMaps: BlockEntry[],
    store: Store,
): boolean => {
    if (key === 'RIGHT') {
        const ds = store.getDocSession(docId, store.session);
        if (ds.selections.length) {
            const sel = ds.selections[0];
            const next = goLeftRight(sel, cache, false);
            if (next) {
                store.update({
                    type: 'in-session',
                    action: { type: 'multi', actions: [] },
                    doc: docId,
                    selections: [next],
                });
                renderSelection(term, store, docId, sourceMaps);
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
                    type: 'in-session',
                    action: { type: 'multi', actions: [] },
                    doc: docId,
                    selections: [next],
                });
                renderSelection(term, store, docId, sourceMaps);
                return true;
            }
        }
    }
    return false;
};
