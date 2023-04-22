import equal from 'fast-deep-equal';
import React, { useCallback, useState } from 'react';
import { sexp } from '../../progress/sexp';
import { nilt } from '../../src/to-ast/Ctx';
import { fromMCST } from '../../src/types/mcst';
import { Path } from '../mods/path';
import { Render } from './Render';
import { closestSelection } from './verticalMove';
import { UIState, Action } from './UIState';
import { orderStartAndEnd } from '../../src/parse/parse';
import { nodeToString } from '../../src/to-cst/nodeToString';
import { nodeForType } from '../../src/to-cst/nodeForType';
import { getType } from '../../src/get-type/get-types-new';
import { Ctx } from '../../src/to-ast/library';

export function Root({
    state,
    dispatch,
    tops,
    debug,
    ctx,
}: {
    state: UIState;
    dispatch: React.Dispatch<Action>;
    tops: number[];
    debug: boolean;
    ctx: Ctx;
}) {
    const selections = React.useMemo(
        () =>
            state.at
                .filter((s) => s.end)
                .map(({ start, end }) => {
                    [start, end] = orderStartAndEnd(start, end!);
                    return { start, end };
                }),
        [state.at],
    );

    const reg = useCallback(
        (
            node: HTMLSpanElement | null,
            idx: number,
            path: Path[],
            loc?: 'start' | 'end' | 'inside',
        ) => {
            if (!state.regs[idx]) {
                state.regs[idx] = {};
            }
            state.regs[idx][loc ?? 'main'] = node ? { node, path } : null;
        },
        [],
    );

    const [drag, setDrag] = useState(false);

    return (
        <div
            style={{ cursor: 'text', padding: 16 }}
            onMouseDownCapture={() => {
                setDrag(true);
            }}
            onMouseLeave={(evt) => {
                dispatch({ type: 'hover', path: [] });
            }}
            onMouseDown={(evt) => {
                const sel = closestSelection(state.regs, {
                    x: evt.clientX + window.scrollX,
                    y: evt.clientY + window.scrollY,
                });
                if (sel) {
                    if (evt.shiftKey && state.at.length) {
                        const sels = state.at.slice();
                        sels[sels.length - 1] = {
                            ...sels[sels.length - 1],
                            end: sel,
                        };
                        dispatch({ type: 'select', at: sels });
                    } else {
                        dispatch({
                            type: 'select',
                            add: evt.altKey,
                            at: [{ start: sel }],
                        });
                    }
                }
            }}
            onMouseMove={(evt) => {
                if (!drag) {
                    return;
                }
                const sel = closestSelection(state.regs, {
                    x: evt.clientX + window.scrollX,
                    y: evt.clientY + window.scrollY,
                });
                if (sel) {
                    const at = state.at.slice();
                    const idx = at.length - 1;
                    if (equal(sel, at[idx].start)) {
                        at[idx] = { start: sel };
                        dispatch({ type: 'select', at });
                    } else {
                        at[idx] = { ...at[idx], end: sel };
                        dispatch({ type: 'select', at });
                    }
                }
            }}
            onMouseUpCapture={(evt) => {
                if (drag) {
                    setDrag(false);
                }
            }}
        >
            {tops.map((top, i) => {
                const got = state.ctx.results.toplevel[top];
                const tt = got
                    ? got.type === 'def'
                        ? got.ann ?? nilt
                        : got.type === 'deftype'
                        ? got.value
                        : getType(got, state.ctx)
                    : null;
                return (
                    <div key={top} style={{ marginBottom: 8, display: 'flex' }}>
                        <div
                            style={{
                                marginRight: 4,
                                width: 20,
                                // backgroundColor: 'red',
                                height: 10,
                            }}
                        >
                            {got?.type === 'def' || got?.type === 'deftype' ? (
                                <div
                                    onClick={() => {
                                        // the click
                                        const loc = got.form.loc;
                                        // if (got.type === 'def') { }
                                        dispatch({
                                            type: 'yank',
                                            expr: got,
                                            loc,
                                        });
                                    }}
                                    style={{
                                        cursor: 'pointer',
                                    }}
                                >
                                    &lt;-
                                </div>
                            ) : (
                                ''
                            )}
                        </div>
                        <div>
                            <Render
                                debug={debug}
                                idx={top}
                                map={state.map}
                                reg={reg}
                                display={ctx.results.display}
                                hashNames={ctx.results.hashNames}
                                errors={ctx.results.errors}
                                dispatch={dispatch}
                                selection={selections}
                                path={[
                                    { idx: state.root, type: 'child', at: i },
                                ]}
                            />
                            <div
                                style={{
                                    fontSize: '80%',
                                    opacity: 0.3,
                                    marginTop: 4,
                                }}
                            >
                                {tt
                                    ? nodeToString(
                                          nodeForType(
                                              tt,
                                              ctx.results.hashNames,
                                          ),
                                          ctx.results.hashNames,
                                      )
                                    : 'no type'}
                            </div>
                            {debug ? (
                                <div>{sexp(fromMCST(top, state.map))}</div>
                            ) : null}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
