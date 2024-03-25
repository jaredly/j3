import React from 'react';
import { NUIState } from '../../custom/UIState';
import { Display } from '../../../src/to-ast/library';
import { Store } from '../../custom/store/Store';
import { pathForIdx } from './CommandPalette';
import { LocError, MyEvalError, Produce as Produce } from './Evaluators';
import { TraceMap } from './loadEv';

export function renderTraces(
    results: {
        errors: { [loc: number]: string[] };
        display: Display;
        hashNames: { [loc: string]: string };
        produce: { [key: string]: Produce };
        env: any;
        traces: TraceMap;
        pluginResults: { [nsLoc: number]: any };
    },
    state: NUIState,
    store: Store,
): React.ReactNode {
    return Object.entries(results.traces).map(([top, traces]) => (
        <div key={top} style={{ maxWidth: 500, overflow: 'auto' }}>
            <div
                onClick={() => {
                    const path = pathForIdx(+top, state);
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
                        const tloc = trace.find((t) => t.type === 'tloc');
                        if (!tloc) return 'no tloc';
                        const locs = trace
                            .filter((t) => t.type === 'tloc')
                            .map((t) => t[0] as number);
                        const loc = tloc[0];
                        const node = state.map[loc];
                        return (
                            <div
                                key={i}
                                style={{ marginBottom: 5, display: 'contents' }}
                                onMouseEnter={() => {
                                    locs.forEach((loc) => {
                                        const node =
                                            state.regs[loc]?.main ??
                                            state.regs[loc]?.outside;
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
                                            state.regs[loc]?.outside;
                                        if (node) {
                                            node.node.style.outline = 'unset';
                                        }
                                    });
                                }}
                            >
                                <div
                                    style={{
                                        gridColumn: 1,
                                        gridRow: i + 1,
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    <div
                                        onClick={() => {
                                            const path = pathForIdx(loc, state);
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
                                        {node.type === 'identifier'
                                            ? node.text
                                            : loc}
                                    </div>
                                </div>
                                <div
                                    style={{
                                        marginRight: 8,
                                        marginLeft: 8,
                                        gridRow: i + 1,
                                        gridColumn: 2,
                                    }}
                                >
                                    {i}
                                </div>
                                <div
                                    style={{
                                        whiteSpace: 'pre-wrap',
                                        gridRow: i + 1,
                                        gridColumn: 3,
                                        overflow: 'auto',
                                    }}
                                >
                                    {trace.map((t, i) => {
                                        switch (t.type) {
                                            case 'tfmted':
                                                return (
                                                    <div key={i}>{t[1]}</div>
                                                );
                                            case 'ttext':
                                                return (
                                                    <div key={i}>{t[0]}</div>
                                                );
                                            case 'tloc':
                                                return (
                                                    <div key={i}>
                                                        loc: {t[0]}
                                                    </div>
                                                );
                                            default:
                                                return (
                                                    <div key={i}>
                                                        ({t.type})
                                                    </div>
                                                );
                                        }
                                    })}
                                </div>
                            </div>
                        );
                    })}
            </div>
        </div>
    ));
}
