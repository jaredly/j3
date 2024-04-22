import { hashedTreeRename } from '../../../src/db/hash-tree';
import { getCtx } from '../../../src/getCtx';
import { applyInferMod, infer } from '../../../src/infer/infer';
import { getAutoCompleteUpdate } from '../../../src/parse/parse';
import { paste } from '../../../src/state/clipboard';
import {
    NsUpdateMap,
    State,
    StateChange,
    StateSelect,
    StateUpdate,
    UpdateMap,
    applyUpdate,
    getKeyUpdate,
} from '../../../src/state/getKeyUpdate';
import {
    autoCompleteUpdate,
    verifyLocs,
} from '../../../src/to-ast/autoComplete';
import { redoItem, undoItem } from '../../../src/to-ast/history';
import { CstCtx, Ctx, HistoryItem, Sandbox } from '../../../src/to-ast/library';
import { Map } from '../../../src/types/mcst';
import { makeHash } from '../../ide/makeHash';
import { yankFromSandboxToLibrary } from '../../ide/yankFromSandboxToLibrary';
import { isRootPath } from '../ByHand';
import {
    Action,
    Card,
    DualAction,
    MetaDataUpdateMap,
    NUIState,
    SandboxNamespace,
    UIState,
    UpdatableAction,
} from '../UIState';
import { verticalMove } from '../verticalMove';

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
                state.nsMap,
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
        case 'config:evaluator':
        case 'namespace-rename':
        case 'meta':
        case 'update':
            return action;
        case 'rich': {
            const node = state.map[action.idx];
            if (node.type === 'rich-text') {
                return {
                    type: 'update',
                    map: {
                        [action.idx]: { ...node, contents: action.content },
                    },
                    selection: state.at[0].start,
                };
            }
            return;
        }
        case 'move':
        case 'jump-to-definition':
            return;
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
        case 'config:evaluator':
            return { ...state, evaluator: update.id };
        case 'meta': {
            const meta = { ...state.meta };
            Object.entries(update.meta).forEach(([key, value]) => {
                if (value == null) {
                    delete meta[+key];
                } else {
                    meta[+key] = value;
                }
            });
            return { ...state, meta };
        }
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
