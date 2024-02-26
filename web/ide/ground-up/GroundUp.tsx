import React, { useEffect, useMemo, useReducer, useState } from 'react';
import { layout } from '../../../src/layout';
import { emptyMap } from '../../../src/parse/parse';
import {
    StateChange,
    applyUpdate,
    getKeyUpdate,
    isRootPath,
} from '../../../src/state/getKeyUpdate';
import { CompilationResults, Ctx } from '../../../src/to-ast/library';
import { ListLikeContents, fromMCST } from '../../../src/types/mcst';
import { Cursors } from '../../custom/Cursors';
import { HiddenInput } from '../../custom/HiddenInput';
import { Hover } from '../../custom/Hover';
import { Root } from '../../custom/Root';
import { Action, NUIState, UpdatableAction } from '../../custom/UIState';
import { UIStateChange, calcHistoryItem, undoRedo } from '../../custom/reduce';
import { verticalMove } from '../../custom/verticalMove';

import { paste } from '../../../src/state/clipboard';
import { useLocalStorage } from '../../Debug';
import { newResults } from '../Test';
import { Algo, Trace } from '../infer/types';
import { evalExpr } from './round-1/bootstrap';
import { sanitize } from './round-1/builtins';
import { arr, parseStmt, stmt, type_, unwrapArray } from './round-1/parse';
import { Node } from '../../../src/types/cst';

const urlForId = (id: string) => `http://localhost:9189/tmp/${id}`;

const saveState = (id: string, state: NUIState) => {
    return fetch(urlForId(id), {
        method: 'POST',
        body: JSON.stringify(state),
        headers: { 'Content-type': 'application/json' },
    }).then(() => {});
};

function loadState(
    state: NUIState = {
        map: emptyMap(),
        root: -1,
        collapse: {},
        history: [],
        nidx: () => 0,
        clipboard: [],
        hover: [],
        regs: {},
        at: [],
    },
) {
    let idx = Object.keys(state.map).reduce((a, b) => Math.max(a, +b), 0) + 1;
    return {
        // collapse: {},
        ...state,
        nidx: () => idx++,
    };
}

const useHash = (): string => {
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

export const Outside = () => {
    const [listing, setListing] = useState(null as null | string[]);
    const hash = useHash();

    useEffect(() => {
        fetch(urlForId(''))
            .then((res) => res.json())
            .then(setListing);
    }, []);

    const [name, setName] = useState('');

    if (hash) {
        return (
            <div>
                <div>
                    {listing
                        ?.filter((k) => !k.endsWith('.clj'))
                        .map((name) => (
                            <a
                                href={'#' + name}
                                key={name}
                                style={{
                                    display: 'inline-block',
                                    padding: '8px 16px',
                                    color:
                                        hash === '#' + name
                                            ? 'yellow'
                                            : 'white',
                                }}
                            >
                                {name}
                            </a>
                        ))}
                    <a
                        href={'#'}
                        style={{
                            display: 'inline-block',
                            padding: '8px 16px',
                            color: 'white',
                        }}
                    >
                        Close
                    </a>
                </div>
                <Loader id={hash.slice(1)} key={hash.slice(1)} />
            </div>
        );
    }

    return (
        <div>
            <h3 style={{ paddingLeft: 24 }}>Pick a file to open</h3>
            <div>
                {listing
                    ?.filter((k) => !k.endsWith('.clj'))
                    .map((name) => (
                        <a
                            href={'#' + name}
                            key={name}
                            style={{
                                padding: '8px 16px',
                                color: 'white',
                                display: 'inline-block',
                            }}
                        >
                            {name}
                        </a>
                    ))}
                <div
                    style={{
                        padding: '8px 16px',
                    }}
                >
                    <input
                        value={name}
                        onChange={(evt) => setName(evt.target.value)}
                        placeholder="New file name"
                    />

                    <a
                        href={name ? `#${name}` : ''}
                        style={{
                            padding: '8px 16px',
                            color: name.length ? 'white' : '#aaa',
                            cursor: name.length ? 'pointer' : 'not-allowed',
                        }}
                    >
                        New File
                    </a>
                </div>
            </div>
        </div>
    );
};

export const Loader = ({ id }: { id: string }) => {
    const save = useMemo(
        () => debounce<NUIState>((state) => saveState(id, state), 500),
        [id],
    );

    const [initial, setInitial] = useState(null as null | NUIState);

    useEffect(() => {
        fetch(urlForId(id)).then(
            (res) =>
                res.status === 200
                    ? res.json().then((state) => {
                          setInitial(loadState(state));
                      })
                    : setInitial(loadState()),
            (err) => {
                setInitial(loadState());
            },
        );
    }, [id]);

    if (!initial) return <div>Loading...</div>;

    return (
        <div>
            <GroundUp id={id} save={save} initial={initial} />
        </div>
    );
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

export const GroundUp = ({
    id,
    initial,
    save,
}: {
    id: string;
    initial: NUIState;
    save: (state: NUIState) => void;
}) => {
    const [state, dispatch] = useReducer(reduce, null, (): NUIState => initial);

    const [debug, setDebug] = useState(true);

    useEffect(() => {
        save({ ...state, regs: {} });
    }, [state.map, id]);

    const all = (state.map[state.root] as ListLikeContents).values;
    const tops = all.filter((t) => !state.collapse[t]);
    const collapsed = all.filter((t) => state.collapse[t]);

    const { produce: evaluated, results } = useMemo(() => {
        const results = newResults();
        const produce: { [key: number]: string } = {};
        all.forEach((t) => (produce[t] = ''));
        try {
            const stmts = all.map((t) => fromMCST(t, state.map));
            const env: { [key: string]: any } = {
                '+': (a: number) => (b: number) => a + b,
                'replace-all': (a: string) => (b: string) => (c: string) =>
                    a.replaceAll(b, c),
            };
            const parsed = bootstrapParse(stmts, results);

            parsed.forEach((stmt) => {
                if (stmt.type === 'sdeftype') {
                    results.tops[(stmt as any).loc] = {
                        summary: stmt[0],
                        data: [],
                        failed: false,
                    };
                    addTypeConstructors(stmt, env);
                    produce[(stmt as any).loc] = `type with ${
                        unwrapArray(stmt[1]).length
                    } constructors`;
                    return;
                }
                if (stmt.type === 'sdef') {
                    results.tops[(stmt as any).loc] = {
                        summary: stmt[0],
                        data: [],
                        failed: false,
                    };
                    const res = evalExpr(stmt[1], env);
                    env[stmt[0]] = res;
                    produce[(stmt as any).loc] =
                        typeof res === 'function'
                            ? `<function>`
                            : JSON.stringify(res);
                    // produce[(stmt as any).loc] +=
                    //     '\n\nAST: ' + JSON.stringify(stmt);
                    if (stmt[0] === 'builtins') {
                        Object.assign(env, extractBuiltins(res));
                    }
                }
            });

            if (env['compile-st']) {
                let prelude = '';
                prelude += `const {${Object.keys(env)
                    .filter((k) => sanitize(k) === k)
                    .join(', ')}} = env;\n{`;

                selfCompileAndEval(parsed, env, prelude, produce);
            } else {
                bootstrapEval(parsed, env, produce);
            }
        } catch (err) {
            console.error('Something didnt work', err);
        }

        all.map((top) => {
            layout(top, 0, state.map, results.display, results.hashNames, true);
        });

        return { produce, results };
    }, [state.map]);

    const start = state.at.length ? state.at[0].start : null;
    const selTop = start?.[1].idx;

    return (
        <div>
            <HiddenInput
                display={results.display}
                state={state}
                dispatch={dispatch}
                menu={undefined}
                hashNames={{}}
            />
            <div style={{ display: 'flex' }}>
                {collapsed.map((top, i) => (
                    <div
                        key={i}
                        style={{ margin: 4 }}
                        onClick={() => {
                            dispatch({ type: 'collapse', top });
                        }}
                    >
                        {results.tops[top]?.summary ?? top}
                    </div>
                ))}
            </div>
            <Root
                state={state}
                dispatch={dispatch}
                tops={tops}
                debug={false}
                clickTop={(top) => dispatch({ type: 'collapse', top })}
                showTop={(top) =>
                    debug ? (
                        <pre style={{ whiteSpace: 'pre-wrap' }}>
                            {evaluated[top] || 'not evaluated'}
                        </pre>
                    ) : (
                        top
                    )
                }
                results={results}
            />
            <button
                onClick={() => setDebug(!debug)}
                style={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                }}
            >
                {debug ? 'Debug on' : 'Debug off'}
            </button>
            <Hover
                state={state}
                dispatch={dispatch}
                calc={() => {
                    // for (let i = state.hover.length - 1; i >= 0; i--) {
                    //     const last = state.hover[i].idx;
                    //     const typ = results.typs[last];
                    //     if (typ) {
                    //         return [{ idx: last, text: typToString(typ) }];
                    //     }
                    // }
                    return [];
                }}
            />
            <Cursors at={state.at} regs={state.regs} />
            {/* {selTop ? JSON.stringify(results.tops[selTop].data) : null} */}
            {/* {selTop != null ? <ViewJson v={results.tops[selTop].data} /> : null} */}
            {/* {JSON.stringify(state.at)} */}
            {/* <div>{JSON.stringify(state.hover)}</div> */}
        </div>
    );
};

export const white = (n: number) => ''.padStart(n, ' ');

const stringify = (v: any, level: number, max: number): string => {
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

const ViewJson = ({ v }: { v: any[] }) => {
    const [level, setLevel] = useLocalStorage('view-json', () => 1);
    return (
        <div>
            <input
                type="range"
                min="1"
                max="30"
                style={{ width: 400 }}
                value={level}
                onChange={(evt) => setLevel(+evt.target.value)}
            />
            {v.map((item, i) => (
                <pre key={i}>{stringify(item, 1, 1 + level)}</pre>
            ))}
        </div>
    );
};

export const reduce = (state: NUIState, action: Action): NUIState => {
    if (action.type === 'undo' || action.type === 'redo') {
        return undoRedo(state, action.type);
    }
    if (action.type === 'yank') {
        return state;
    }
    // if (action.type === 'reset') {
    //     return action.state;
    // }
    const update = actionToUpdate(state, action);
    if (!update) {
        return state;
    }
    const next = reduceUpdate(state, update);
    const item = calcHistoryItem(state, next, '');
    if (item) {
        next.history = state.history.concat([item]);
    }
    return next;
};

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
            return state;
        case 'namespace-rename':
            console.warn('ignoring namespace rename');
            return state;
        case 'collapse':
            return {
                ...state,
                collapse: {
                    ...state.collapse,
                    [update.top]: !state.collapse[update.top],
                },
            };
        // return state;
        default:
            const _: never = update;
            throw new Error('nope update');
    }
};

const actionToUpdate = (
    state: NUIState,
    action: UpdatableAction,
): StateChange | UIStateChange | void => {
    switch (action.type) {
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
                state.at[0],
                // TODO do I want some hashnames?
                {},
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
            const res = paste(state, {}, action.items, false);
            // console.log(res);
            return res;
        }
        case 'collapse':
            return action;
        // case 'namespace-rename':
        //     return action;
    }
};

function bootstrapParse(
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
        .filter((node) => node.type !== 'blank')
        .map((node) => {
            const ctx = { errors: {}, display: results.display };
            const stmt = parseStmt(node, ctx);
            if (Object.keys(ctx.errors).length || !stmt) {
                console.log('unable to parse a stmt', ctx.errors);
                return;
            }
            (stmt as any).loc = node.loc;
            return stmt;
        })
        .filter((x): x is NonNullable<typeof x> => x != null);
}

function addTypeConstructors(
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

function bootstrapEval(
    parsed: stmt[],
    env: { [key: string]: any },
    produce: { [key: number]: string },
) {
    parsed.forEach((stmt) => {
        try {
            if (stmt.type === 'sexpr') {
                try {
                    const res = evalExpr(stmt[0], env);
                    produce[(stmt as any).loc] += '\n' + valueToString(res);
                    produce[(stmt as any).loc] +=
                        '\nJSON:' + JSON.stringify(stmt); //JSON.stringify(f());
                } catch (err) {
                    console.error(err);
                    produce[(stmt as any).loc] += (err as Error).message;
                }
            }
        } catch (err) {
            produce[(stmt as any).loc] = (err as Error).message;
        }
    });
}

function selfCompileAndEval(
    parsed: stmt[],
    env: { [key: string]: any },
    total: string,
    produce: { [key: number]: string },
) {
    parsed.forEach((stmt) => {
        try {
            const res = env['compile-st'](stmt);
            if (stmt.type === 'sdef' || stmt.type === 'sdeftype') {
                total += res + '\n';
                try {
                    new Function('env', res);
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
                    console.error(err);
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

function extractBuiltins(raw: string) {
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

const valueToString = (v: any): string => {
    if (Array.isArray(v)) {
        return `[${v.map(valueToString).join(', ')}]`;
    }

    if (typeof v === 'object' && v && 'type' in v) {
        let args = [];
        for (let i = 0; i in v; i++) {
            args.push(v[i]);
        }
        return `(${v.type}${args
            .map((arg) => ' ' + valueToString(arg))
            .join('')})`;
    }
    if (typeof v === 'string') {
        return JSON.stringify(v); // + 'umraw' + v;
    }

    return '' + v;
};
