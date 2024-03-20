import React from 'react';
import { NUIState } from '../../custom/UIState';
import { Display } from '../../../src/to-ast/library';
import { Store } from '../../custom/Store';
import { pathForIdx } from './CommandPalette';
import { LocError } from './Evaluators';
import { TraceMap } from './loadEv';

export function renderTraces(
    results: {
        errors: { [loc: number]: string[] };
        display: Display;
        hashNames: { [loc: string]: string };
        produce: {
            [key: string]: string | JSX.Element | LocError;
        };
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
                    const path = pathForIdx(+top, state.regs, state.map);
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
                {Object.entries(traces)
                    .flatMap(([k, v]) => v.map((v) => [k, v] as const))
                    .sort((a, b) => a[1].at - b[1].at)
                    .map(([key, value], i) => {
                        const node = state.map[+key];
                        return (
                            <div
                                key={i}
                                style={{ marginBottom: 5, display: 'contents' }}
                                onMouseEnter={() => {
                                    const node =
                                        state.regs[+key]?.main ??
                                        state.regs[+key]?.outside;
                                    if (node) {
                                        node.node.style.backgroundColor =
                                            'rgba(255,0,0,0.5)';
                                    }
                                }}
                                onMouseLeave={() => {
                                    const node =
                                        state.regs[+key]?.main ??
                                        state.regs[+key]?.outside;
                                    if (node) {
                                        node.node.style.backgroundColor =
                                            'unset';
                                    }
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
                                            const path = pathForIdx(
                                                +key,
                                                state.regs,
                                                state.map,
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
                                        {node.type === 'identifier'
                                            ? node.text
                                            : key}
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
                                    {value.at}
                                </div>
                                <div
                                    style={{
                                        whiteSpace: 'pre-wrap',
                                        gridRow: i + 1,
                                        gridColumn: 3,
                                        overflow: 'auto',
                                    }}
                                >
                                    {value.formatted}
                                </div>
                            </div>
                        );
                    })}
            </div>
        </div>
    ));
}
