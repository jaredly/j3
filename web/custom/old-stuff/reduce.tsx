import { NsUpdateMap, State } from '../../../src/state/getKeyUpdate';
import { UpdateMap } from '../../../src/types/mcst';
import { redoItem, undoItem } from '../../../src/to-ast/history';
import { HistoryItem } from '../../../src/to-ast/library';
import { Map } from '../../../src/types/mcst';
// import { yankFromSandboxToLibrary } from '../../ide/yankFromSandboxToLibrary';
import {
    Action,
    DualAction,
    MetaDataUpdateMap,
    NUIState,
    UIState,
} from '../UIState';

export type UIStateChange =
    | { type: 'ui'; clipboard?: UIState['clipboard']; hover?: UIState['hover'] }
    | { type: 'menu'; menu: State['menu'] }
    | { type: 'full-select'; at: State['at'] }
    // | { type: 'collapse'; top: number }
    | DualAction;

export const prevMap = (map: Map, update: UpdateMap): UpdateMap => {
    const prev: UpdateMap = {};
    Object.keys(update).forEach((k) => {
        prev[+k] = map[+k] || null;
    });
    return prev;
};

export const undoRedo = (state: NUIState, kind: 'undo' | 'redo'): NUIState => {
    const undid =
        kind === 'undo' ? undoItem(state.history) : redoItem(state.history);
    if (!undid) {
        console.log(`nothing to ${kind}!`);
        return state;
    }
    const nitem: HistoryItem = {
        id: state.history.length,
        meta: undid.metaPrev,
        metaPrev: undid.meta,
        revert: undid.id,
        prev: undid.map,
        map: undid.prev,
        at: undid.prevAt,
        prevAt: undid.at,
        nsMap: undid.nsPrev,
        nsPrev: undid.nsMap,
        ts: Date.now() / 1000,
        libraryRoot: undid.libraryRoot,
    };
    const smap = { ...state.map };
    Object.entries(nitem.map).forEach(([k, v]) => {
        if (v == null) {
            delete smap[+k];
        } else {
            smap[+k] = v;
        }
    });

    const nsMap = { ...state.nsMap };
    Object.entries(nitem.nsMap).forEach(([k, v]) => {
        if (v == null) {
            delete nsMap[+k];
        } else {
            nsMap[+k] = v;
        }
    });

    const meta = { ...state.meta };
    Object.entries(nitem.meta).forEach(([k, v]) => {
        if (v == null) {
            delete meta[+k];
        } else {
            meta[+k] = v;
        }
    });

    return {
        ...state,
        nsMap,
        meta,
        map: smap,
        at: nitem.at,
        history: state.history.concat([nitem]),
    };
};

// export const findAdded = <T,>(shorter: T[], longer: T[]) => {
//     const added = [];
//     let i = 0,
//         ti = 0;
//     for (; i < shorter.length && ti < longer.length; i++, ti++) {
//         while (ti < longer.length && shorter[i] !== longer[ti]) {
//             added.push({ i, ti, item: longer[ti] });
//             ti++;
//         }
//     }
//     for (; ti < longer.length; ti++) {
//         added.push({ i: shorter.length, ti, item: longer[ti] });
//     }
//     if (added.length === longer.length - shorter.length) {
//         return added;
//     }
// };

export const calcHistoryItem = (
    state: NUIState,
    next: NUIState,
    libraryRoot: string,
    action: Action,
): HistoryItem | null => {
    if (next.map === state.map) {
        return null;
    }
    let changed = false;

    const update: UpdateMap = {};
    const prev: UpdateMap = {};
    Object.keys(next.map).forEach((k) => {
        if (next.map[+k] !== state.map[+k]) {
            changed = true;
            update[+k] = next.map[+k];
            prev[+k] = state.map[+k] || null;
        }
    });
    Object.keys(state.map).forEach((k) => {
        if (!next.map[+k]) {
            changed = true;
            update[+k] = null;
            prev[+k] = state.map[+k];
        }
    });

    const nsUpdate: NsUpdateMap = {};
    const nsPrev: NsUpdateMap = {};
    Object.keys(next.nsMap).forEach((k) => {
        if (next.nsMap[+k] !== state.nsMap[+k]) {
            changed = true;
            nsUpdate[+k] = next.nsMap[+k];
            nsPrev[+k] = state.nsMap[+k] || null;
        }
    });
    Object.keys(state.nsMap).forEach((k) => {
        if (!next.nsMap[+k]) {
            changed = true;
            nsUpdate[+k] = null;
            nsPrev[+k] = state.nsMap[+k];
        }
    });

    const meta: MetaDataUpdateMap = {};
    const metaPrev: MetaDataUpdateMap = {};
    Object.keys(next.meta).forEach((k) => {
        if (next.meta[+k] !== state.meta[+k]) {
            changed = true;
            meta[+k] = next.meta[+k];
            metaPrev[+k] = state.meta[+k] || null;
        }
    });
    Object.keys(state.meta).forEach((k) => {
        if (!next.meta[+k]) {
            changed = true;
            meta[+k] = null;
            metaPrev[+k] = state.meta[+k];
        }
    });

    if (!changed) {
        return null;
    }
    return {
        at: next.at,
        prevAt: state.at,
        prev,
        meta,
        metaPrev,
        map: update,
        nsMap: nsUpdate,
        nsPrev: nsPrev,
        id: state.history.length
            ? state.history[state.history.length - 1].id + 1
            : 0,
        ts: Date.now() / 1000,
        libraryRoot,
    };
};

// export function fixMissingReferences(
//     prevCtx: Ctx,
//     ctx: CstCtx,
//     map: Map,
//     prevMap: Map,
// ) {
//     let fixedMissing = false;
//     const missing: Record<number, string> = {};
//     Object.entries(prevCtx.results.hashNames).forEach(([k, v]) => {
//         if (!ctx.results.hashNames[+k]) {
//             missing[+k] = v;
//             const node = map[+k];
//             const pnode = prevMap[+k];
//             if (
//                 node?.type === 'hash' &&
//                 pnode?.type === 'hash' &&
//                 node.hash === pnode.hash
//             ) {
//                 fixedMissing = true;
//                 map[+k] = {
//                     type: 'identifier',
//                     loc: +k,
//                     text: v,
//                 };
//             }
//         }
//     });
//     Object.entries(map).forEach(([k, v]) => {
//         if (
//             v.type === 'hash' &&
//             // TODO ok I don't super love that I'm overloading `local hash` with `toplevel hash`
//             // I kinda want to add a `kind` to hash, ya know?
//             typeof v.hash === 'number' &&
//             !map[v.hash]
//         ) {
//             const ref = prevMap[v.hash];
//             if (ref?.type === 'identifier') {
//                 fixedMissing = true;
//                 map[+k] = {
//                     type: 'identifier',
//                     loc: +k,
//                     text: ref.text,
//                 };
//             }
//         }
//     });
//     return fixedMissing;
// }
