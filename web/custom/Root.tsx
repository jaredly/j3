import equal from 'fast-deep-equal';
import React, { useCallback, useState } from 'react';
import { sexp } from '../../progress/sexp';
import { Ctx } from '../../src/to-ast/Ctx';
import { fromMCST } from '../../src/types/mcst';
import { Path } from '../mods/path';
import { cmpFullPath } from './isCoveredBySelection';
import { Render } from './Render';
import { closestSelection } from './verticalMove';
import { UIState, Action } from './ByHand';

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
    const selections = state.at
        .filter((s) => s.end)
        .map(({ start, end }) => {
            const cmp = cmpFullPath(start, end!);
            return cmp > 0 ? { start: end!, end: start } : { start, end };
        });

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
            onMouseDown={(evt) => {
                const sel = closestSelection(state.regs, {
                    x: evt.clientX,
                    y: evt.clientY,
                });
                if (sel) {
                    dispatch({
                        type: 'select',
                        add: evt.altKey,
                        at: [{ start: sel }],
                    });
                }
            }}
            onMouseMove={(evt) => {
                if (!drag) {
                    return;
                }
                const sel = closestSelection(state.regs, {
                    x: evt.clientX,
                    y: evt.clientY,
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
            {tops.map((top, i) => (
                <div key={top} style={{ marginBottom: 8 }}>
                    <Render
                        debug={debug}
                        idx={top}
                        map={state.map}
                        reg={reg}
                        display={ctx.display}
                        errors={ctx.errors}
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
                    {debug ? <div>{sexp(fromMCST(top, state.map))}</div> : null}
                </div>
            ))}
        </div>
    );
}
