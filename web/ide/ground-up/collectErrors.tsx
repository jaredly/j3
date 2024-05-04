import { useResults } from '../../custom/store/StoreCtx';
import { Store } from '../../custom/store/Store';

export function collectErrors(store: Store) {
    const results = useResults(store);
    const state = store.getState();
    const found: { loc: number; errs: string[] }[] = [];
    Object.values(results.results.nodes).forEach((node) => {
        if (node.parsed?.type === 'failure') {
            Object.entries(node.parsed.errors).forEach(([loc, errs]) => {
                found.push({ loc: +loc, errs });
            });
        }
    });
    Object.entries(results.workerResults.nodes).forEach(([key, send]) => {
        Object.entries(send.errors).forEach(([loc, errs]) => {
            found.push({ loc: +loc, errs });
        });
        send.produce.forEach((item) => {
            if (typeof item === 'string') return;
            if (!item) return;
            if (
                item.type === 'error' ||
                item.type === 'withjs' ||
                item.type === 'eval'
            ) {
                found.push({
                    loc: state.nsMap[+key]?.top,
                    errs: [item.message],
                });
            }
        });
    });
    return found;
}
