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
export type HistoryItem =
    | HistoryChange
    | {
          type: 'revert';
          id: string;
          undo: boolean;
          ts: number;
          reverts: string;
      };

export type HistoryChange = {
    type: 'change';
    ts: number;
    id: string;
    onlyy?: number; // the id or text:index that is the "only" thing that was modified
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

const invertChange = (change: HistoryChange): HistoryChange => ({ ...change, selections: revDelta(change.selections), top: revDelta(change.top) });

const applyChange = (state: AppState, item: HistoryChange) => {
    state = { ...state };
    state.selections = item.selections.next;
    state.top = { ...item.top.next, nodes: withNodes(state.top.nodes, item.top.next.nodes) };
    return state;
};

const revert = (state: AppState, item: HistoryItem, undo: boolean) => {
    // console.log('revert', item.type);
    if (item.type === 'change') {
        state = applyChange(state, invertChange(item));
        const next: HistoryItem = { type: 'revert', reverts: item.id, id: genId(), ts: Date.now(), undo: undo };
        state.history = state.history.concat([next]);
        return state;
    }
    const found = state.history.find((h) => h.id === item.reverts);
    if (!found) return state;
    if (found.type === 'change') {
        state = applyChange(state, found);
        const next: HistoryItem = { type: 'revert', reverts: item.id, id: genId(), ts: Date.now(), undo: undo };
        state.history = state.history.concat([next]);
        return state;
    }
    const back = state.history.find((h) => h.id === found.reverts);
    if (!back) return state;
    return revert(state, back, !undo);
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

/*
take the top item
if it is a normal change, revert it!
if it is an undo of a normal change, jump to the corresponding thing, and go back one more.
*/
export const findUndo = (history: HistoryItem[]): HistoryItem | void => {
    if (!history.length) return;
    let at = history.length - 1;
    while (at >= 0) {
        const item = history[at];
        if (item.type === 'change' || !item.undo) return item;
        const found = history.findIndex((h) => h.id === item.reverts);
        if (found === -1) return;
        at = found - 1;
    }
};

/*

A B C -> ABC

A B C ^ -> AB

A B C ^ ! -> ABC

A B C ^ ^ A -> AA

A B C ^ ! A ^ ^ -> AB

A -> A
A B -> AB
A B C -> ABC
A B C ^ -> AB
A B C ^ ! -> ABC

*/

/*
take the top item
if it is a normal change, bail
if it is an 'undo' revert, you're good
if it is a 'redo' revert, back up to it's corresponding undo - 1

*/
export const findRedo = (history: HistoryItem[]): HistoryItem | void => {
    if (!history.length) return;
    let at = history.length - 1;
    while (at >= 0) {
        const last = history[at];
        if (!last) return;
        if (last.type === 'change') return;
        if (last.undo) return last;
        const found = history.findIndex((h) => h.id === last.reverts);
        if (found === -1) return;
        at = found - 1;
        // return last;
    }
    // if (last.type === 'change') return;
    // if (last.undo) {
    // }
    // if (last.type === 'revert') return last;
    // if (last.type === 'revert') {
    //     return history.find((h) => h.id === last.reverts);
    // }
    // while (at >= 1) {
    //     const item = history[at];
    //     if (item.type === 'revert') return;
    //     const found = history.findIndex((h) => h.id === item.reverts);
    //     if (found === -1) return;
    //     return item
    // }
    // if (at === -1) return;
    // return at;
};

const redo = (state: AppState): AppState => {
    const item = findRedo(state.history);
    return item != null ? revert(state, item, false) : state;
};

const undo = (state: AppState) => {
    if (!state.history.length) return state;
    const item = findUndo(state.history);
    return item != null ? revert(state, item, item.type === 'change') : state;
};

const diffTop = (prev: Top, next: Top): [HistoryChange['top']['next'], boolean, number | undefined] => {
    const diff: HistoryChange['top']['next'] = {
        ...next,
        nodes: {},
    };
    let only = undefined as undefined | false | number;
    let changed = next.nextLoc !== prev.nextLoc || next.root !== prev.root; // || !equal(next.tmpText, prev.tmpText);
    Object.entries(next.nodes).forEach(([key, value]) => {
        if (prev.nodes[+key] !== value) {
            if (only === undefined) {
                only = +key;
            } else {
                only = false;
            }
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
    return [diff, changed, only === false ? undefined : only];
};

const calculateHistoryItem = (prev: AppState, next: AppState): HistoryChange | void => {
    const [nt, cn, onlyy] = diffTop(prev.top, next.top);
    const [pt, cp] = diffTop(next.top, prev.top);
    if (!cn && !cp) return;
    return {
        type: 'change',
        id: genId(),
        ts: Date.now(),
        onlyy,
        top: { next: nt, prev: pt },
        selections: { next: next.selections, prev: prev.selections },
    };
};

const joinHistory = (prev: HistoryChange, next: HistoryChange): HistoryChange => {
    return {
        ...prev,
        selections: { prev: prev.selections.prev, next: next.selections.next },
        top: { prev: prev.top.prev, next: next.top.next },
    };
};

const recordHistory = (prev: AppState, next: AppState, noJoin = false): AppState => {
    if (prev === next) return next;
    const item = calculateHistoryItem(prev, next);
    if (!item) return next;
    const history = next.history.slice();
    const pitem = next.history[next.history.length - 1];
    if (!noJoin && pitem?.type === 'change' && pitem.onlyy != null && pitem.onlyy === item.onlyy && item.ts - pitem.ts < 10000) {
        history[history.length - 1] = joinHistory(pitem, item);
        return { ...next, history };
    }
    history.push(item);
    return { ...next, history };
};

export const applyAppUpdate = (state: AppState, action: Action, noJoin = false): AppState => {
    switch (action.type) {
        case 'undo':
            return undo(state);
        case 'redo':
            return redo(state);
        case 'add-sel':
            return recordHistory(state, { ...state, selections: state.selections.concat([action.sel]) }, noJoin);
        case 'update':
            const result = applyUpdate({ top: state.top, sel: state.selections[0] }, action.update);
            return recordHistory(state, { ...state, top: result.top, selections: [result.sel] }, noJoin);

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
            return recordHistory(state, { ...state, top, selections }, noJoin);
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
