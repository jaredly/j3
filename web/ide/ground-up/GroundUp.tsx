import React, { useEffect, useMemo, useReducer, useState } from 'react';
import { layout } from '../../../src/layout';
import { fromMCST } from '../../../src/types/mcst';
import { Cursors, isValidCursorLocation } from '../../custom/Cursors';
import { HiddenInput } from '../../custom/HiddenInput';
import { Hover } from '../../custom/Hover';
import { NUIState } from '../../custom/UIState';

import { Display } from '../../../src/to-ast/library';
import { CardRoot } from '../../custom/CardRoot';
import { FullEvalator, bootstrap, repr } from './Evaluators';
import { findTops, reduce, urlForId, valueToString } from './reduce';
import { goLeftUntil } from '../../../src/state/navigate';
import { Path } from '../../store';
import { parseExpr, parseStmt, stmt } from './round-1/parse';
import { sanitize } from './round-1/builtins';
import { WithStore, useStore } from '../../custom/Store';

export type Results = {
    display: Display;
    errors: { [key: string]: string[] };
    hashNames: { [idx: number]: string };
};

const loadEv = async (
    id: string,
): Promise<void | FullEvalator<any, any, any>> => {
    const res = await fetch(urlForId(id) + '.js');
    if (res.status !== 200) return console.log('Nope', res.status);
    const data = new Function(await res.text())();
    if (data.type === 'full') {
        return data;
    }
    if (data.type === 'bootstrap') {
        let benv = bootstrap.init();
        data.stmts.forEach((stmt: any) => {
            benv = bootstrap.addStatement(stmt, benv).env;
        });
        const san: { [key: string]: any } = {};
        Object.entries(benv).forEach(([k, v]) => (san[sanitize(k)] = v));
        const envArgs = '{' + Object.keys(san).join(', ') + '}';
        return {
            init() {
                return [];
            },
            addStatement(stmt: stmt, env: string[]) {
                if (stmt.type === 'sdef' || stmt.type === 'sdeftype') {
                    try {
                        env.push(benv['compile-st'](stmt));
                        return { env, display: 'compiled.' };
                    } catch (err) {
                        console.error(err);
                        return {
                            env,
                            display: 'Failed ' + (err as Error).message,
                        };
                    }
                }
                if (stmt.type === 'sexpr') {
                    let raw;
                    try {
                        raw = benv['compile-st'](stmt);
                    } catch (err) {
                        console.error(err);
                        return {
                            env,
                            display:
                                'Compilation failed: ' + (err as Error).message,
                        };
                    }
                    try {
                        const res = new Function(
                            envArgs,
                            '{' + env.join('\n') + '\nreturn ' + raw + '}',
                        )(san);
                        return { env, display: valueToString(res) };
                    } catch (err) {
                        console.log(envArgs);
                        console.log(raw);
                        console.error(err);
                        return {
                            env,
                            display:
                                'Error evaluating! ' +
                                (err as Error).message +
                                '\n' +
                                raw,
                        };
                    }
                }
                return { env, display: 'idk' };
            },
            parse(node, errors) {
                const ctx = { errors, display: {} };
                const stmt = parseStmt(node, ctx) as stmt & { loc: number };
                if (Object.keys(ctx.errors).length || !stmt) {
                    return;
                }
                stmt.loc = node.loc;
                return stmt;
            },
            parseExpr(node, errors) {
                const ctx = { errors, display: {} };
                return parseExpr(node, ctx);
            },
            evaluate(expr, env) {
                let raw;
                try {
                    raw = benv['compile'](expr);
                } catch (err) {
                    console.error(err);
                    return 'Compilation failed: ' + (err as Error).message;
                }
                try {
                    const res = new Function(
                        envArgs,
                        '{' + env.join('\n') + '\nreturn ' + raw + '}',
                    )(san);
                    return res;
                } catch (err) {
                    console.log(raw);
                    console.error(err);
                    return (
                        'Error evaluating! ' + (err as Error).message
                        // '\n' +
                        // raw
                    );
                }
            },
        };
        // first we have to pass everything through the bootstrapping.
    }
    // we have `compile-st` and `compile`.
    // ELSE do ... a thing
};

const useEvaluator = (name?: string) => {
    const [evaluator, setEvaluator] = useState(
        (): FullEvalator<any, any, any> | null | void => {
            switch (name) {
                case ':bootstrap:':
                    return bootstrap;
                case ':repr:':
                    return repr;
            }
            return null;
        },
    );

    useEffect(() => {
        if (name?.endsWith('.json')) {
            loadEv(name).then(setEvaluator);
        } else {
            switch (name) {
                case ':bootstrap:':
                    setEvaluator(bootstrap);
                    break;
                case ':repr:':
                    setEvaluator(repr);
                    break;
            }
        }
    }, [name]);

    return evaluator;
};

export const GroundUp = ({
    id,
    initial,
    save,
    listing,
}: {
    id: string;
    initial: NUIState;
    listing: string[] | null;
    save: (state: NUIState) => void;
}) => {
    const [state, dispatch] = useReducer(reduce, null, (): NUIState => initial);

    const [debug, setDebug] = useState(true);

    const evaluator = useEvaluator(state.evaluator);
    // const evaluator: FullEvalator<any, any, any> | undefined = useMemo(() => {
    //     switch (state.evaluator) {
    //         case ':bootstrap:':
    //             return bootstrap;
    //         case ':repr:':
    //             return repr;
    //     }
    // }, [state.evaluator]);

    useEffect(() => {
        save({ ...state, regs: {} });
    }, [state.map, id]);

    const { produce, results, env } = useMemo(() => {
        const results: Results = { display: {}, errors: {}, hashNames: {} };
        const produce: { [key: string]: JSX.Element | string } = {};
        // if (!evaluator) return { produce, results, env: null };

        let env = evaluator?.init();
        findTops(state).forEach(({ top, hidden }) => {
            if (hidden) return;
            // console.log('process top', top);
            const stmt = fromMCST(top, state.map);
            if (stmt.type === 'blank') {
                produce[stmt.loc] = ' ';
                return;
            }
            if (evaluator) {
                const errs: Results['errors'] = {};
                const ast = evaluator.parse(stmt, errs);
                Object.assign(results.errors, errs);
                if (ast) {
                    const res = evaluator.addStatement(ast, env!);
                    env = res.env;
                    produce[stmt.loc] = res.display;
                    // console.log('good', res.display);
                } else {
                    console.log('not parsed');
                    produce[stmt.loc] = 'not parsed ' + JSON.stringify(errs);
                }
            } else {
                produce[stmt.loc] = 'No evaluator';
            }

            layout(top, 0, state.map, results.display, results.hashNames, true);
        });

        return { results, produce, env };
    }, [state.map, state.nsMap, state.cards, evaluator]);

    const store = useStore(state, results, dispatch);

    useEffect(() => {
        // @ts-ignore
        window.state = state;
        // @ts-ignore
        window.store = store;
    }, [state]);

    useEffect(() => {
        const path = state.at[0]?.start;
        try {
            if (path && !isValidCursorLocation(path, state.regs)) {
                console.log('Not valid sorry');
                const left = goLeftUntil(
                    path,
                    state.map,
                    state.nsMap,
                    state.cards,
                    state.regs,
                );
                if (left) {
                    return dispatch({
                        type: 'select',
                        at: [{ start: left.selection }],
                    });
                }
            }
        } catch (err) {
            console.error(err);
            console.log('failed to find valid');
        }
    }, [state.at, state.map, state.regs]);

    const start = state.at.length ? state.at[0].start : null;
    // const selTop = start?.[1].idx;

    return (
        <div style={{ padding: 16, cursor: 'text', marginBottom: 300 }}>
            <HiddenInput
                display={results.display}
                state={state}
                dispatch={dispatch}
                menu={undefined}
                hashNames={{}}
            />
            <WithStore store={store}>
                {state.cards.map((_, i) => (
                    <CardRoot
                        state={state}
                        key={i}
                        ev={evaluator}
                        dispatch={dispatch}
                        card={i}
                        results={results}
                        produce={produce}
                        env={env}
                    />
                ))}
            </WithStore>
            <div style={{ position: 'absolute', top: 4, right: 4 }}>
                <button onClick={() => setDebug(!debug)}>
                    {debug ? 'Debug on' : 'Debug off'}
                </button>
                <div>
                    {state.evaluator ?? 'Non set'}
                    <select
                        value={state.evaluator ?? ''}
                        onChange={(evt) => {
                            dispatch({
                                type: 'config:evaluator',
                                id: evt.target.value,
                            });
                        }}
                    >
                        <option value={''}>No evaluator</option>
                        <option value={':repr:'}>REPR</option>
                        <option value={':bootstrap:'}>Bootstrap</option>
                        {listing
                            ?.filter((n) => n.endsWith('.json'))
                            .map((name, i) =>
                                name === id ? null : (
                                    <option value={name} key={name}>
                                        {name}
                                    </option>
                                ),
                            )}
                    </select>
                </div>
                {debug ? (
                    <div
                        style={{
                            position: 'absolute',
                            backgroundColor: 'black',
                            border: '1px solid #aaa',
                            top: '100%',
                            marginTop: 4,
                            right: 0,
                        }}
                    >
                        <ShowAt at={state.at} />
                        {/* <br />
                        {JSON.stringify(state.hover)} */}
                    </div>
                ) : null}
            </div>
            <Hover
                state={state}
                dispatch={dispatch}
                calc={() => {
                    for (let i = state.hover.length - 1; i >= 0; i--) {
                        const last = state.hover[i].idx;
                        const errs = results.errors[last];
                        if (errs?.length) {
                            return [{ idx: last, text: errs.join('\n') }];
                        }
                    }
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

const showPath = (path: Path[]) => {
    return (
        <table>
            <tbody>
                {path.map((item, i) => (
                    <tr key={i}>
                        <td style={{ width: '3em', display: 'inline-block' }}>
                            {item.idx}
                        </td>
                        <td
                            style={{
                                whiteSpace: 'nowrap',
                                wordBreak: 'keep-all',
                                minWidth: '5em',
                            }}
                        >
                            {item.type}
                        </td>
                        {'at' in item ? <td>{item.at}</td> : null}
                    </tr>
                ))}
            </tbody>
        </table>
    );
};
const ShowAt = ({ at }: { at: NUIState['at'] }) => {
    return (
        <>
            {at.map(({ start, end }, i) => (
                <div key={i}>
                    {showPath(start)}
                    {end ? '[...]' : null}
                    {end ? showPath(end) : null}
                </div>
            ))}
        </>
    );
};
