import equal from 'fast-deep-equal';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { sexp } from '../../progress/sexp';
import { nilt } from '../../src/to-ast/Ctx';
import { fromMCST } from '../../src/types/mcst';
import { Path } from '../../src/state/path';
import { Render } from './Render';
import { closestSelection } from './verticalMove';
import { UIState, Action, NUIState } from './UIState';
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
    // ctx,
    showTop,
    results,
}: {
    state: NUIState;
    dispatch: React.Dispatch<Action>;
    tops: number[];
    debug: boolean;
    // ctx: Ctx;
    showTop?: (top: number) => React.ReactNode;
    results?: Ctx['results'];
}) {
    useEffect(() => {
        console.log('ROOT First render');
    }, []);
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
            loc?: 'start' | 'end' | 'inside' | 'outside',
        ) => {
            if (!state.regs[idx]) {
                state.regs[idx] = {};
            }
            state.regs[idx][loc ?? 'main'] = node ? { node, path } : null;
        },
        [],
    );

    const [drag, setDrag] = useState(false);
    const currentState = useRef(state);
    currentState.current = state;

    useEffect(() => {
        if (!drag) {
            return;
        }
        const up = () => {
            setDrag(false);
        };
        const move = (evt: MouseEvent) => {
            const state = currentState.current;
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
        };
        document.addEventListener('mouseup', up, { capture: true });
        document.addEventListener('mousemove', move);
        return () => {
            document.removeEventListener('mousemove', move);
            document.removeEventListener('mouseup', up, { capture: true });
        };
    }, [drag]);

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
        >
            {tops.map((top, i) => {
                const got = results?.toplevel[top];
                const tt = showTop?.(top);
                return (
                    <div key={top} style={{ marginBottom: 8, display: 'flex' }}>
                        <div
                            style={{
                                marginRight: 4,
                                width: 20,
                                height: 10,
                            }}
                        >
                            {got?.type === 'def' || got?.type === 'deftype' ? (
                                <div
                                    onClick={() => {
                                        const loc = got.form.loc;
                                        dispatch({
                                            type: 'yank',
                                            expr: got,
                                            loc,
                                        });
                                    }}
                                    style={{ cursor: 'pointer' }}
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
                                display={results?.display ?? {}}
                                hashNames={results?.hashNames ?? {}}
                                errors={results?.errors ?? {}}
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
                                {tt}
                            </div>
                            {debug ? (
                                <div>{sexp(fromMCST(top, state.map))}</div>
                            ) : null}
                            {debug ? (
                                <div>{JSON.stringify(state.at)}</div>
                            ) : null}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
