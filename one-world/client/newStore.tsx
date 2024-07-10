import { serializePath } from '../shared/nodes';
import { DocSession, NodeSelection, PersistedState } from '../shared/state';
import { update } from '../shared/update';
import { listen } from './listen';
import { Store } from './StoreContext';

type Evts = {
    selections: Record<string, (() => void)[]>;
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

const blankEvts = (): Evts => ({ tops: {}, docs: {}, selections: {} });
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

const selPathKeys = (sel: NodeSelection) => {
    switch (sel.type) {
        case 'multi':
            return sel.start
                ? [sel.cursor.pathKey, sel.start.pathKey]
                : [sel.cursor.pathKey];
        case 'within':
        case 'without':
            return [sel.pathKey];
    }
};

export const newStore = (
    state: PersistedState,
    ws: WebSocket,
    session: string,
): Store => {
    const evts = blankEvts();
    // @ts-ignore
    window.state = state;
    const docSessionCache: { [id: string]: DocSession } = {};
    const store: Store = {
        session,
        getDocSession(doc: string, session: string) {
            const id = `${doc} - ${session}`;
            if (!docSessionCache[id]) {
                if (localStorage['doc:ss:' + id]) {
                    docSessionCache[id] = JSON.parse(
                        localStorage['doc:ss:' + id],
                    );
                } else {
                    docSessionCache[id] = {
                        doc,
                        history: [],
                        activeStage: null,
                        selections: [],
                    };
                }
            }
            return docSessionCache[id];
        },
        getState() {
            return state;
        },
        update(action) {
            if (action.type === 'in-session') {
                if (action.selections) {
                    const key = `${action.doc} - ${session}`;
                    const prev = docSessionCache[key].selections;
                    docSessionCache[key].selections = action.selections;
                    const seen: Record<string, true> = {};
                    action.selections.forEach((sel) => {
                        selPathKeys(sel).forEach((k) => {
                            const id = `${session}#${k}`;
                            seen[id] = true;
                            evts.selections[id]?.forEach((f) => f());
                        });
                    });
                    prev.forEach((sel) => {
                        selPathKeys(sel).forEach((k) => {
                            const id = `${session}#${k}`;
                            if (!seen[k]) {
                                evts.selections[id]?.forEach((f) => f());
                            }
                        });
                    });
                }
            }

            // const prev = state;
            console.log('update ation', action);
            state = update(state, action);
            // @ts-ignore
            window.state = state;
            ws.send(
                JSON.stringify({
                    type: 'action',
                    action,
                }),
            );
            if (action.type === 'toplevel') {
                if (action.action.type === 'update') {
                    if (action.action.update.nodes) {
                        Object.keys(action.action.update.nodes).forEach(
                            (loc) => {
                                evts.tops[action.id]?.nodes[+loc]?.forEach(
                                    (f) => f(),
                                );
                            },
                        );
                    }
                    evts.tops[action.id]?.fns.forEach((f) => f());
                }
            }
            // todo notify more
        },
        on(evt, f) {
            return () => {};
        },
        onSelection(session, path, f) {
            const id = `${session}#${serializePath(path)}`;
            ensure(evts.selections, id, () => []);
            return listen(evts.selections[id], f);
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
