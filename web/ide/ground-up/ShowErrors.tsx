import React, { useState } from 'react';
import { useGetStore } from '../../custom/store/StoreCtx';
import { pathForIdx } from './pathForIdx';
import { collectErrors } from './collectErrors';

export const ShowErrors = ({
    hide,
    setHide,
}: {
    hide: boolean;
    setHide: (b: boolean) => void;
}) => {
    const store = useGetStore();
    const found = collectErrors(store);

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
                            const path = pathForIdx(loc, store.getState());
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
