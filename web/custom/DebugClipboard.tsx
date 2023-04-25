import React, { useMemo } from 'react';
import {
    type ClipboardItem,
    clipboardText,
    collectNodes,
} from '../../src/state/clipboard';
import { UIState } from './UIState';
import { orderStartAndEnd } from '../../src/parse/parse';
import { Ctx } from '../../src/to-ast/library';

export function DebugClipboard({
    state,
    debug,
    ctx,
}: {
    state: UIState;
    debug: boolean;
    ctx: Ctx;
}) {
    const collected = useMemo(
        () =>
            state.at
                .map((sel) => {
                    if (!sel.end) return null;
                    const [start, end] = orderStartAndEnd(sel.start, sel.end);

                    return collectNodes(
                        state.map,
                        start,
                        end,
                        ctx.results.hashNames,
                    );
                })
                .filter(Boolean) as ClipboardItem[],
        [state.map, state.at],
    );

    if (!debug) return null;

    return (
        <div>
            <div>
                {[collected, ...state.clipboard].map((copy, i) =>
                    copy.length ? (
                        <div
                            key={i}
                            style={{
                                padding: 8,
                                margin: 8,
                                backgroundColor: '#335',
                            }}
                        >
                            {copy.map((item, i) => (
                                <div key={i}>
                                    {clipboardText(
                                        [item],
                                        state.ctx.results.hashNames,
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : null,
                )}
            </div>
            <div>
                <div>
                    At:{' '}
                    <div>
                        {state.at.map(({ start, end }, i) => (
                            <div key={i} style={{ display: 'flex' }}>
                                <div>
                                    {start.map((item, i) => (
                                        <div key={i}>
                                            {JSON.stringify(item)}
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    {end?.map((item, i) => (
                                        <div key={i}>
                                            {JSON.stringify(item)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {debug ? (
                <div>
                    <div>
                        Sel: <div>{JSON.stringify(state.at[0].start)}</div>
                    </div>
                    <div>Path: </div>
                    <div>
                        <table>
                            <tbody>
                                <tr>
                                    <td>idx</td>
                                    <td>child</td>
                                </tr>

                                {state.at.map((at, a) =>
                                    at.start.map((item, i) => (
                                        <tr key={i + ':' + a}>
                                            <td>{item.idx}</td>
                                            <td>{JSON.stringify(item)}</td>
                                        </tr>
                                    )),
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div style={{ whiteSpace: 'pre-wrap' }}>
                        {JSON.stringify(ctx.results.display, null, 2)}
                    </div>
                </div>
            ) : null}
        </div>
    );
}
