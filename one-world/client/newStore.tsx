import { Action } from '../shared/action';
import { Path, serializePath } from '../shared/nodes';
import { DocSession, NodeSelection, PersistedState } from '../shared/state';
import { update, Updated } from '../shared/update';
import { listen } from './listen';
import { Store } from './StoreContext';
import { getNewSelection } from './TextEdit/getNewSelection';

type Evts = {
    general: {
        selection: (() => void)[];
    };
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

const blankEvts = (): Evts => ({
    tops: {},
    docs: {},
    selections: {},
    general: { selection: [] },
});
const blankFns = (): Evts['docs'][''] => ({ fns: [], nodes: {} });

export const ensure = <K extends string | number, A>(
    obj: Record<K, A>,
    k: K,
    n: () => A,
) => {
    if (!obj[k]) {
        obj[k] = n();
    }
    return obj[k];
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

const setupDragger = (store: Store) => {
    let dragState = null as null | {
        pathKey: string;
        path: Path;
        node: HTMLElement;
    };
    const textRefs: Record<
        string,
        { path: Path; current: null | HTMLElement }
    > = {};

    const mouseUp = () => {
        document.removeEventListener('mouseup', mouseUp);
        document.removeEventListener('mousemove', mouseMove);
    };

    const mouseMove = (evt: MouseEvent) => {
        if (!dragState) return;

        const sels = store.getDocSession(
            dragState.path.root.doc,
            store.session,
        ).selections;
        const matching = sels.find(
            (s) => s.type === 'within' && s.pathKey === dragState!.pathKey,
        );

        const range = new Range();
        const sel = getNewSelection(
            matching?.type === 'within'
                ? { start: matching.start, sel: matching.cursor }
                : null,
            dragState.node,
            { x: evt.clientX, y: evt.clientY },
            true,
            range,
        );
        if (!sel) return;
        store.update({
            type: 'in-session',
            action: { type: 'multi', actions: [] },
            doc: dragState.path.root.doc,
            selections: [
                {
                    type: 'within',
                    cursor: sel.sel,
                    start: sel.start,
                    path: dragState.path,
                    pathKey: dragState.pathKey,
                    text:
                        matching?.type === 'within' ? matching.text : undefined,
                },
            ],
        });
    };

    const startDrag = (pathKey: string, path: Path) => {
        if (!textRefs[pathKey]) {
            console.warn('No registered', textRefs);
            return;
        }
        if (!textRefs[pathKey].current) {
            console.warn('no what');
        }
        document.addEventListener('mouseup', mouseUp);
        document.addEventListener('mousemove', mouseMove);
        dragState = { pathKey, path, node: textRefs[pathKey].current! };
    };

    return { textRefs, startDrag };
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
    // @ts-ignore
    window.docSessions = docSessionCache;

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
            // console.log('store updat', action);
            const updated: Updated = { toplevels: {}, selections: {} };

            if (action.type === 'in-session') {
                if (action.selections) {
                    const extras: Action[] = [];

                    const key = `${action.doc} - ${session}`;
                    const prev = docSessionCache[key].selections;
                    docSessionCache[key].selections = action.selections;
                    const seen: Record<string, NodeSelection> = {};
                    action.selections.forEach((sel) => {
                        selPathKeys(sel).forEach((k) => {
                            const id = `${session}#${k}`;
                            seen[id] = sel;
                            updated.selections[id] = true;
                        });
                    });

                    prev.forEach((sel) => {
                        selPathKeys(sel).forEach((k) => {
                            const id = `${session}#${k}`;
                            updated.selections[id] = true;
                            if (
                                sel.type === 'within' &&
                                sel.text &&
                                (!seen[id] || seen[id].type !== 'within')
                            ) {
                                maybeCommitTextChange(sel, state, extras);
                            }
                        });
                    });

                    if (extras.length) {
                        action.action = {
                            type: 'multi',
                            actions: [...extras, action.action],
                        };
                    }

                    evts.general.selection.forEach((f) => f());
                }
            }

            // const prev = state;
            // console.log('update ation', action);
            state = update(state, action, updated);
            // @ts-ignore
            window.state = state;

            // console.warn('disabled persistence');
            ws.send(JSON.stringify({ type: 'action', action }));

            sendUpdates(updated, evts);
        },
        on(evt, f) {
            return listen(evts.general.selection, f);
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

        // Drag stuff
        textRef(path, pathKey) {
            if (!dragger.textRefs[pathKey]) {
                dragger.textRefs[pathKey] = { current: null, path };
            }
            return dragger.textRefs[pathKey];
        },
        startDrag(pathKey, path) {
            dragger.startDrag(pathKey, path);
        },
    };

    const dragger = setupDragger(store);

    return store;
};

function sendUpdates(updated: Updated, evts: Evts) {
    Object.entries(updated.toplevels).forEach(([top, nodes]) => {
        Object.keys(nodes).forEach((k) => {
            evts.tops[top]?.nodes[+k]?.forEach((f) => f());
        });
        evts.tops[top]?.fns.forEach((f) => f());
    });

    Object.keys(updated.selections).forEach((id) =>
        evts.selections[id]?.forEach((f) => f()),
    );
}

function maybeCommitTextChange(
    sel: Extract<NodeSelection, { type: 'within' }>,
    state: PersistedState,
    extras: Action[],
) {
    const last = sel.path.children[sel.path.children.length - 1];
    const node = state.toplevels[sel.path.root.toplevel].nodes[last];
    if (node.type !== 'id') {
        return;
    }
    const text = sel.text!.join('');
    if (text === node.text) return;

    extras.push({
        type: 'toplevel',
        id: sel.path.root.toplevel,
        action: {
            type: 'update',
            update: {
                nodes: { [node.loc]: { ...node, text: sel.text!.join('') } },
            },
        },
    });
}
