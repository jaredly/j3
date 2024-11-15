import { ensure } from '../client/newStore2';
import { Action, ToplevelAction } from './action2';
import { HistoryItem, PersistedState } from './state2';
import { Toplevel } from './toplevels';

export type Updated = {
    toplevels: Record<string, Record<number, true>>;
    selections: Record<string, true>;
    doc?: boolean;
};

export const reverseChanges = (
    changes: HistoryItem['changes'],
): HistoryItem['changes'] => {
    const res: HistoryItem['changes'] = {
        prevSelections: changes.selections,
        selections: changes.prevSelections,
        nodes: changes.prevNodes,
        prevNodes: changes.nodes,
        toplevels: changes.prevToplevels,
        prevToplevels: changes.toplevels,
    };

    return res;
};

export const applyChanges = (
    state: PersistedState,
    changes: HistoryItem['changes'],
) => {
    if (changes.nodes || changes.prevNodes) {
        const nodes = { ...state.nodes };
        if (changes.nodes) {
            Object.keys(changes.nodes).forEach((key) => {
                nodes[+key] = changes.nodes![+key];
            });
        }
        if (changes.prevNodes) {
            Object.keys(changes.prevNodes).forEach((key) => {
                if (!changes.nodes || !changes.nodes[+key]) {
                    delete nodes[+key];
                }
            });
        }
        state = { ...state, nodes };
    }
    if (changes.toplevels || changes.prevToplevels) {
        const toplevels = { ...state.toplevels };
        if (changes.toplevels) {
            Object.keys(changes.toplevels).forEach((key) => {
                toplevels[key] = changes.toplevels![key];
            });
        }
        if (changes.prevToplevels) {
            Object.keys(changes.prevToplevels).forEach((key) => {
                if (!changes.toplevels || !changes.toplevels[key]) {
                    delete toplevels[key];
                }
            });
        }
        state = { ...state, toplevels };
    }
    return state;
};

export const update = (
    state: PersistedState,
    action: Action,
    updated: Updated,
    changes: HistoryItem['changes'],
): PersistedState => {
    switch (action.type) {
        case 'selection':
            return state; // ignoreee
        case 'drag':
            return state;
        case 'reset':
            return action.state;
        // case 'undo': {
        //     const last = state.history[state.history.length - 1];
        //     if (!last) return state;
        //     // TODO: multiple
        //     const rev = reverseChanges(last.changes);
        //     return applyChanges(state, rev);
        // }
        case 'multi':
            action.actions.forEach((action) => {
                state = update(state, action, updated, changes);
            });
            return state;
        case 'doc': {
            const nodes = { ...state.nodes };
            Object.entries(action.action.update.nodes ?? {}).forEach(
                ([k, v]) => {
                    if (v === undefined) {
                        delete nodes[+k];
                    } else {
                        nodes[+k] = v;
                    }
                    updated.doc = true;
                },
            );
            return { ...state, ...action.action.update, nodes };
        }
        case 'toplevel': {
            const tl = updateTL(
                state.toplevels[action.id],
                action.action,
                ensure(updated.toplevels, action.id, () => ({})),
                changes,
            );
            state = { ...state, toplevels: { ...state.toplevels } };
            if (!tl) {
                delete state.toplevels[action.id];
            } else {
                state.toplevels[action.id] = tl;
            }
            return state;
        }
    }
    console.warn('skipping action', action.type);
    return state;
};

export const updateTL = (
    tl: undefined | Toplevel,
    action: ToplevelAction,
    updated: Record<number, true>,
    changes: HistoryItem['changes'],
): Toplevel | null => {
    switch (action.type) {
        case 'reset':
            if (!changes.toplevels) changes.toplevels = {};
            changes.toplevels[action.toplevel.id] = action.toplevel;
            return action.toplevel;
        case 'delete':
            return null;
        case 'update':
            if (!tl) throw new Error('trying to update nonexistent toplevel');
            if (!changes.prevToplevels) changes.prevToplevels = {};
            changes.prevToplevels[tl.id] = tl;
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
            const ntl = { ...tl, ...action.update, nodes };
            if (!changes.toplevels) changes.toplevels = {};
            changes.toplevels[tl.id] = ntl;
            return ntl;
    }
};
