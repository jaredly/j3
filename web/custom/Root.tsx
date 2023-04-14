import equal from 'fast-deep-equal';
import React, { useCallback, useState } from 'react';
import { sexp } from '../../progress/sexp';
import { nilt } from '../../src/to-ast/Ctx';
import { fromMCST } from '../../src/types/mcst';
import { Path } from '../mods/path';
import { cmpFullPath } from './isCoveredBySelection';
import { Render } from './Render';
import { closestSelection } from './verticalMove';
import { UIState, Action } from './ByHand';
import { orderStartAndEnd } from '../../src/parse/parse';
import { Expr } from '../../src/types/ast';
import { nodeToString } from '../../src/to-cst/nodeToString';
import { nodeForExpr } from '../../src/to-cst/nodeForExpr';
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
    const exprMap: { [idx: number]: Expr } = {};
    state.exprs.forEach((expr) => (exprMap[expr.form.loc.idx] = expr));

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
                        dispatch({
                            type: 'select',
                            at: sels,
                        });
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
            {tops.map((top, i) => (
                <div key={top} style={{ marginBottom: 8 }}>
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
                            {
                                idx: state.root,
                                type: 'child',
                                at: i,
                            },
                        ]}
                    />
                    {exprMap[top] ? (
                        <div
                            style={{
                                fontSize: '80%',
                                opacity: 0.3,
                                marginTop: 4,
                            }}
                        >
                            {nodeToString(
                                nodeForType(
                                    getType(exprMap[top], ctx) ?? nilt,
                                    ctx.results.hashNames,
                                ),
                                ctx.results.hashNames,
                            )}
                        </div>
                    ) : null}
                    {debug ? <div>{sexp(fromMCST(top, state.map))}</div> : null}
                </div>
            ))}
        </div>
    );
}
