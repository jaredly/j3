import React from 'react';
import { Action, RealizedNamespace } from './UIState';
import { plugins } from './plugins';

export function NSMenu({
    mref,
    setCM,
    dispatch,
    ns,
}: {
    mref: React.RefObject<HTMLDivElement>;
    setCM: React.Dispatch<React.SetStateAction<boolean>>;
    dispatch: React.Dispatch<Action>;
    ns: RealizedNamespace;
}) {
    const current =
        typeof ns.plugin === 'string'
            ? ns.plugin
            : ns.plugin
            ? ns.plugin.id
            : null;
    return (
        <div
            ref={mref}
            onMouseDown={(evt) => evt.stopPropagation()}
            onClick={() => setCM(false)}
            style={{
                color: 'white',
                cursor: 'default',
                zIndex: 1000,
                position: 'absolute',
                width: 200,
                top: 0,
                left: 0,
                backgroundColor: 'black',
                border: '1px solid #aaa',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <div style={{ padding: '4px 8px' }}>Set Plugin</div>
            {plugins.map((plugin) => (
                <button
                    key={plugin.id}
                    style={{
                        cursor: 'pointer',
                        backgroundColor:
                            plugin.id === current ? '#ccc' : 'white',
                    }}
                    onClick={() => {
                        dispatch({
                            type: 'ns',
                            nsMap: {
                                [ns.id]: { ...ns, plugin: plugin.id },
                            },
                        });
                    }}
                >
                    {plugin.title}
                </button>
            ))}
            <button
                style={{ cursor: 'pointer' }}
                onClick={() => {
                    dispatch({
                        type: 'ns',
                        nsMap: {
                            [ns.id]: { ...ns, plugin: undefined },
                        },
                    });
                }}
            >
                No plugin
            </button>
        </div>
    );
}
