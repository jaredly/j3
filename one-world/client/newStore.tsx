import { PersistedState } from '../shared/state';
import { update } from '../shared/update';
import { Store } from './StoreContext';

type Evts = {
    tops: Record<
        string,
        {
            fns: (() => void)[];
            nodes: Record<number, (() => void)[]>;
        }
    >;
    docs: Record<
        string,
        {
            fns: (() => void)[];
            nodes: Record<number, (() => void)[]>;
        }
    >;
};

const blankEvts = (): Evts => ({ tops: {}, docs: {} });
const blankFns = (): Evts['docs'][''] => ({ fns: [], nodes: {} });

const ensure = <K extends string | number, A>(
    obj: Record<K, A>,
    k: K,
    n: () => A,
) => {
    if (!obj[k]) {
        obj[k] = n();
    }
};

const listen = (lst: (() => void)[], f: () => void) => {
    lst.push(f);
    return () => {
        const idx = lst.indexOf(f);
        if (idx !== -1) {
            lst.splice(idx, 1);
        }
    };
};

export const newStore = (state: PersistedState, ws: WebSocket): Store => {
    const evts = blankEvts();
    const store: Store = {
        getState() {
            return state;
        },
        update(action) {
            const prev = state;
            state = update(state, action);
            ws.send(
                JSON.stringify({
                    type: 'action',
                    action,
                }),
            );
            // todo notify
        },
        on(evt, f) {
            return () => {};
        },
        onTop(id, f) {
            ensure(evts.tops, id, blankFns);
            return listen(evts.tops[id].fns, f);
        },
        onTopNode(top, id, f) {
            ensure(evts.tops, top, blankFns);
            ensure(evts.tops[top].nodes, id, () => []);
            return listen(evts.tops[top].nodes[id], f);
        },
        onDoc(id, f) {
            ensure(evts.docs, id, blankFns);
            return listen(evts.docs[id].fns, f);
        },
        onDocNode(doc, id, f) {
            ensure(evts.docs, doc, blankFns);
            ensure(evts.docs[doc].nodes, id, () => []);
            return listen(evts.docs[doc].nodes[id], f);
        },
    };
    return store;
};
