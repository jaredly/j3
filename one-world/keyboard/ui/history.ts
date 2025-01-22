import equal from 'fast-deep-equal';
import { Node, Nodes } from '../../shared/cnodes';
import { shape } from '../../shared/shape';
import { applyUpdate, applySelUp } from '../applyUpdate';
import { root } from '../root';
import { init } from '../test-utils';
import { Top, NodeSelection } from '../utils';
import { AppState, Action } from './App';
import { keyUpdate } from './keyUpdate';

type Delta<T> = { next: T; prev: T };
export type HistoryItem = {
    reverts?: string;
    id: string;
    // session: string;
    top: Delta<Omit<Top, 'nodes'> & { nodes: Record<number, Node | null> }>;
    selections: Delta<NodeSelection[]>;
};

/*

// undo the stack
A B C C' B' A'

// undo/redo/undo/undo
A B C C' C" C' B'

//
-------------------
  --------------
    ---------
  ---  ---
A B B' C C' B" B' A'
    - top is normal, revert it
         - top is normal, revert it
            - top is a revert, jump to pair, and revert the one before
               - top is a revert, jump to pair revert the one before
- IF TOP is a normal, revert it
- IF TOP is a revert, revert whatever was right before the pair

*/

export const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2);
const revDelta = <T>(d: Delta<T>): Delta<T> => ({ next: d.prev, prev: d.next });
const revert = (state: AppState, item: HistoryItem) => {
    state = { ...state };
    const next: HistoryItem = {
        reverts: item.id,
        id: genId(),
        top: revDelta(item.top),
        selections: revDelta(item.selections),
    };
    // console.log(item, next);
    state.history = state.history.concat([next]);
    state.selections = next.selections.next;
    // console.log('pre', state.top.nodes, state.top);
    state.top = { ...next.top.next, nodes: withNodes(state.top.nodes, next.top.next.nodes) };
    // console.log('reverted', state.top.nodes, state.top);
    return state;
};

const withNodes = (nodes: Nodes, up: Record<number, Node | null>): Nodes => {
    nodes = { ...nodes };
    Object.entries(up).forEach(([key, value]) => {
        if (value === null) {
            delete nodes[+key];
        } else {
            nodes[+key] = value;
        }
    });
    return nodes;
};

export const findUndo = (history: { id: string; reverts?: string }[]): number | void => {
    if (!history.length) return;
    let at = history.length - 1;
    while (at >= 0) {
        const item = history[at];
        if (!item.reverts) return at;
        const found = history.findIndex((h) => h.id === item.reverts);
        if (found === -1) return;
        at = found - 1;
    }
    if (at === -1) return;
    return at;
};

export const findRedo = (history: { id: string; reverts?: string }[]): number | void => {
    if (!history.length) return;
    let at = history.length - 1;
    while (at >= 0) {
        const item = history[at];
        if (!item.reverts) return;
        const found = history.findIndex((h) => h.id === item.reverts);
        if (found === -1) return;
        at = found - 1;
    }
    if (at === -1) return;
    return at;
};

const redo = (state: AppState): AppState => {
    const idx = findRedo(state.history);
    console.log('redone', idx);
    return idx != null ? revert(state, state.history[idx]) : state;
};

/*

so, thinking about tmptext
and history items.
what ifff
history items never have tmptext?
so like,
if we're triggering a history item,
we lock in the tmptext.
eh i dont know about that. is that real.

i meeeean what if I get rid of tmptext altogether?
yeah like it seems like, I'm just making things more complicated for myself.

*/

const undo = (state: AppState) => {
    // const last = state.history[state.history.length - 1];
    // if (!last) {
    //     console.warn('nothing to undo');
    //     return state;
    // }
    // if (last.reverts != null) {
    //     const at = state.history.findIndex((h) => h.id === last.reverts);
    //     if (at === -1 || at === 0) {
    //         console.warn(`reverted item not fgound`);
    //         return state;
    //     }
    //     console.log(`reverting item at ${at - 1}`, state.history[at - 1]);
    //     return revert(state, state.history[at - 1]);
    // }
    // console.log(`reverting`, last);
    // return revert(state, last);
    if (!state.history.length) return state;
    const last = state.history[state.history.length - 1];
    if (!equal(state.top.tmpText, last.top.next.tmpText)) {
        const nitem: HistoryItem = {
            id: genId(),
            selections: { prev: last.selections.next, next: state.selections },
            top: { prev: { ...last.top.next, nodes: {} }, next: { ...state.top, nodes: {} } },
        };

        // add an item for the tmpTExt
        // then revert it.
    }
    const item = findUndo(state.history);
    return item != null ? revert(state, state.history[item]) : state;
};

const diffTop = (prev: Top, next: Top): [HistoryItem['top']['next'], boolean] => {
    const diff: HistoryItem['top']['next'] = {
        ...next,
        nodes: {},
    };
    let changed = next.nextLoc !== prev.nextLoc || next.root !== prev.root; // || !equal(next.tmpText, prev.tmpText);
    Object.entries(next.nodes).forEach(([key, value]) => {
        if (prev.nodes[+key] !== value) {
            diff.nodes[+key] = value;
            changed = true;
        }
    });
    Object.keys(prev.nodes).forEach((key) => {
        if (!next.nodes[+key]) {
            diff.nodes[+key] = null;
            changed = true;
        }
    });
    return [diff, changed];
};

const calculateHistoryItem = (prev: AppState, next: AppState): HistoryItem | void => {
    const [nt, cn] = diffTop(prev.top, next.top);
    const [pt, cp] = diffTop(next.top, prev.top);
    if (!cn && !cp) return;
    return {
        id: genId(),
        top: { next: nt, prev: pt },
        selections: { next: next.selections, prev: prev.selections },
    };
};

const recordHistory = (prev: AppState, next: AppState): AppState => {
    if (prev === next) return next;
    const item = calculateHistoryItem(prev, next);
    if (!item) return next;
    return { ...next, history: next.history.concat([item]) };
};

export const applyAppUpdate = (state: AppState, action: Action): AppState => {
    switch (action.type) {
        case 'undo':
            return undo(state);
        case 'redo':
            return redo(state);
        case 'add-sel':
            return recordHistory(state, { ...state, selections: state.selections.concat([action.sel]) });
        case 'update':
            const result = applyUpdate({ top: state.top, sel: state.selections[0] }, action.update);
            return recordHistory(state, { ...state, top: result.top, selections: [result.sel] });

        case 'key':
            const selections = state.selections.slice();
            let top = state.top;
            for (let i = 0; i < selections.length; i++) {
                const sel = selections[i];
                const update = keyUpdate({ top, sel }, action.key, action.mods, action.visual, action.config);
                const result = applyUpdate({ top, sel }, update);
                top = result.top;
                selections[i] = result.sel;
                if (update && Array.isArray(update.selection)) {
                    for (let j = 0; j < selections.length; j++) {
                        if (j !== i) {
                            update.selection.forEach((up) => {
                                selections[j] = applySelUp(selections[i], up);
                            });
                        }
                    }
                }
            }
            return recordHistory(state, { ...state, top, selections });
    }

    // let top = state.top;
    // if (Array.isArray(action)) {
    //     const selections = action.map((action, i) => {
    //         const result = applyUpdate({ top, sel: i >= state.selections.length ? state.selections[0] : state.selections[i] }, action);
    //         top = result.top;
    //         return result.sel;
    //     });
    //     return { ...state, top, selections };
    // }
    // if (!state.selections.length) return state;
    // const result = applyUpdate({ top, sel: state.selections[0] }, action);
    // // const selections = state.selections.map((sel, i) => {
    // //     const result = applyUpdate({ top, sel }, action);
    // //     top = result.top;
    // //     return result.sel;
    // // });
    // return { ...state, top: result.top, selections: [result.sel] };
};
export const reducer = (state: AppState, action: Action) => {
    const result = applyAppUpdate(state, action);
    console.log(shape(root({ top: result.top })));
    return result;
};
export const initialAppState: AppState = { top: init.top, selections: [init.sel], history: [] };
