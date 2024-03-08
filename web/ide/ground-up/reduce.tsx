import { layout } from '../../../src/layout';
import {
    StateChange,
    applyUpdate,
    getKeyUpdate,
    isRootPath,
} from '../../../src/state/getKeyUpdate';
import { CompilationResults, Ctx } from '../../../src/to-ast/library';
import { ListLikeContents, fromMCST, fromMNode } from '../../../src/types/mcst';
import {
    Action,
    NUIState,
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
        case 'key':
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
            return getKeyUpdate(
                action.key,
                state.map,
                state.nsMap,
                state.cards,
                state.at[0],
                // TODO do I want some hashnames?
                {},
                state.nidx,
                action.mods,
                state.regs,
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
            const res = paste(state, {}, action.items, false);
            // console.log(res);
            return res;
        }
        case 'ns': {
            return {
                type: 'update',
                map: {},
                selection: action.selection ?? state.at[0].start,
                nsMap: action.nsMap,
            };
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
    const res = new Function('', raw + `\nreturn {${names.join(', ')}}`)();
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
 */

export const debounce = <T,>(
    fn: (arg: T) => Promise<void>,
    time: number,
): ((arg: T) => void) => {
    let tid = null as null | NodeJS.Timeout;
    let last = Date.now();
    let wait = null as null | Promise<void>;
    return async (arg: T) => {
        // console.log('called', arg);
        if (tid != null) {
            clearTimeout(tid);
            tid = null;
        }
        const now = Date.now();

        if (wait) {
            await wait;
            // console.log('waited');
        }

        if (now > last + time) {
            last = now;
            // console.log('calling immediate');
            wait = fn(arg);
            return;
        }
        tid = setTimeout(() => {
            tid = null;
            last = now;
            // console.log('calling delayed');
            wait = fn(arg);
        }, time);
    };
};
const initialState = (): NUIState => {
    const map = emptyMap();
    return {
        map,
        root: -1,
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
export const saveState = (id: string, state: NUIState) => {
    return fetch(urlForId(id), {
        method: 'POST',
        body: JSON.stringify(state),
        headers: { 'Content-type': 'application/json' },
    }).then(() => {});
};
export function loadState(state: NUIState = initialState()) {
    let idx =
        Object.keys(state.map)
            .concat(Object.keys(state.nsMap || {}))
            .reduce((a, b) => Math.max(a, +b), 0) + 1;

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
};

export const findTops = (state: NUIState) => {
    let all: { top: number; hidden?: boolean }[] = [];
    const seen: { [top: number]: boolean } = { [-1]: true };
    const add = (id: number) => {
        const ns = state.nsMap[id];
        if (ns.type === 'normal') {
            if (!seen[ns.top]) {
                seen[ns.top] = true;
                all.push({
                    top: ns.top,
                    hidden: ns.hidden || ns.plugin != null,
                });
            }
            ns.children.forEach(add);
        }
    };
    state.cards.forEach((card) => add(card.top));

    return all;
};
