import React, { useState } from 'react';
import { useGetStore, useResults } from '../../custom/store/StoreCtx';
import { pathForIdx } from './pathForIdx';

export const ShowErrors = () => {
    const [hide, setHide] = useState(false);
    const store = useGetStore();
    const results = useResults(store);
    const state = store.getState();
    const found: { loc: number; errs: string[] }[] = [];
    Object.values(results.results.nodes).forEach((node) => {
        if (node.parsed?.type === 'failure') {
            Object.entries(node.parsed.errors).forEach(([loc, errs]) => {
                found.push({ loc: +loc, errs });
            });
        }
    });
    Object.entries(results.workerResults.nodes).forEach(([key, send]) => {
        Object.entries(send.errors).forEach(([loc, errs]) => {
            found.push({ loc: +loc, errs });
        });
        send.produce.forEach((item) => {
            if (typeof item === 'string') return;
            if (
                item.type === 'error' ||
                item.type === 'withjs' ||
                item.type === 'eval'
            ) {
                found.push({
                    loc: state.nsMap[+key]?.top,
                    errs: [item.message],
                });
            }
        });
    });

    if (!found.length) return null;
    return (
        <div
            style={{
                maxWidth: 400,
            }}
        >
            <strong style={{ color: 'red' }}>Errors</strong>
            <button onClick={() => setHide(!hide)}>
                {hide ? 'Show' : 'Hide'}
            </button>
            {!hide &&
                found.map(({ loc, errs }, i) => (
                    <div
                        key={i}
                        onClick={() => {
                            const path = pathForIdx(loc, state);
                            if (!path)
                                return alert('cant find path for ' + loc);
                            store.dispatch({
                                type: 'select',
                                at: [{ start: path }],
                            });
                        }}
                        style={{
                            fontSize: '80%',
                            borderBottom: '1px solid white',
                            marginBottom: 8,
                            paddingBottom: 8,
                        }}
                    >
                        {loc}: {errs.join(', ').slice(0, 100)}
                    </div>
                ))}
        </div>
    );
};
