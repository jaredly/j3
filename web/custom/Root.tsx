import equal from 'fast-deep-equal';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { sexp } from '../../progress/sexp';
import { orderStartAndEnd } from '../../src/parse/parse';
import { Cursor } from '../../src/state/getKeyUpdate';
import { Path } from '../../src/state/path';
import { Ctx } from '../../src/to-ast/library';
import { fromMCST } from '../../src/types/mcst';
import { Render } from './Render';
import { Action, NUIState } from './UIState';
import { Reg } from './types';
import { closestSelection } from './verticalMove';

export function Root({
    state,
    dispatch,
    tops,
    debug,
    showTop,
    results,
    clickTop,
}: {
    state: NUIState;
    dispatch: React.Dispatch<Action>;
    tops: number[];
    debug: boolean;
    showTop?: (top: number) => React.ReactNode;
    clickTop?: (top: number) => void;
    results?: Ctx['results'];
}) {
    useEffect(() => {
        console.log('ROOT First render');
    }, []);
    const selections = React.useMemo(
        () => normalizeSelections(state.at),
        [state.at],
    );
    const reg = useRegs(state);
    const dragProps = useDrag(dispatch, state);

    return (
        <div
            {...dragProps}
            style={{ cursor: 'text', padding: 16 }}
            onMouseLeave={(evt) => {
                dispatch({ type: 'hover', path: [] });
            }}
            onMouseDown={(evt) => {
                let action = selectionAction(evt, state.at, state.regs);
                if (action) {
                    dispatch(action);
                }
            }}
        >
            {tops.map((top, i) => {
                const got = results?.toplevel[top];
                return (
                    <div key={top} style={{ marginBottom: 8, display: 'flex' }}>
                        <div
                            style={{
                                marginRight: 4,
                                width: 20,
                                height: 10,
                            }}
                        >
                            {clickTop ? (
                                <div
                                    onClick={() => {
                                        clickTop(top);
                                    }}
                                    style={{ cursor: 'pointer' }}
                                >
                                    &lt;-
                                </div>
                            ) : null}
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
                                display={results?.display ?? empty}
                                hashNames={results?.hashNames ?? empty}
                                errors={results?.errors ?? empty}
                                dispatch={dispatch}
                                selection={selections}
                                path={[
                                    {
                                        idx: state.root,
                                        type: 'child',
                                        at: i,
                                    },
                                ]}
                            />
                            <div
                                style={{
                                    fontSize: '80%',
                                    opacity: 0.3,
                                    marginTop: 4,
                                }}
                            >
                                {showTop?.(top)}
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

const empty = {};

function selectionAction(
    evt: React.MouseEvent<HTMLDivElement, MouseEvent>,
    at: Cursor[],
    regs: NUIState['regs'],
): Action | void {
    const sel = closestSelection(regs, {
        x: evt.clientX, // + window.scrollX,
        y: evt.clientY, // + window.scrollY,
    });
    if (!sel) return;

    if (evt.shiftKey && at.length) {
        const sels = at.slice();
        sels[sels.length - 1] = {
            ...sels[sels.length - 1],
            end: sel,
        };
        return { type: 'select', at: sels };
    } else {
        return {
            type: 'select',
            add: evt.altKey,
            at: [{ start: sel }],
        };
    }
}

function normalizeSelections(at: Cursor[]): { start: Path[]; end: Path[] }[] {
    return at
        .filter((s) => s.end)
        .map(({ start, end }) => {
            [start, end] = orderStartAndEnd(start, end!);
            return { start, end };
        });
}

function useRegs(state: NUIState): Reg {
    return useCallback((node, idx, path, loc) => {
        if (!state.regs[idx]) {
            state.regs[idx] = {};
        }
        state.regs[idx][loc ?? 'main'] = node ? { node, path } : null;
    }, []);
}

function useDrag(dispatch: React.Dispatch<Action>, state: NUIState) {
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
                x: evt.clientX, // + window.scrollX,
                y: evt.clientY, // + window.scrollY,
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
    return { onMouseDownCapture: () => setDrag(true) };
}
