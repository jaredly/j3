import { applyInferMod, infer } from '../../src/infer/infer';
import {
    autoCompleteIfNeeded,
    getAutoCompleteUpdate,
    splitGraphemes,
} from '../../src/parse/parse';
import { AutoCompleteReplace } from '../../src/to-ast/Ctx';
import { MNode, Map } from '../../src/types/mcst';
import { paste } from '../../src/state/clipboard';
import {
    State,
    StateChange,
    StateSelect,
    StateUpdate,
    UpdateMap,
    applyUpdate,
    getKeyUpdate,
} from '../../src/state/getKeyUpdate';
import { Path } from '../../src/state/path';
import { isRootPath } from './ByHand';
import {
    Action,
    DualAction,
    NUIState,
    UIState,
    UpdatableAction,
} from './UIState';
import { getCtx } from '../../src/getCtx';
import { verticalMove } from './verticalMove';
import { autoCompleteUpdate, verifyLocs } from '../../src/to-ast/autoComplete';
import { redoItem, undoItem } from '../../src/to-ast/history';
import { CstCtx, Ctx, HistoryItem, Sandbox } from '../../src/to-ast/library';
import { transformNode } from '../../src/types/transform-cst';
import { yankFromSandboxToLibrary } from '../ide/yankFromSandboxToLibrary';
import { hashedToTree, hashedTreeRename } from '../../src/db/hash-tree';
import { makeHash } from '../ide/makeHash';

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

export const undoRedo = (state: NUIState, kind: 'undo' | 'redo') => {
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

    return {
        ...state,
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
            );
            if (item) {
                next.history = state.history.concat([item]);
            }
            return next;
    }
};

export const calcHistoryItem = (
    state: NUIState,
    next: NUIState,
    libraryRoot: string,
): HistoryItem | null => {
    if (next.map === state.map) {
        return null;
    }
    const update: UpdateMap = {};
    const prev: UpdateMap = {};
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
    if (!changed) {
        return null;
    }
    return {
        at: next.at,
        prevAt: state.at,
        prev,
        map: update,
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
