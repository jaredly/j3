import React, { useEffect, useMemo, useReducer, useState } from 'react';
import { layout } from '../../../src/layout';
import { fromMCST } from '../../../src/types/mcst';
import { Cursors, isValidCursorLocation } from '../../custom/Cursors';
import { HiddenInput } from '../../custom/HiddenInput';
import { Hover } from '../../custom/Hover';
import { NUIState } from '../../custom/UIState';

import { Display } from '../../../src/to-ast/library';
import { CardRoot } from '../../custom/CardRoot';
import { RenderProps } from '../../custom/types';
import { FullEvalator, bootstrap, repr } from './Evaluators';
import { findTops, reduce } from './reduce';
import { goLeftUntil, selectEnd } from '../../../src/state/navigate';
import { Path } from '../../store';

export type Results = {
    display: Display;
    errors: RenderProps['errors'];
    hashNames: { [idx: number]: string };
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

    const evaluator: FullEvalator<any, any, any> | undefined = useMemo(() => {
        switch (state.evaluator) {
            case ':bootstrap:':
                return bootstrap;
            case ':repr:':
                return repr;
        }
    }, [state.evaluator]);

    useEffect(() => {
        // @ts-ignore
        window.state = state;
    }, [state]);

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
                    produce[stmt.loc] = 'not parsed';
                }
            } else {
                produce[stmt.loc] = 'No evaluator';
            }

            layout(top, 0, state.map, results.display, results.hashNames, true);
        });

        return { results, produce, env };
    }, [state.map, state.nsMap, state.cards, evaluator]);

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

    // const { produce: evaluated, results } = useMemo(() => {
    //     const all = findTops(state);

    //     const results = newResults();
    //     const produce: { [key: number]: string } = {};
    //     all.forEach((t) => (produce[t.top] = ''));
    //     try {
    //         const stmts = all.map((t) => fromMCST(t.top, state.map));
    //         const env: { [key: string]: any } = {
    //             '+': (a: number) => (b: number) => a + b,
    //             'replace-all': (a: string) => (b: string) => (c: string) =>
    //                 a.replaceAll(b, c),
    //         };
    //         const parsed = bootstrapParse(stmts, results);

    //         parsed.forEach((stmt) => {
    //             if (stmt.type === 'sdeftype') {
    //                 results.tops[(stmt as any).loc] = {
    //                     summary: stmt[0],
    //                     data: [],
    //                     failed: false,
    //                 };
    //                 addTypeConstructors(stmt, env);
    //                 produce[(stmt as any).loc] = `type with ${
    //                     unwrapArray(stmt[1]).length
    //                 } constructors`;
    //                 return;
    //             }
    //             if (stmt.type === 'sdef') {
    //                 results.tops[(stmt as any).loc] = {
    //                     summary: stmt[0],
    //                     data: [],
    //                     failed: false,
    //                 };

    //                 const res = evalExpr(stmt[1], env);
    //                 env[stmt[0]] = res;
    //                 produce[(stmt as any).loc] =
    //                     typeof res === 'function'
    //                         ? `<function>`
    //                         : JSON.stringify(res);
    //                 // produce[(stmt as any).loc] +=
    //                 //     '\n\nAST: ' + JSON.stringify(stmt);
    //                 if (stmt[0] === 'builtins') {
    //                     Object.assign(env, extractBuiltins(res));
    //                 }
    //             }
    //         });

    //         if (env['compile-st']) {
    //             let prelude = '';
    //             prelude += `const {${Object.keys(env)
    //                 .filter((k) => sanitize(k) === k)
    //                 .join(', ')}} = env;\n{`;

    //             selfCompileAndEval(parsed, env, prelude, produce);
    //         } else {
    //             bootstrapEval(parsed, env, produce);
    //         }
    //     } catch (err) {
    //         console.error('Something didnt work', err);
    //     }

    //     all.map(({ top }) => {
    //         layout(top, 0, state.map, results.display, results.hashNames, true);
    //     });

    //     return { produce, results };
    // }, [state.map, state.nsMap, state.cards]);

    const start = state.at.length ? state.at[0].start : null;
    const selTop = start?.[1].idx;

    return (
        <div style={{ padding: 16, cursor: 'text' }}>
            <HiddenInput
                display={results.display}
                state={state}
                dispatch={dispatch}
                menu={undefined}
                hashNames={{}}
            />
            {state.cards.map((_, i) => (
                <CardRoot
                    state={state}
                    key={i}
                    dispatch={dispatch}
                    card={i}
                    results={results}
                    produce={produce}
                    env={env}
                />
            ))}
            <div style={{ position: 'absolute', top: 4, right: 4 }}>
                <button onClick={() => setDebug(!debug)}>
                    {debug ? 'Debug on' : 'Debug off'}
                </button>
                <div>
                    {state.evaluator ?? 'Non set'}
                    <select
                        value={state.evaluator ?? 'bootstrap'}
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
                        {/* {...files} */}
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
