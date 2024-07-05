import { Action, DocAction, ToplevelAction } from './action';
import { Document, PersistedState } from './state';
import { Toplevel } from './toplevels';

export const update = (
    state: PersistedState,
    action: Action,
): PersistedState => {
    switch (action.type) {
        case 'reset':
            return action.state;
        case 'multi':
            action.actions.forEach((action) => {
                state = update(state, action);
            });
            return state;
        case 'doc': {
            const doc = updateDoc(state.documents[action.id], action.action);
            if (!doc) {
                state = { ...state };
                state.documents = { ...state.documents };
                delete state.documents[action.id];
                return state;
            }
            return {
                ...state,
                documents: {
                    ...state.documents,
                    [action.id]: doc,
                },
            };
        }
        case 'toplevel': {
            const tl = updateTL(state.toplevels[action.id], action.action);
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
    doc: undefined | Document,
    action: DocAction,
): Document | null => {
    switch (action.type) {
        case 'reset':
            return action.doc;
        case 'delete':
            return null;
    }
};

export const updateTL = (
    tl: undefined | Toplevel,
    action: ToplevelAction,
): Toplevel | null => {
    switch (action.type) {
        case 'reset':
            return action.toplevel;
        case 'delete':
            return null;
        case 'update':
            if (!tl) throw new Error('trying to update nonexistent toplevel');
            return { ...tl, ...action.update };
        case 'nodes':
            if (!tl) throw new Error('trying to update nonexistent toplevel');
            const nodes = { ...tl.nodes };
            Object.entries(action.nodes).forEach(([key, value]) => {
                if (!value) delete nodes[+key];
                else nodes[+key] = value;
            });
            return { ...tl, nodes };
    }
};
