import React, { useEffect, useMemo, useReducer, useState } from 'react';
import { layout } from '../../../src/layout';
import { fromMCST } from '../../../src/types/mcst';
import { Cursors } from '../../custom/Cursors';
import { HiddenInput } from '../../custom/HiddenInput';
import { Hover } from '../../custom/Hover';
import { NUIState } from '../../custom/UIState';

import { CardRoot } from '../../custom/CardRoot';
import { newResults } from '../Test';
import {
    addTypeConstructors,
    bootstrapEval,
    bootstrapParse,
    extractBuiltins,
    findTops,
    selfCompileAndEval,
} from './reduce';
import { evalExpr } from './round-1/bootstrap';
import { sanitize } from './round-1/builtins';
import { unwrapArray } from './round-1/parse';
import { reduce } from './reduce';

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
        // @ts-ignore
        window.state = state;
    }, [state]);

    useEffect(() => {
        save({ ...state, regs: {} });
    }, [state.map, id]);

    const { produce: evaluated, results } = useMemo(() => {
        const all = findTops(state);

        const results = newResults();
        const produce: { [key: number]: string } = {};
        all.forEach((t) => (produce[t.top] = ''));
        try {
            const stmts = all.map((t) => fromMCST(t.top, state.map));
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

        all.map(({ top }) => {
            layout(top, 0, state.map, results.display, results.hashNames, true);
        });

        return { produce, results };
    }, [state.map, state.nsMap, state.cards]);

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
            {/* <div style={{ display: 'flex' }}>
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
            </div> */}
            {state.cards.map((_, i) => (
                <CardRoot
                    state={state}
                    key={i}
                    dispatch={dispatch}
                    card={i}
                    results={results}
                    produce={evaluated}
                />
            ))}
            <div style={{ position: 'absolute', top: 4, right: 4 }}>
                <button onClick={() => setDebug(!debug)}>
                    {debug ? 'Debug on' : 'Debug off'}
                </button>
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
                        {JSON.stringify(state.at)}
                    </div>
                ) : null}
            </div>
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
