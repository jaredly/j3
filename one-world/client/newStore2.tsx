import { AnyEvaluator } from '../evaluators/boot-ex/types';
import { Action } from '../shared/action2';
import {
    IRCursor,
    IRSelection,
    updateNodeText,
} from '../shared/IR/intermediate';
import { lastChild } from '../shared/IR/nav';
import { Path, serializePath } from '../shared/nodes';
import { DocSession, PersistedState } from '../shared/state2';
import { update, Updated } from '../shared/update2';
import { getAutoComplete } from './cli/getAutoComplete';
import { RState } from './cli/render';
import { listen } from './listen';
import { Store } from './StoreContext2';

type Evts = {
    general: {
        selection: ((autocomplete?: boolean) => void)[];
        all: (() => void)[];
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
    general: { selection: [], all: [] },
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

const selPathKeys = (sel: IRSelection) => {
    return sel.end ? [sel.start.key, sel.end.key] : [sel.start.key];
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
            (s) =>
                s.type === 'ir' && !s.end && s.start.key === dragState!.pathKey,
        );

        const range = new Range();
        // const sel = getNewSelection(
        //     matching && !matching?.end
        //         ? { start: matching.start, sel: matching.cursor }
        //         : null,
        //     dragState.node,
        //     { x: evt.clientX, y: evt.clientY },
        //     true,
        //     range,
        // );
        // if (!sel) return;
        // store.update({
        //     type: 'in-session',
        //     action: { type: 'multi', actions: [] },
        //     doc: dragState.path.root.doc,
        //     selections: [
        //         {
        //             type: 'id',
        //             cursor: sel.sel,
        //             start: sel.start,
        //             path: dragState.path,
        //             pathKey: dragState.pathKey,
        //             text: matching?.type === 'id' ? matching.text : undefined,
        //         },
        //     ],
        // });
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

export function recalcDropdown(
    store: Store,
    docId: string,
    rstate: RState,
    ev: AnyEvaluator,
) {
    const ds = store.getDocSession(docId);
    if (!ds.dropdown || ds.dropdown.dismissed) {
        const auto = getAutoComplete(store, rstate, ds, ev);
        if (auto?.length) {
            ds.dropdown = { selection: [0] };
        } else {
            ds.dropdown = undefined;
        }
    }
}

export const newStore = (
    state: PersistedState,
    ws: WebSocket,
    session: string,
): Store => {
    const evts = blankEvts();
    // @ts-ignore
    // window.state = state;
    const docSessionCache: { [id: string]: DocSession } = {};
    // @ts-ignore
    // window.docSessions = docSessionCache;

    const store: Store = {
        session,
        getDocSession(doc: string, session: string = store.session) {
            const id = `${doc} - ${session}`;
            if (!docSessionCache[id]) {
                if (localStorage['doc:ss:' + id]) {
                    docSessionCache[id] = JSON.parse(
                        localStorage['doc:ss:' + id],
                    );
                    if (!docSessionCache[id].clipboard) {
                        docSessionCache[id].clipboard = [];
                    }
                } else {
                    docSessionCache[id] = {
                        doc,
                        history: [],
                        activeStage: null,
                        selections: [],
                        clipboard: [],
                    };
                }
            }
            return docSessionCache[id];
        },
        getState() {
            return state;
        },
        update(...actions) {
            // console.log('store updat', action);
            const updated: Updated = { toplevels: {}, selections: {} };

            const extras: Action[] = [];

            actions.forEach((action) => {
                if (action.type === 'drag') {
                    const ds = store.getDocSession(action.doc);
                    ds.dragState = action.drag;
                    evts.general.selection.forEach((f) => f());
                }

                if (action.type === 'selection') {
                    const key = `${action.doc} - ${session}`;
                    const prev = docSessionCache[key].selections;
                    docSessionCache[key].selections = action.selections;
                    docSessionCache[key].verticalLodeStone =
                        action.verticalLodeStone;
                    const seen: Record<string, IRSelection> = {};
                    action.selections.forEach((sel) => {
                        if (sel.type !== 'ir') return;
                        selPathKeys(sel).forEach((k) => {
                            const id = `${session}#${k}`;
                            seen[id] = sel;
                            updated.selections[id] = true;
                        });
                    });

                    prev.forEach((psel) => {
                        if (psel.type !== 'ir') {
                            // If you don't manually "commit" a namespace change,
                            // we just reset it.
                            return;
                        }
                        selPathKeys(psel).forEach((k) => {
                            const id = `${session}#${k}`;
                            updated.selections[id] = true;
                            if (
                                psel.start.cursor.type === 'text' &&
                                psel.start.cursor.end.text
                            ) {
                                const cur = seen[id];
                                if (
                                    !cur ||
                                    cur.start.cursor.type !== 'text' ||
                                    cur.start.cursor.end.index !==
                                        psel.start.cursor.end.index
                                ) {
                                    // Only commit if we haven't done an update on that node in this call
                                    // to .update
                                    if (
                                        !updated.toplevels[
                                            psel.start.path.root.toplevel
                                        ]?.[lastChild(psel.start.path)]
                                    ) {
                                        maybeCommitTextChange(
                                            psel.start.cursor,
                                            psel.start.path,
                                            state,
                                            extras,
                                        );
                                    }
                                }
                            }
                        });
                    });

                    evts.general.selection.forEach((f) =>
                        f(action.autocomplete),
                    );

                    if (!action.autocomplete) {
                        docSessionCache[key].dropdown = undefined;
                    }
                }

                state = update(state, action, updated);
                // @ts-ignore
                window.state = state;
                ws.send(JSON.stringify({ type: 'action', action }));
            });

            extras.forEach((action) => {
                state = update(state, action, updated);
                // @ts-ignore
                window.state = state;
                ws.send(JSON.stringify({ type: 'action', action }));
            });

            evts.general.all.forEach((f) => f());

            sendUpdates(updated, evts);
        },
        on(evt, f) {
            switch (evt) {
                case 'all':
                    return listen(evts.general.all, f);
                case 'selection':
                    return listen(evts.general.selection, f);
            }
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
    sel: Extract<IRCursor, { type: 'text' }>,
    path: Path,
    state: PersistedState,
    extras: Action[],
) {
    const last = path.children[path.children.length - 1];
    const node = state.toplevels[path.root.toplevel]?.nodes[last];

    if (!sel.end.text || !node) return;
    const updated = updateNodeText(node, sel.end.index, sel.end.text.join(''));
    if (!updated) {
        return;
    }

    extras.push({
        type: 'toplevel',
        id: path.root.toplevel,
        action: {
            type: 'update',
            update: { nodes: { [node.loc]: updated } },
        },
    });
}
