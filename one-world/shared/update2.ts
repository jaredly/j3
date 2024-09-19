import { ensure } from '../client/newStore2';
import { Action, DocAction, ToplevelAction } from './action2';
import { Doc, PersistedState } from './state2';
import { Toplevel } from './toplevels';

export type Updated = {
    toplevels: Record<string, Record<number, true>>;
    selections: Record<string, true>;
};

export const update = (
    state: PersistedState,
    action: Action,
    updated: Updated,
): PersistedState => {
    switch (action.type) {
        case 'selection':
            return state; // ignoreee
        case 'drag':
            return state;
        case 'reset':
            return action.state;
        case 'multi':
            action.actions.forEach((action) => {
                state = update(state, action, updated);
            });
            return state;
        case 'doc': {
            const doc = updateDoc(state._documents[action.id], action.action);
            if (!doc) {
                state = { ...state };
                state._documents = { ...state._documents };
                delete state._documents[action.id];
                return state;
            }
            return {
                ...state,
                _documents: {
                    ...state._documents,
                    [action.id]: doc,
                },
            };
        }
        case 'toplevel': {
            const tl = updateTL(
                state.toplevels[action.id],
                action.action,
                ensure(updated.toplevels, action.id, () => ({})),
            );
            if (!tl) {
                state = { ...state };
                state.toplevels = { ...state.toplevels };
                delete state.toplevels[action.id];
                return state;
            }
            return {
                ...state,
                toplevels: {
                    ...state.toplevels,
                    [action.id]: tl,
                },
            };
        }
    }
    console.warn('skipping action', action.type);
    return state;
};

export const updateDoc = (
    doc: undefined | Doc,
    action: DocAction,
): Doc | null => {
    switch (action.type) {
        case 'reset':
            return action.doc;
        case 'delete':
            return null;
        case 'update':
            if (!doc) throw new Error('trying to update nonexistent toplevel');
            const nodes = { ...doc.nodes };
            Object.entries(action.update.nodes ?? {}).forEach(([k, v]) => {
                if (v === undefined) {
                    // ignore this, it'll probably get cleaned up?
                    delete nodes[+k];
                } else {
                    nodes[+k] = v;
                }
            });
            return { ...doc, ...action.update, nodes };
    }
};

export const updateTL = (
    tl: undefined | Toplevel,
    action: ToplevelAction,
    updated: Record<number, true>,
): Toplevel | null => {
    switch (action.type) {
        case 'reset':
            return action.toplevel;
        case 'delete':
            return null;
        case 'update':
            if (!tl) throw new Error('trying to update nonexistent toplevel');
            const nodes = { ...tl.nodes };
            Object.entries(action.update.nodes ?? {}).forEach(([k, v]) => {
                if (v === undefined) {
                    // ignore this, it'll probably get cleaned up?
                    delete nodes[+k];
                } else {
                    updated[+k] = true;
                    nodes[+k] = v;
                }
            });
            return { ...tl, ...action.update, nodes };
    }
};
