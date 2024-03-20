import { layout } from '../../../src/layout';
import {
    StateChange,
    StateSelect,
    StateUpdate,
    applyUpdate,
    getKeyUpdate,
    isRootPath,
} from '../../../src/state/getKeyUpdate';
import { CompilationResults, Ctx } from '../../../src/to-ast/library';
import {
    ListLikeContents,
    MNode,
    fromMCST,
    fromMNode,
} from '../../../src/types/mcst';
import {
    Action,
    NUIState,
    RealizedNamespace,
    SandboxNamespace,
    UpdatableAction,
} from '../../custom/UIState';
import {
    UIStateChange,
    calcHistoryItem,
    filterNulls,
    undoRedo,
} from '../../custom/reduce';
import { verticalMove } from '../../custom/verticalMove';
import { paste } from '../../../src/state/clipboard';
import { Algo, Trace } from '../infer/types';
import { evalExpr } from './round-1/bootstrap';
import { arr, parseStmt, stmt, type_, unwrapArray } from './round-1/parse';
import { Node } from '../../../src/types/cst';
import { useState, useEffect } from 'react';
import { emptyMap } from '../../../src/parse/parse';
import { eq_eq } from '../infer/mini/infer';
import { transformNode } from '../../../src/types/transform-cst';
import { newResults } from '../Test';
import { Path } from '../../store';

// const modifyNs = (
//     card: Card,
//     path: number[],
//     mod: (ns: RealizedNamespace) => void,
// ): Card | void => {
//     card = { ...card };
//     let ns = (card.ns = { ...card.ns, children: card.ns.children.slice() });
//     for (let at of path) {
//         const child = ns.children[at];
//         if (!child || child.type !== 'normal') {
//             console.log('bad child', at, ns, card);
//             return;
//         }
//         ns = ns.children[at] = { ...child };
//         ns.children = ns.children.slice();
//     }
//     mod(ns);
//     return card;
// };
// const applyNsUpdate = (
//     state: NUIState,
//     nsUpdate: NonNullable<StateUpdate['nsUpdate']>[0],
// ) => {
//     if (nsUpdate.type === 'rm') {
//         // const card = modifyNs(
//         //     state.cards[nsUpdate.path[0]],
//         //     nsUpdate.path.slice(1, -1),
//         //     (ns) => {
//         //         ns.children.splice(nsUpdate.path[nsUpdate.path.length - 1], 1);
//         //     },
//         // );
//         // if (!card) return;
//         // state.cards = state.cards.slice();
//         // state.cards[nsUpdate.path[0]] = card;
//         // state.nsMap
//     }
//     if (nsUpdate.type === 'add') {
//         // const card = modifyNs(
//         //     state.cards[nsUpdate.path[0]],
//         //     nsUpdate.path.slice(1, -1),
//         //     (ns) => {
//         //         ns.children.splice(
//         //             nsUpdate.path[nsUpdate.path.length - 1] +
//         //                 (nsUpdate.after ? 1 : 0),
//         //             0,
//         //             nsUpdate.ns,
//         //         );
//         //     },
//         // );
//         // if (!card) {
//         //     console.log('modfy ns failed');
//         //     return;
//         // }
//         // state.cards = state.cards.slice();
//         // state.cards[nsUpdate.path[0]] = card;
//     }
//     if (nsUpdate.type === 'replace') {
//         const last = nsUpdate.path[nsUpdate.path.length - 1];
//         const card = modifyNs(
//             state.cards[nsUpdate.path[0]],
//             nsUpdate.path.slice(1, -1),
//             (ns) => {
//                 const child = (ns.children[last] = { ...ns.children[last] });
//                 if (child.type === 'placeholder') return;
//                 if (nsUpdate.top != null) {
//                     child.top = nsUpdate.top;
//                 }
//                 if (nsUpdate.hidden != null) {
//                     child.hidden = nsUpdate.hidden;
//                 }
//                 if (nsUpdate.collapsed != null) {
//                     child.collapsed = nsUpdate.collapsed;
//                 }
//             },
//         );
//         if (!card) return;
//         state.cards = state.cards.slice();
//         state.cards[nsUpdate.path[0]] = card;
//     }
// };

export const reduceUpdate = (
    state: NUIState,
    update: StateChange | UIStateChange,
): NUIState => {
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
            console.log('met aupdate', meta);
            return { ...state, meta };
        }
        default:
            const _: never = update;
            throw new Error('nope update');
    }
};
export const actionToUpdate = (
    state: NUIState,
    action: UpdatableAction,
): StateChange | UIStateChange | void => {
    switch (action.type) {
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
                return verticalMove(
                    { ...state, menu: undefined },
                    action.key === 'ArrowUp',
                    action.mods,
                );
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
                    } else if (
                        result.type === 'select' &&
                        common.type === 'full-select'
                    ) {
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
        // case 'collapse':
        //     return action;
        // case 'namespace-rename':
        //     return action;
    }
};
export function bootstrapParse(
    stmts: Node[],
    results: CompilationResults & {
        tops: {
            [key: number]: {
                summary: string;
                data: Trace[];
                failed: boolean;
                expr?: any;
            };
        };
        typs: { [loc: number]: any };
    },
) {
    return stmts
        .filter((node) => node.type !== 'blank' && node.type !== 'comment')
        .map((node) => {
            const ctx = { errors: {}, display: results.display };
            const stmt = parseStmt(node, ctx);
            if (Object.keys(ctx.errors).length || !stmt) {
                console.log('unable to parse a stmt', ctx.errors, node);
                return;
            }
            (stmt as any).loc = node.loc;
            return stmt;
        })
        .filter(filterNulls);
}

export function addTypeConstructors(
    stmt: {
        type: 'sdeftype';
        0: string;
        1: arr<{ type: ','; 0: string; 1: arr<type_> }>;
    },
    env: { [key: string]: any },
) {
    unwrapArray(stmt[1]).forEach((constr) => {
        const cname = constr[0];
        const next = (args: arr<type_>) => {
            if (args.type === 'nil') {
                return (values: any[]) => ({
                    type: cname,
                    ...values,
                });
            }
            return (values: any[]) => (arg: any) =>
                next(args[1])([...values, arg]);
        };
        env[cname] = next(constr[1])([]);
    });
}
export function bootstrapEval(
    parsed: stmt[],
    env: { [key: string]: any },
    produce: { [key: number]: string },
) {
    parsed.forEach((stmt, i) => {
        try {
            if (stmt.type === 'sexpr') {
                try {
                    const res = evalExpr(stmt[0], env);
                    produce[(stmt as any).loc] += '\n' + valueToString(res);
                    // produce[(stmt as any).loc] +=
                    //     '\nJSON:' + JSON.stringify(stmt); //JSON.stringify(f());
                } catch (err) {
                    console.error(err, stmt, i);
                    produce[(stmt as any).loc] += (err as Error).message;
                }
            }
        } catch (err) {
            produce[(stmt as any).loc] = (err as Error).message;
        }
    });
}
export function selfCompileAndEval(
    parsed: stmt[],
    env: { [key: string]: any },
    total: string,
    produce: { [key: number]: string },
) {
    parsed.forEach((stmt, i) => {
        try {
            const res = env['compile-st'](stmt);
            if (stmt.type === 'sdef' || stmt.type === 'sdeftype') {
                try {
                    new Function('env', res);
                    total += res + '\n';
                } catch (err) {
                    produce[(stmt as any).loc] +=
                        'Self-compilation produced errors: ' +
                        (err as Error).message +
                        '\n\n' +
                        res; // '\njs: ' + res;
                }
                // produce[(stmt as any).loc] += '\njs: ' + res;
            } else if (stmt.type === 'sexpr') {
                const ok = total + '\nreturn ' + res + '}';
                // produce[(stmt as any).loc] += '\nself-eval: ' + res;
                // produce[(stmt as any).loc] += + '\nAST: ' + JSON.stringify(stmt);
                let f;
                try {
                    f = new Function('env', ok);
                } catch (err) {
                    produce[(stmt as any).loc] +=
                        `Error self-compiling: ` +
                        (err as Error).message +
                        '\n\n' +
                        ok;
                    console.log(ok);
                    return;
                }
                try {
                    produce[(stmt as any).loc] += '\n' + valueToString(f(env));
                } catch (err) {
                    console.error(err, stmt, i);
                    produce[(stmt as any).loc] +=
                        `Error evaluating (self-compiled): ` +
                        (err as Error).message;
                }
            }
        } catch (err) {
            console.error(err);
            produce[(stmt as any).loc] += (err as Error).message;
        }
    });
}
export function extractBuiltins(raw: string) {
    const names: string[] = getConstNames(raw);
    let res: any;
    try {
        res = new Function('', raw + `\nreturn {${names.join(', ')}}`)();
    } catch (err) {
        console.log('Failed to extract builtins');
        console.error(err);
        console.log(raw);
        return {};
    }
    Object.keys(res).forEach((name) => {
        let desan = name;
        Object.entries(res.sanMap).forEach(([key, value]) => {
            desan = desan.replaceAll(value as string, key);
        });
        res[desan] = res[name];
    });
    return res;
}
function getConstNames(raw: any) {
    const names: string[] = [];
    (raw as string).replaceAll(/^const ([a-zA-Z0-9_$]+)/gm, (v, name) => {
        names.push(name);
        return '';
    });
    return names;
}

export function calcResults(
    state: NUIState,
    { builtins, getTrace, infer, parse, typToString }: Algo<any, any, any>,
    doLayout = true,
) {
    const tops = (state.map[state.root] as ListLikeContents).values;
    const results: Ctx['results'] & {
        tops: {
            [key: number]: {
                summary: string;
                data: Trace[];
                failed: boolean;
                expr?: any;
            };
        };
        typs: { [loc: number]: any };
    } = {
        display: {},
        errors: {},
        globalNames: {},
        hashNames: {},
        localMap: {
            terms: {},
            types: {},
        },
        mods: {},
        toplevel: {},
        tops: {},
        typs: {},
    };

    tops.forEach((top) => {
        const node = fromMCST(top, state.map);
        const errors = {};
        const expr = parse(node, { errors, display: results.display });
        if (expr) {
            try {
                const typ = infer(builtins, expr, {
                    display: results.display,
                    typs: results.typs,
                });
                const trace = getTrace();
                // console.log(typ);
                results.tops[top] = {
                    summary: typToString(typ),
                    data: trace,
                    failed: false,
                    expr,
                };
            } catch (err) {
                // console.log('no typ sorry', err);
                results.tops[top] = {
                    summary: 'Type Error: ' + (err as Error).message,
                    data: getTrace(),
                    failed: true,
                };
            }
        } else {
            results.tops[top] = {
                summary: 'not parse: ' + Object.values(errors).join('; '),
                data: getTrace(),
                failed: true,
            };
        }

        if (doLayout) {
            layout(top, 0, state.map, results.display, results.hashNames, true);
        }
    });

    return results;
}
export const valueToString = (v: any): string => {
    if (Array.isArray(v)) {
        return `[${v.map(valueToString).join(', ')}]`;
    }

    if (typeof v === 'object' && v && 'type' in v) {
        if (v.type === 'cons' || v.type === 'nil') {
            const un = unwrapArray(v);
            return '[' + un.map(valueToString).join(' ') + ']';
        }

        let args = [];
        for (let i = 0; i in v; i++) {
            args.push(v[i]);
        }
        return `(${v.type}${args
            .map((arg) => ' ' + valueToString(arg))
            .join('')})`;
    }
    if (typeof v === 'string') {
        if (v.includes('"') && !v.includes("'")) {
            return (
                "'" + JSON.stringify(v).slice(1, -1).replace(/\\"/g, '"') + "'"
            );
        }
        return JSON.stringify(v); // + 'umraw' + v;
    }
    if (typeof v === 'function') {
        return '<function>';
    }

    return '' + v;
};
/**
 * Debounce a function.
 *
 * hm will this work
 */
export const debounce = <T,>(
    fn: (arg: T) => Promise<void>,
    time: number,
): ((arg: T) => void) => {
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
const initialState = (): NUIState => {
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
export const urlForId = (id: string) => `http://localhost:9189/tmp/${id}`;
export const saveState = async (id: string, state: NUIState) => {
    const res = await fetch(urlForId(id), {
        method: 'POST',
        body: JSON.stringify(state),
        headers: { 'Content-type': 'application/json' },
    });
    if (res.status !== 200) {
        alert(`Error ${res.status} while saving state! ${await res.text()}`);
    }
};
export function loadState(state: NUIState = initialState()) {
    console.log(
        `Loaded state, modified at: `,
        new Date(
            state.history[state.history.length - 1]?.ts,
        ).toLocaleTimeString(),
    );
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
export const useHash = (): string => {
    const [hash, update] = useState(location.hash);
    useEffect(() => {
        const fn = () => {
            update(location.hash);
        };
        window.addEventListener('hashchange', fn);
        return () => window.removeEventListener('hashchange', fn);
    }, []);
    return hash;
};
export const white = (n: number) => ''.padStart(n, ' ');

export const stringify = (v: any, level: number, max: number): string => {
    if (level === max) {
        return JSON.stringify(v);
    }
    const id = white(level * 2);
    if (Array.isArray(v)) {
        if (!v.length) return '[]';
        return `[\n${v
            .map((n) => id + stringify(n, level + 1, max))
            .join('\n')}\n${white(level * 2 - 2)}]`;
    }
    if (v && typeof v === 'object') {
        const items = Object.entries(v);
        if (!items.length) return '{}';
        return `{\n${items
            .map(([k, v]) => id + `${k}: ${stringify(v, level + 1, max)}`)
            .join('\n')}\n${white(level * 2 - 2)}}`;
    }
    return JSON.stringify(v);
};

export const reduce = (state: NUIState, action: Action): NUIState => {
    if (action.type === 'undo' || action.type === 'redo') {
        return undoRedo(state, action.type);
    }
    if (action.type === 'yank') {
        return state;
    }
    const update = actionToUpdate(state, action);
    if (!update) {
        console.log(`Unable to turn action into update`, action);
        return state;
    }
    const next = reduceUpdate(state, update);
    const item = calcHistoryItem(state, next, '', action);
    if (item) {
        next.history = state.history.concat([item]);
    }
    try {
        verifyState(next);
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

export const traverseNS = (
    id: number,
    state: NUIState,
    fn: (ns: SandboxNamespace) => void,
) => {
    const ns = state.nsMap[id];
    fn(ns);
    if (ns.type === 'normal') {
        ns.children.forEach((id) => traverseNS(id, state, fn));
    }
};

export const verifyState = (state: NUIState) => {
    const results = newResults();
    const all = findTops(state);
    all.map(({ top }) => {
        layout(top, 0, state.map, results.display, results.hashNames, true);
    });

    const seen: { [key: number]: number } = {};
    for (let card of state.cards) {
        traverseNS(card.top, state, (ns) => {
            if (ns.type === 'normal') {
                if (seen[ns.top] != null) {
                    throw new Error(
                        `top appears twice ${ns.top} - first in ${
                            seen[ns.top]
                        }, again in ${ns.id}`,
                    );
                }
                seen[ns.top] = ns.id;
            }
        });
    }

    state.at.forEach((cursor) => {
        try {
            verifyPath(cursor.start, state);
            if (cursor.end) {
                verifyPath(cursor.end, state);
            }
        } catch (err) {
            throw new Error(
                `${(err as Error).message}\n\nInvalid path:\n${cursor.start
                    .map((path) => JSON.stringify(path))
                    .join('\n')}`,
            );
        }
    });
};

export const verifyPath = (path: Path[], state: NUIState) => {
    if (path.length < 2) throw new Error(`path of length ${path.length}`);
    if (path[0].type !== 'card') throw new Error('first not a card');
    const card = state.cards[path[0].card];
    if (card.top !== path[1].idx) {
        throw new Error(`path card top : ${card.top} vs ${path[1].idx}`);
    }
    if (path[1].type !== 'ns') throw new Error('not ns');
    let ns = state.nsMap[card.top];
    // let ns = (state.nsMap[card.top] as RealizedNamespace).children[path[1].at]
    // state.nsMap[path[1].at]
    let i = 1;
    let node: MNode | null = null;
    for (; i < path.length; i++) {
        if (!ns || ns.type !== 'normal') throw new Error('placeholder ns');
        if (path[i].idx !== ns.id) {
            throw new Error(`ns ${i} - ${ns.id} vs ${path[i].idx}`);
        }
        const p = path[i];
        if (p.type === 'ns') {
            ns = state.nsMap[ns.children[p.at]];
            continue;
        }
        if (path[i].type === 'ns-top') {
            node = state.map[ns.top];
            i++;
            break;
        }
    }
    if (!node) {
        throw new Error('no node');
    }
    for (; i < path.length; i++) {
        const p = path[i];
        if (node.loc !== p.idx) {
            throw new Error(
                `Node loc doesn't match path(${i}) idx node:${
                    node.loc
                } vs path:${p.idx} - ${JSON.stringify(p)}`,
            );
        }
        try {
            node = advance(p, node, state, i === path.length - 1);
            if (!node) throw new Error(`Node returned doesn't exist...`);
        } catch (err) {
            throw new Error(
                `Bad path item ${i} : ${JSON.stringify(p)}\n${
                    (err as Error).message
                }`,
            );
        }
    }
};

const advance = (p: Path, node: MNode, state: NUIState, isLast: boolean) => {
    switch (p.type) {
        case 'ns':
        case 'card':
        case 'ns-top':
            throw new Error('invalid placement ' + p.type);
        case 'child':
            if (!('values' in node)) {
                throw new Error(`child, of node ${node.type}`);
            }
            return state.map[node.values[p.at]];
        case 'text':
            if (node.type !== 'string') {
                throw new Error(`node not string ${node.type}`);
            }
            if (p.at === 0) {
                return state.map[node.first];
            }
            if (p.at > node.templates.length) {
                throw new Error(
                    `not enough templates ${node.templates.length} vs text@${p.at}`,
                );
            }
            return state.map[node.templates[p.at - 1].suffix];
        case 'expr':
            if (node.type !== 'string') {
                throw new Error(`node not string ${node.type}`);
            }
            if (p.at === 0) {
                throw new Error(`cant do expr@0 in string`);
            }
            if (p.at > node.templates.length) {
                throw new Error(
                    `not enough templates ${node.templates.length} vs text@${p.at}`,
                );
            }
            return state.map[node.templates[p.at - 1].expr];
        case 'attribute':
            if (node.type === 'recordAccess') {
                return state.map[node.items[p.at - 1]];
            }
        case 'annot-annot':
        case 'annot-target':
        case 'tapply-target':
        case 'record-target':
            throw new Error(`not handled atm node=${node.type} path=${p.type}`);
        case 'spread-contents':
            if (!('contents' in node)) {
                throw new Error(`contents? ${node.type}`);
            }
            return state.map[node.contents];
        // return;
        case 'rich-text':
        case 'subtext':
        case 'inside':
        case 'start':
        case 'end':
            if (!isLast) {
                throw new Error(`non terminal ${p.type}`);
            }
            return node;
    }
};

export const findTops = (state: Pick<NUIState, 'cards' | 'nsMap' | 'map'>) => {
    let all: {
        top: number;
        hidden?: boolean;
        path: Path[];
        plugin?: RealizedNamespace['plugin'];
    }[] = [];
    const seen: { [top: number]: boolean } = { [-1]: true };
    const add = (id: number, path: Path[]) => {
        const ns = state.nsMap[id];
        if (ns.type === 'normal') {
            if (!seen[ns.top]) {
                seen[ns.top] = true;
                all.push({
                    top: ns.top,
                    hidden: ns.hidden,
                    path: [...path, { type: 'ns-top', idx: id }],
                    plugin: ns.plugin,
                });
            }
            ns.children.forEach((child, i) =>
                add(child, [
                    ...path,
                    {
                        type: 'ns',
                        at: i,
                        idx: id,
                    },
                ]),
            );
        }
    };
    state.cards.forEach((card, i) =>
        add(card.top, [{ type: 'card', idx: -1, card: i }]),
    );

    return all;
};
