import { hashedTreeRename } from '../../src/db/hash-tree';
import { getCtx } from '../../src/getCtx';
import { applyInferMod, infer } from '../../src/infer/infer';
import { getAutoCompleteUpdate } from '../../src/parse/parse';
import { paste } from '../../src/state/clipboard';
import {
    NsUpdateMap,
    State,
    StateChange,
    StateSelect,
    StateUpdate,
    UpdateMap,
    applyUpdate,
    getKeyUpdate,
} from '../../src/state/getKeyUpdate';
import { autoCompleteUpdate, verifyLocs } from '../../src/to-ast/autoComplete';
import { redoItem, undoItem } from '../../src/to-ast/history';
import { CstCtx, Ctx, HistoryItem, Sandbox } from '../../src/to-ast/library';
import { Map } from '../../src/types/mcst';
import { makeHash } from '../ide/makeHash';
import { yankFromSandboxToLibrary } from '../ide/yankFromSandboxToLibrary';
import { isRootPath } from './ByHand';
import {
    Action,
    Card,
    DualAction,
    NUIState,
    SandboxNamespace,
    UIState,
    UpdatableAction,
} from './UIState';
import { verticalMove } from './verticalMove';

export type UIStateChange =
    | { type: 'ui'; clipboard?: UIState['clipboard']; hover?: UIState['hover'] }
    | { type: 'menu'; menu: State['menu'] }
    | { type: 'full-select'; at: State['at'] }
    // | { type: 'collapse'; top: number }
    | DualAction;

const actionToUpdate = (
    state: UIState,
    action: UpdatableAction,
): StateChange | UIStateChange => {
    switch (action.type) {
        case 'hover':
            return { type: 'ui', hover: action.path };
        case 'menu':
            return { type: 'menu', menu: { selection: action.selection } };
        case 'menu-select': {
            const idx = action.path[action.path.length - 1].idx;
            return autoCompleteUpdate(idx, state.map, action.path, action.item);
        }
        case 'ns': {
            return {
                type: 'update',
                map: {},
                selection: action.selection ?? state.at[0].start,
                nsMap: action.nsMap,
            };
        }
        case 'copy':
            return {
                type: 'ui',
                clipboard: [action.items, ...state.clipboard],
            };
        case 'key':
            if (action.key === 'ArrowUp' || action.key === 'ArrowDown') {
                return verticalMove(
                    { ...state, menu: undefined },
                    action.key === 'ArrowUp',
                    action.mods,
                );
            }
            if (action.key === 'Escape') {
                console.log('dismiss');
                return {
                    type: 'menu',
                    menu: { dismissed: true, selection: 0 },
                };
            }
            return getKeyUpdate(
                action.key,
                state.map,
                state.cards,
                state.at[0],
                state.ctx.results.hashNames,
                state.nidx,
                action.mods,
            );
        case 'select':
            // Ignore attempts to select the root node
            if (action.at.some((at) => isRootPath(at.start))) {
                return;
            }
            return {
                type: 'full-select',
                at: action.add ? state.at.concat(action.at) : action.at,
            };
        case 'paste': {
            return paste(state, state.ctx, action.items, true);
        }
        case 'namespace-rename':
            return action;
        // case 'collapse':
        //     return action;
    }
    const _: never = action;
};

export const updateWithAutocomplete = (
    state: UIState,
    update: StateUpdate | StateSelect,
) => {
    const prevCtx = state.ctx;
    const prevMap = state.map;

    const prev = state.at[0];
    // Here's where the real work happens.
    if (update.autoComplete && !state.menu?.dismissed) {
        const aupdate = getAutoCompleteUpdate(state, state.ctx.results.display);
        if (aupdate) {
            state = { ...state, ...applyUpdate(state, 0, aupdate) };
        }
        verifyLocs(state.map, 'autocomplete');
    }
    state = { ...state, ...applyUpdate(state, 0, update) };
    verifyLocs(state.map, 'apply update');
    if (update.type === 'select' && !update.autoComplete) {
        return state;
    }

    // Ok, do the thing now
    // iff

    let { ctx, map } = getCtx(
        state.map,
        state.root,
        state.nidx,
        state.ctx.global,
    );
    verifyLocs(state.map, 'get ctx');
    state.map = map;
    state.ctx = ctx;

    const fixedMissing = fixMissingReferences(prevCtx, ctx, map, prevMap);

    if (fixedMissing) {
        let { ctx, map } = getCtx(
            state.map,
            state.root,
            state.nidx,
            state.ctx.global,
        );
        verifyLocs(state.map, 'get ctx');
        state.map = map;
        state.ctx = ctx;
    }

    if (update.autoComplete) {
        for (let i = 0; i < 10; i++) {
            const mods = infer(ctx, state.map);
            const modded = Object.keys(mods);
            if (!modded.length) {
                break;
            }
            if (i > 8) {
                console.log(mods);
                throw new Error(`why so manyy inference`);
            }
            console.log('3️⃣ infer mods', mods);
            modded.forEach((id) => {
                applyInferMod(mods[+id], state.map, state.nidx, +id);
                verifyLocs(state.map, 'apply infer mod');
                console.log(state.map[+id]);
            });
            ({ ctx, map } = getCtx(
                state.map,
                state.root,
                state.nidx,
                state.ctx.global,
            ));
            verifyLocs(state.map, 'get ctx');
            state.map = map;
            state.ctx = ctx;
        }
    }
    if (
        prev.start[prev.start.length - 1].idx !==
        state.at[0].start[state.at[0].start.length - 1].idx
    ) {
        state.menu = undefined;
    }
    return state;
};

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

    return {
        ...state,
        nsMap,
        map: smap,
        at: nitem.at,
        history: state.history.concat([nitem]),
    };
};

export const reduce = (
    state: UIState,
    action: Action,
    meta: Sandbox['meta'],
): UIState => {
    console.log('red', action);
    switch (action.type) {
        case 'yank':
            // This handles the `history` itself. so, ya know.
            return yankFromSandboxToLibrary(state, action, meta);
        case 'undo':
        case 'redo': {
            const next = undoRedo(state, action.type);
            const { ctx } = getCtx(
                next.map,
                state.root,
                state.nidx,
                state.ctx.global,
            );
            return { ...next, ctx };
        }
        default:
            const update = actionToUpdate(state, action);
            const next = reduceUpdate(state, update);
            const item = calcHistoryItem(
                state,
                next,
                next.ctx.global.library.root,
                action,
            );
            if (item) {
                next.history = state.history.concat([item]);
            }
            return next;
    }
};

export const findAdded = <T,>(shorter: T[], longer: T[]) => {
    const added = [];
    let i = 0,
        ti = 0;
    for (; i < shorter.length && ti < longer.length; i++, ti++) {
        while (ti < longer.length && shorter[i] !== longer[ti]) {
            added.push({ i, ti, item: longer[ti] });
            ti++;
        }
    }
    for (; ti < longer.length; ti++) {
        added.push({ i: shorter.length, ti, item: longer[ti] });
    }
    if (added.length === longer.length - shorter.length) {
        return added;
    }
};

// export const applyCardChange = (
//     changes: HistoryItem['cardChange'],
//     cards: Card[],
// ) => {
//     if (!changes.length) return cards;
//     cards = cards.slice();
//     changes.forEach((change) => {
//         if (change.type === 'card') {
//             if (!change.next) {
//                 cards.splice(change.idx, 1);
//             } else if (!change.prev) {
//                 cards.splice(change.idx, 0, change.next);
//             } else {
//                 cards[change.idx] = {
//                     ...cards[change.idx],
//                     path: change.next.path,
//                 };
//             }
//             return;
//         }
//         const { path, ns: next, prev } = change;
//         const cidx = path[0];
//         cards[cidx] = { ...cards[cidx] };
//         let at = (cards[cidx].ns = { ...cards[cidx].ns });
//         at.children = at.children.slice();
//         for (let i = 1; i < path.length - 1; i++) {
//             const child = (at.children[i] = { ...at.children[i] });
//             if (child.type !== 'normal') {
//                 throw new Error('invalid card ns change');
//             }
//             at = child;
//             at.children = at.children.slice();
//         }

//         const last = path[path.length - 1];
//         if (next && prev) {
//             console.log(`replacing`, at, last);
//             const cur = at.children[last];
//             if (cur.type === 'normal' && next.type === 'normal') {
//                 at.children[last] = {
//                     ...cur,
//                     top: next.top,
//                     hidden: next.hidden,
//                     collapsed: next.collapsed,
//                 };
//             } else {
//                 at.children[last] = next;
//             }
//         } else if (next) {
//             console.log(`> adding to`, at, last, next);
//             at.children.splice(last, 0, next);
//             console.log('< ', at);
//         } else if (prev) {
//             console.log(`removing from`, at, last);
//             at.children.splice(last, 1);
//             console.log('< ', at);
//         }
//         console.log(cards[cidx]);
//     });
//     console.log('applied changes');
//     return cards;
// };

// export const nsDiffs = (
//     path: number[],
//     prev?: SandboxNamespace,
//     next?: SandboxNamespace,
// ): HistoryItem['cardChange'] => {
//     if (prev === next) return [];
//     if (
//         !prev ||
//         !next ||
//         prev.type !== next.type ||
//         (prev.type === 'normal' &&
//             next.type === 'normal' &&
//             (prev.top !== next.top ||
//                 prev.hidden !== next.hidden ||
//                 prev.collapsed !== next.collapsed))
//     ) {
//         return [{ type: 'ns', path, ns: next, prev }];
//     }
//     if (prev.type === 'placeholder' || next.type === 'placeholder') {
//         return prev.hash !== next.hash
//             ? [{ type: 'ns', path, ns: next, prev }]
//             : [];
//     }
//     if (prev.top !== next.top) {
//         return [{ type: 'ns', path, ns: next, prev }];
//     }

//     if (prev.children.length < next.children.length) {
//         const added = findAdded(prev.children, next.children);
//         if (added) {
//             return added.map((add) => ({
//                 type: 'ns',
//                 path: path.concat([add.i]),
//                 ns: add.item,
//             }));
//         }
//     }

//     if (prev.children.length > next.children.length) {
//         const removed = findAdded(next.children, prev.children);
//         if (removed) {
//             return removed.map((add) => ({
//                 type: 'ns',
//                 path: path.concat([add.ti]),
//                 prev: add.item,
//             }));
//         }
//     }

//     if (prev.children.length === next.children.length) {
//         const change: HistoryItem['cardChange'] = [];
//         for (let i = 0; i < prev.children.length; i++) {
//             change.push(
//                 ...nsDiffs(
//                     path.concat([i]),
//                     prev.children[i],
//                     next.children[i],
//                 ),
//             );
//         }
//         return change;
//     }

//     throw new Error(
//         'couldnt figure out hte difference between the two namespaces',
//     );
//     // const change: HistoryItem['cardChange'] = [];
//     // let pi = 0
//     // let ni = 0
//     // while (pi < prev.children.length && ni < next.children.length) {

//     // }
//     // for (;pi < prev.children.length; pi++) {
//     //     change.push({path: path.concat([pi]), prev: prev.children[pi], type: 'ns'})
//     // }
//     // for (;ni < next.children.length; ni++) {
//     //     change.push({path: path.concat([ni]), next: next.children[ni], type: 'ns'})
//     // }

//     // // fallback
//     // for (
//     //     let i = 0;
//     //     i < Math.max(prev.children.length, next.children.length);
//     //     i++
//     // ) {
//     //     if (prev.children[i] !== next.children[i]) {
//     //         change.push(
//     //             ...nsDiffs(
//     //                 path.concat([i]),
//     //                 prev.children[i],
//     //                 next.children[i],
//     //             ),
//     //         );
//     //     }
//     // }
//     // return change;
// };

// export const getNs = (path: number[], state: NUIState) => {
//     let ns = state.cards[path[0]].ns;
//     for (let i = 1; i < path.length; i++) {
//         const child = ns.children[path[i]];
//         if (child?.type !== 'normal') {
//             return;
//         }
//         ns = child;
//     }
//     return ns;
// };

// export const nsUpdateToCardChange = (
//     nsUpdate: NonNullable<StateUpdate['nsUpdate']>[0],
//     prev: NUIState,
//     next: NUIState,
// ): HistoryItem['cardChange'][0] | undefined => {
//     switch (nsUpdate.type) {
//         case 'add': {
//             let path = nsUpdate.path;
//             if (nsUpdate.after) {
//                 path = path.slice();
//                 path[path.length - 1] += 1;
//             }
//             return {
//                 type: 'ns',
//                 path,
//                 ns: nsUpdate.ns,
//             };
//         }
//         case 'replace': {
//             const pns = getNs(nsUpdate.path, prev);
//             const ns = getNs(nsUpdate.path, next);
//             if (!pns || !ns) return;
//             return {
//                 type: 'ns',
//                 path: nsUpdate.path,
//                 ns,
//                 prev: pns,
//             };
//         }
//         case 'rm': {
//             const pns = getNs(nsUpdate.path, prev);
//             return {
//                 type: 'ns',
//                 path: nsUpdate.path,
//                 prev: pns,
//             };
//         }
//     }
// };

export const filterNulls = <T,>(
    value: T,
): value is Exclude<T, null | undefined> => value != null;

// export const calcCardChange = (
//     state: NUIState,
//     next: NUIState,
//     action: Action,
// ): HistoryItem['cardChange'] => {
//     const change: HistoryItem['cardChange'] = [];

//     if (action.type === 'ns') {
//         return action.nsUpdate
//             .map((update) => nsUpdateToCardChange(update, state, next))
//             .filter(filterNulls);
//     }

//     if (state.cards.length !== next.cards.length) {
//         if (state.cards.length < next.cards.length) {
//             const added = findAdded(state.cards, next.cards);
//             if (added) {
//                 return added.map((add) => ({
//                     type: 'card',
//                     idx: add.i,
//                     next: add.item,
//                 }));
//             }
//         } else {
//             const removed = findAdded(state.cards, next.cards);
//             if (removed) {
//                 return removed.map((add) => ({
//                     type: 'card',
//                     idx: add.ti,
//                     prev: add.item,
//                 }));
//             }
//         }
//         throw new Error('cant figure out the add/removal of cards');
//     }

//     for (let i = 0; i < state.cards.length; i++) {
//         const prev = state.cards[i];
//         const card = next.cards[i];
//         if (prev === card) continue;
//         if (prev.path !== card.path) {
//             change.push({
//                 type: 'card',
//                 idx: i,
//                 prev: { ...prev, ns: { ...prev.ns, children: [] } },
//                 next: { ...card, ns: { ...card.ns, children: [] } },
//             });
//         } else {
//             change.push(...nsDiffs([i], prev.ns, card.ns));
//         }
//     }

//     return change;
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
    const update: UpdateMap = {};
    const prev: UpdateMap = {};
    const nsUpdate: NsUpdateMap = {};
    const nsPrev: NsUpdateMap = {};

    let changed = false;
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

    if (!changed) {
        return null;
    }
    return {
        at: next.at,
        prevAt: state.at,
        prev,
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

export const reduceUpdate = (
    state: UIState,
    update: StateChange | UIStateChange,
): UIState => {
    if (!update) {
        return state;
    }
    switch (update.type) {
        case 'full-select':
            return { ...state, at: update.at, menu: undefined };
        case 'ui':
            return {
                ...state,
                clipboard: update.clipboard ?? state.clipboard,
                hover: update.hover ?? state.hover,
            };
        case 'menu':
            return { ...state, menu: update.menu };
        case 'select':
        case 'update':
            return updateWithAutocomplete(state, update);
        case 'namespace-rename':
            const library = { ...state.ctx.global.library };
            const result = hashedTreeRename(
                library.namespaces,
                library.root,
                update.from,
                update.to,
                makeHash,
            );
            if (!result) {
                console.log(`"from" not found`);
                return state;
            }
            library.root = result.root;
            library.namespaces = result.tree;
            library.history.unshift({
                date: Date.now() / 1000,
                hash: result.root,
            });
            return {
                ...state,
                ctx: { ...state.ctx, global: { ...state.ctx.global, library } },
            };
        // case 'collapse':
        //     return {
        //         ...state,
        //         collapse: {
        //             ...state.collapse,
        //             [update.top]: !state.collapse[update.top],
        //         },
        //     };
        // return state;
        default:
            const _: never = update;
            throw new Error('nope update');
    }
};

export function fixMissingReferences(
    prevCtx: Ctx,
    ctx: CstCtx,
    map: Map,
    prevMap: Map,
) {
    let fixedMissing = false;
    const missing: Record<number, string> = {};
    Object.entries(prevCtx.results.hashNames).forEach(([k, v]) => {
        if (!ctx.results.hashNames[+k]) {
            missing[+k] = v;
            const node = map[+k];
            const pnode = prevMap[+k];
            if (
                node?.type === 'hash' &&
                pnode?.type === 'hash' &&
                node.hash === pnode.hash
            ) {
                fixedMissing = true;
                map[+k] = {
                    type: 'identifier',
                    loc: +k,
                    text: v,
                };
            }
        }
    });
    Object.entries(map).forEach(([k, v]) => {
        if (
            v.type === 'hash' &&
            // TODO ok I don't super love that I'm overloading `local hash` with `toplevel hash`
            // I kinda want to add a `kind` to hash, ya know?
            typeof v.hash === 'number' &&
            !map[v.hash]
        ) {
            const ref = prevMap[v.hash];
            if (ref?.type === 'identifier') {
                fixedMissing = true;
                map[+k] = {
                    type: 'identifier',
                    loc: +k,
                    text: ref.text,
                };
            }
        }
    });
    return fixedMissing;
}
