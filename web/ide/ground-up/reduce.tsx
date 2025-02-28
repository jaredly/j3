import { layout } from '../../../src/old-layout';
import { emptyMap } from '../../../src/parse/parse';
import { paste } from '../../../src/state/clipboard';
import { NsUpdateMap, StateChange, applyUpdate, getKeyUpdate, isRootPath } from '../../../src/state/getKeyUpdate';
import { moveNode } from '../../../src/state/moveNode';
import { Action, NUIState, RealizedNamespace, SandboxNamespace, UpdatableAction } from '../../custom/UIState';
import { UIStateChange, calcHistoryItem, undoRedo } from '../../custom/old-stuff/reduce';
import { ResultsCache } from '../../custom/store/ResultsCache';
import { verticalMove } from '../../custom/verticalMove';
// import { newResults } from '../newResults';
import { findTops, verifyPath } from './findTops';
import { urlForId } from './urlForId';
import { white } from './white';

export const reduceUpdate = (state: NUIState, update: StateChange | UIStateChange): NUIState => {
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
            state = { ...state, ...applyUpdate(state, 0, update) };
            if (update.type === 'update' && update.nsMap) {
                state.nsMap = { ...state.nsMap };
                Object.entries(update.nsMap).forEach(([key, value]) => {
                    if (value == null) {
                        delete state.nsMap[+key];
                    } else {
                        state.nsMap[+key] = value;
                    }
                });
            }
            return state;
        case 'config:evaluator':
            return { ...state, evaluator: update.id };
        case 'namespace-rename':
            console.warn('ignoring namespace rename');
            return state;
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

export const actionToUpdate = (state: NUIState, action: UpdatableAction): StateChange | UIStateChange | void => {
    switch (action.type) {
        case 'update':
        case 'config:evaluator':
            return action;
        case 'hover':
            return { type: 'ui', hover: action.path };
        case 'menu':
            return { type: 'menu', menu: { selection: action.selection } };
        case 'key': {
            if (!state.at.length) {
                return;
            }
            if (action.key === 'ArrowUp' || action.key === 'ArrowDown') {
                return verticalMove({ ...state, menu: undefined }, action.key === 'ArrowUp', action.mods);
            }
            if (action.key === 'Escape') {
                return {
                    type: 'menu',
                    menu: { dismissed: true, selection: 0 },
                };
            }
            let common: StateChange = undefined;
            for (let cursor of state.at) {
                const result = getKeyUpdate(
                    action.key,
                    state.map,
                    state.nsMap,
                    state.cards,
                    cursor,
                    // TODO do I want some hashnames?
                    {},
                    state.nidx,
                    action.mods,
                    state.regs,
                );
                if (state.at.length === 1) return result;
                if (!result) return;
                if (!common) {
                    common = result;
                    if (common.type === 'update') {
                        common.at = [
                            {
                                start: common.selection,
                                end: common.selectionEnd,
                            },
                        ];
                    }
                    if (common.type === 'select') {
                        common = {
                            type: 'full-select',
                            at: [
                                {
                                    start: common.selection,
                                    end: common.selectionEnd,
                                },
                            ],
                        };
                    }
                } else {
                    if (result.type === 'update' && common.type === 'update') {
                        for (let key of Object.keys(result.map)) {
                            if (common.map[key]) return; // overlap, sorry
                            common.map[key] = result.map[key];
                        }
                        if (result.nsMap) {
                            for (let key of Object.keys(result.map)) {
                                if (common.nsMap?.[key]) return; // overlap, sorry
                                if (!common.nsMap) common.nsMap = {};
                                common.nsMap[key] = result.nsMap[key];
                            }
                        }
                        common.at!.push({
                            start: result.selection,
                            end: result.selectionEnd,
                        });
                        continue;
                    } else if (result.type === 'select' && common.type === 'full-select') {
                        // erghhh `select` needs to allow multiplesssss
                        common.at.push({
                            start: result.selection,
                            end: result.selectionEnd,
                        });
                        continue;
                    }
                    return;
                }
            }
            return common;
        }
        case 'select': {
            // Ignore attempts to select the root node
            if (action.at.some((at) => isRootPath(at.start))) {
                return;
            }
            let changed = false;
            const nsMap: NsUpdateMap = {};
            for (let { start } of action.at) {
                for (let i = 1; i < start.length && start[i].type === 'ns'; i++) {
                    const ns = state.nsMap[start[i].idx] as RealizedNamespace;
                    if (ns.collapsed && !nsMap[ns.id]) {
                        changed = true;
                        nsMap[ns.id] = { ...ns, collapsed: false };
                    }
                }
            }
            if (changed) {
                return {
                    type: 'update',
                    map: {},
                    nsMap,
                    selection: action.at[0].start,
                    at: action.at,
                };
            }

            return {
                type: 'full-select',
                at: action.add ? state.at.concat(action.at) : action.at,
            };
        }
        case 'paste': {
            const res = paste(state, {}, action.items, false);
            // console.log(res);
            return res;
        }
        case 'meta':
            return action;
        case 'ns': {
            return {
                type: 'update',
                map: {},
                selection: action.selection ?? state.at[0].start,
                nsMap: action.nsMap,
            };
        }
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
            return moveNode(action.source, action.dest, state);
        case 'copy':
        case 'menu-select':
        case 'namespace-rename':
            return;
        default:
            const _: never = action;
    }
};

// export function bootstrapParse(
//     stmts: Node[],
//     results: CompilationResults & {
//         tops: {
//             [key: number]: {
//                 summary: string;
//                 data: Trace[];
//                 failed: boolean;
//                 expr?: any;
//             };
//         };
//         typs: { [loc: number]: any };
//     },
// ) {
//     return stmts
//         .filter((node) => node.type !== 'blank' && node.type !== 'comment')
//         .map((node) => {
//             const ctx = { errors: {}, display: results.display };
//             const stmt = parseStmt(node, ctx);
//             if (Object.keys(ctx.errors).length || !stmt) {
//                 console.log('unable to parse a stmt', ctx.errors, node);
//                 return;
//             }
//             (stmt as any).loc = node.loc;
//             return stmt;
//         })
//         .filter(filterNulls);
// }

// export function bootstrapEval(
//     parsed: stmt[],
//     env: { [key: string]: any },
//     produce: { [key: number]: string },
// ) {
//     parsed.forEach((stmt, i) => {
//         try {
//             if (stmt.type === 'sexpr') {
//                 try {
//                     const res = evalExpr(stmt[0], env);
//                     produce[(stmt as any).loc] += '\n' + valueToString(res);
//                 } catch (err) {
//                     console.error(err, stmt, i);
//                     produce[(stmt as any).loc] += (err as Error).message;
//                 }
//             }
//         } catch (err) {
//             produce[(stmt as any).loc] = (err as Error).message;
//         }
//     });
// }

// export function calcResults(
//     state: NUIState,
//     { builtins, getTrace, infer, parse, typToString }: Algo<any, any, any>,
//     doLayout = true,
// ) {
//     const tops = (state.map[state.root] as ListLikeContents).values;
//     const results: Ctx['results'] & {
//         tops: {
//             [key: number]: {
//                 summary: string;
//                 data: Trace[];
//                 failed: boolean;
//                 expr?: any;
//             };
//         };
//         typs: { [loc: number]: any };
//     } = {
//         display: {},
//         errors: {},
//         globalNames: {},
//         hashNames: {},
//         localMap: {
//             terms: {},
//             types: {},
//         },
//         mods: {},
//         toplevel: {},
//         tops: {},
//         typs: {},
//     };

//     tops.forEach((top) => {
//         const node = fromMCST(top, state.map);
//         const errors = {};
//         const expr = parse(node, { errors, display: results.display });
//         if (expr) {
//             try {
//                 const typ = infer(builtins, expr, {
//                     display: results.display,
//                     typs: results.typs,
//                 });
//                 const trace = getTrace();
//                 // console.log(typ);
//                 results.tops[top] = {
//                     summary: typToString(typ),
//                     data: trace,
//                     failed: false,
//                     expr,
//                 };
//             } catch (err) {
//                 // console.log('no typ sorry', err);
//                 results.tops[top] = {
//                     summary: 'Type Error: ' + (err as Error).message,
//                     data: getTrace(),
//                     failed: true,
//                 };
//             }
//         } else {
//             results.tops[top] = {
//                 summary: 'not parse: ' + Object.values(errors).join('; '),
//                 data: getTrace(),
//                 failed: true,
//             };
//         }

//         if (doLayout) {
//             layout(top, 0, state.map, results.display, results.hashNames, true);
//         }
//     });

//     return results;
// }

/**
 * Debounce a function.
 *
 * hm will this work
 */
export const debounce = <T,>(fn: (arg: T) => Promise<void>, time: number): ((arg: T) => void) => {
    let tid = null as null | Timer;
    let last = Date.now();
    let wait = null as null | Promise<void>;
    return async (arg: T) => {
        // console.log('called', arg);
        if (tid != null) {
            clearTimeout(tid);
            tid = null;
        }
        const now = Date.now();

        while (wait != null) {
            await wait;
            // console.log('waited');
        }

        if (now > last + time) {
            last = now;
            // console.log('calling immediate');
            wait = fn(arg);
            wait.then(() => (wait = null));
            return;
        }
        tid = setTimeout(() => {
            tid = null;
            last = now;
            // console.log('calling delayed');
            wait = fn(arg);
            wait.then(() => (wait = null));
        }, time);
    };
};

export const initialState = (): NUIState => {
    const map = emptyMap();
    return {
        map,
        root: -1,
        meta: {},
        history: [],
        nidx: () => 0,
        clipboard: [],
        hover: [],
        regs: {},
        at: [],
        cards: [{ path: [], top: 0 }],
        nsMap: {
            [0]: {
                id: 0,
                top: -1,
                children: [1],
                type: 'normal',
            },
            [1]: {
                id: 1,
                top: 0,
                children: [],
                type: 'normal',
            },
        },
    };
};

const stripCache = (cache?: ResultsCache<any>) => {
    if (!cache) return cache;
    return { ...cache, results: {}, lastState: null };
};

let saveQueue: { [key: string]: NUIState } = {};
let saving = false;

const listeners: Function[] = [];
export const onSaveState = (fn: Function) => {
    listeners.push(fn);
    return () => {
        const idx = listeners.indexOf(fn);
        if (idx !== -1) listeners.splice(idx, 1);
    };
};

export const saveState = async (id: string, state: NUIState, cache?: ResultsCache<any>): Promise<void> => {
    if (saving) {
        saveQueue[id] = state;
        return;
    }
    saving = true;
    listeners.forEach((f) => f(true));
    delete saveQueue[id];
    let ti = 0; // setTimeout(() => alert('Saving taking too long!'), 10000);
    let now = Date.now();
    try {
        const res = await fetch(urlForId(id), {
            method: 'POST',
            body: JSON.stringify(state),
            headers: { 'Content-type': 'application/json' },
        });
        listeners.forEach((f) => f(false));
        console.log(`saving took ${Date.now() - now}ms`);
        if (res.status !== 200) {
            alert(`Error ${res.status} while saving state! ${await res.text()}`);
        }
        clearTimeout(ti);
    } catch (err) {
        clearTimeout(ti);
        alert(`Error ${(err as Error).message} while saving state!`);
    }

    saving = false;
    const keys = Object.keys(saveQueue);
    if (keys.length) {
        return saveState(keys[0], saveQueue[keys[0]]);
    }
};

export function loadState(state: NUIState = initialState()) {
    console.log(`Loaded state, modified at: `, new Date(state.history[state.history.length - 1]?.ts).toLocaleTimeString());
    let idx =
        Object.keys(state.map)
            .concat(Object.keys(state.nsMap || {}))
            .reduce((a, b) => Math.max(a, +b), 0) + 1;

    if (!state.meta) {
        state.meta = {};
    }

    if (!state.nsMap) {
        state.nsMap = {};
        state.cards.forEach((card) => {
            const addNs = (ns: SandboxNamespace) => {
                ns.id = idx++;
                state.nsMap[ns.id] = ns;
                if (ns.type === 'normal') {
                    ns.children = ns.children.map(addNs as any);
                }
                return ns.id;
            };

            card.top = addNs((card as any).ns);
            delete (card as any)['ns'];
        });
    }

    return {
        ...state,
        nidx: () => idx++,
    };
}

export const stringify = (v: any, level: number, max: number): string => {
    if (level === max) {
        return JSON.stringify(v);
    }
    const id = white(level * 2);
    if (Array.isArray(v)) {
        if (!v.length) return '[]';
        return `[\n${v.map((n) => id + stringify(n, level + 1, max)).join('\n')}\n${white(level * 2 - 2)}]`;
    }
    if (v && typeof v === 'object') {
        const items = Object.entries(v);
        if (!items.length) return '{}';
        return `{\n${items.map(([k, v]) => id + `${k}: ${stringify(v, level + 1, max)}`).join('\n')}\n${white(level * 2 - 2)}}`;
    }
    return JSON.stringify(v);
};

export const reduce = (state: NUIState, action: Action, usages: Record<number, number[]>): NUIState => {
    if (action.type === 'undo' || action.type === 'redo') {
        return undoRedo(state, action.type);
    }
    if (action.type === 'yank') {
        return state;
    }
    if (action.type === 'jump-to-definition') {
        console.warn(`jump-to-definition should have been weeded out`);
        return state;
    }
    if (action.type === 'highlight') {
        return { ...state, highlight: calcHighlight(state, usages) };
    }
    if (action.type === 'clear-changes') {
        if (!state.trackChanges) return state;
        const tc: NUIState['trackChanges'] = {
            ...state.trackChanges,
            previous: { ...state.trackChanges.previous },
        };
        action.ids.forEach((id) => {
            delete tc.previous[id];
        });

        return { ...state, trackChanges: tc };
    }
    // console.time('actionToUpdate');
    const update = actionToUpdate(state, action);
    // console.timeEnd('actionToUpdate');
    if (!update) {
        // console.log(`Unable to turn action into update`, action);
        return state;
    }
    // console.time('reduce update');
    // console.log(update);
    const next = reduceUpdate(state, update);

    if (next.at != state.at) {
        next.highlight = calcHighlight(next, usages);
    }

    // console.timeEnd('reduce update');
    // console.time('calc history');
    const item = calcHistoryItem(state, next, '', action);
    // console.timeEnd('calc history');
    if (item) {
        next.history = state.history.concat([item]);
    }
    // TODO: this should be a "debug" thing that I can turn on...
    try {
        // verifyState(next);
        verifySelection(next);
    } catch (err) {
        console.warn(`Action failed`);
        console.log(action);
        console.log(update);
        console.log(item);
        console.error(err);
        return state;
    }
    return next;
};

export const traverseNS = (id: number, state: NUIState, fn: (ns: SandboxNamespace) => void) => {
    const ns = state.nsMap[id];
    fn(ns);
    if (ns.type === 'normal') {
        ns.children.forEach((id) => traverseNS(id, state, fn));
    }
};

export const verifyState = (state: NUIState) => {
    // const results = newResults();
    const all = findTops(state);
    all.map(({ top }) => {
        layout(top, 0, state.map, {}, {}, true);
    });

    const seen: { [key: number]: number } = {};
    for (let card of state.cards) {
        traverseNS(card.top, state, (ns) => {
            if (ns.type === 'normal') {
                if (seen[ns.top] != null) {
                    throw new Error(`top appears twice ${ns.top} - first in ${seen[ns.top]}, again in ${ns.id}`);
                }
                seen[ns.top] = ns.id;
            }
        });
    }

    verifySelection(state);
};

function verifySelection(state: NUIState) {
    state.at.forEach((cursor) => {
        try {
            verifyPath(cursor.start, state);
            if (cursor.end) {
                verifyPath(cursor.end, state);
            }
        } catch (err) {
            throw new Error(`${(err as Error).message}\n\nInvalid path:\n${cursor.start.map((path) => JSON.stringify(path)).join('\n')}`);
        }
    });
}

const calcHighlight = (state: NUIState, usages: Record<number, number[]>) => {
    const highlight: number[] = [];
    state.at.forEach((cursor) => {
        if (cursor.end) return;
        const last = cursor.start[cursor.start.length - 1];
        const node = state.map[last.idx];
        if (node?.type !== 'identifier') return;
        if (usages[node.loc]) {
            highlight.push(node.loc, ...usages[node.loc]);
            return;
        }
        for (let [prov, users] of Object.entries(usages)) {
            if (+prov === -1) continue;
            if (users.includes(node.loc)) {
                highlight.push(+prov, ...users);
                return;
            }
        }
    });
    return highlight;
};
