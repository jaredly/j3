import React, { useEffect, useState } from 'react';
import { NUIState } from '../../custom/UIState';
import { Display } from '../../../src/to-ast/library';
import { Store } from '../../custom/store/Store';
import { useGetStore } from '../../custom/store/StoreCtx';
import { pathForIdx } from './pathForIdx';
import { LocError, MyEvalError } from './Evaluators';
import { Produce as Produce } from './FullEvalator';
import { Trace, TraceMap } from './loadEv';

declare module 'react' {
    interface CSSProperties {
        [key: `--${string}`]: string | number;
    }
}

export function RenderTraces() {
    // results: {
    //     errors: { [loc: number]: string[] };
    //     display: Display;
    //     hashNames: { [loc: string]: string };
    //     produce: { [key: string]: Produce };
    //     env: any;
    //     traces: TraceMap;
    //     pluginResults: { [nsLoc: number]: any };
    // },
    // state: NUIState,
    // store: Store,
    const store = useGetStore();
    const [results, setResults] = useState(() => store.getResults());
    useEffect(
        () => store.on('results', () => setResults(store.getResults())),
        [],
    );
    // const store =useGetStore()

    return (
        <>
            {Object.entries(results.workerResults.traces).map(
                ([top, traces]) => (
                    <div key={top} style={{ maxWidth: 500, overflow: 'auto' }}>
                        <div
                            onClick={() => {
                                const path = pathForIdx(+top, store.getState());
                                if (path) {
                                    store.dispatch({
                                        type: 'select',
                                        at: [{ start: path }],
                                    });
                                }
                            }}
                        >
                            Top trace: {top}
                        </div>
                        <div style={{ display: 'grid' }}>
                            {traces
                                // .flatMap(([k, v]) => v.map((v) => [k, v] as const))
                                // .sort((a, b) => a[1].at - b[1].at)
                                // .filter((v) =>
                                //     v.trace.some((trace) => trace.type === 'tfmted'),
                                // )
                                .map((trace, i) => {
                                    const tloc = trace.find(
                                        (t) => t.type === 'tloc',
                                    );
                                    if (!tloc) return 'no tloc';
                                    const locs = trace
                                        .filter((t) => t.type === 'tloc')
                                        .map((t) => t[0] as number);
                                    const loc = tloc[0];
                                    const state = store.getState();
                                    const node = state.map[loc];
                                    return (
                                        <div
                                            key={i}
                                            style={{
                                                marginBottom: 5,
                                                display: 'contents',
                                            }}
                                            onMouseEnter={() => {
                                                locs.forEach((loc) => {
                                                    const node =
                                                        state.regs[loc]?.main ??
                                                        state.regs[loc]
                                                            ?.outside;
                                                    if (node) {
                                                        node.node.style.outline =
                                                            '1px solid red';
                                                    }
                                                });
                                            }}
                                            onMouseLeave={() => {
                                                locs.forEach((loc) => {
                                                    const node =
                                                        state.regs[loc]?.main ??
                                                        state.regs[loc]
                                                            ?.outside;
                                                    if (node) {
                                                        node.node.style.outline =
                                                            'unset';
                                                    }
                                                });
                                            }}
                                        >
                                            <div
                                                style={{
                                                    gridColumn: 1,
                                                    gridRow: i + 1,
                                                    whiteSpace: 'nowrap',
                                                    display: 'flex',
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        color: 'red',
                                                        cursor: 'pointer',
                                                        '--hover-bg':
                                                            'rgba(255,0,0,0.2)',
                                                    }}
                                                    className="hover-bg"
                                                    onClick={() => {
                                                        store.dispatch({
                                                            type: 'meta',
                                                            meta: {
                                                                [loc]: {
                                                                    trace: undefined,
                                                                },
                                                            },
                                                        });
                                                    }}
                                                >
                                                    &times;
                                                </div>
                                                <div
                                                    style={{
                                                        cursor: 'pointer',
                                                    }}
                                                    onClick={() => {
                                                        const path = pathForIdx(
                                                            loc,
                                                            state,
                                                        );
                                                        if (path) {
                                                            store.dispatch({
                                                                type: 'select',
                                                                at: [
                                                                    {
                                                                        start: path,
                                                                    },
                                                                ],
                                                            });
                                                        }
                                                    }}
                                                >
                                                    {node?.type === 'identifier'
                                                        ? node.text
                                                        : loc}
                                                </div>
                                            </div>
                                            {/* <div
                                                style={{
                                                    marginRight: 8,
                                                    marginLeft: 8,
                                                    gridRow: i + 1,
                                                    gridColumn: 2,
                                                }}
                                            >
                                                {i}
                                            </div> */}
                                            <div
                                                style={{
                                                    whiteSpace: 'pre-wrap',
                                                    gridRow: i + 1,
                                                    gridColumn: 2,
                                                    overflow: 'auto',
                                                }}
                                            >
                                                {showTraceResults(trace)}
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                ),
            )}
        </>
    );
}
function showTraceResults(trace: Trace[]): React.ReactNode {
    const tl = trace.find((t) => t.type === 'tloc');
    return trace.map((t, i) => {
        switch (t.type) {
            case 'tfmted':
                return <div key={i}>{t[1]}</div>;
            case 'ttext':
                return <div key={i}>{t[0]}</div>;
            case 'tloc':
                return null;
            // return <div key={i}>loc: {t[0]}</div>;
            default:
                return <div key={i}>({t.type})</div>;
        }
    });
}
