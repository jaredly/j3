import React from 'react';
import { Action, NUIState, RealizedNamespace } from './UIState';
import { plugins } from './plugins';
import { useGetStore } from './store/Store';
import { Node } from '../../src/types/cst';
import { fromMCST } from '../../src/types/mcst';
import { clipboardPrefix, clipboardSuffix } from './ByHand';
import { NSExport } from '../../src/state/clipboard';

export const exportNs = (id: number, state: NUIState) => {
    const ns = state.nsMap[id] as RealizedNamespace;
    const res: NSExport = {
        top: fromMCST(ns.top, state.map),
        children: ns.children.map((id) => exportNs(id, state)),
    };
    return res;
};

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
    const store = useGetStore();
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
            <button
                style={{
                    cursor: 'pointer',
                    backgroundColor: 'white',
                }}
                onClick={() => {
                    const state = store.getState();
                    const exported = exportNs(ns.id, state);
                    const text = JSON.stringify([
                        {
                            type: 'ns',
                            items: [exported],
                        },
                    ]);
                    // nstree?
                    navigator.clipboard.write([
                        new ClipboardItem({
                            ['text/plain']: new Blob([text], {
                                type: 'text/plain',
                            }),
                            ['text/html']: new Blob(
                                [
                                    clipboardPrefix +
                                        text +
                                        clipboardSuffix +
                                        `Copied a namespace`,
                                ],
                                { type: 'text/html' },
                            ),
                        }),
                    ]);
                }}
            >
                Copy tree
            </button>

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
            <div style={{ padding: '4px 8px' }}>Set Render Function</div>
            {['pre', 'none', null].map((id) => (
                <button
                    key={id ?? 'default'}
                    style={{
                        cursor: 'pointer',
                        background: id === ns.display?.id ? 'red' : 'white',
                    }}
                    onClick={() => {
                        console.log('setting display', id);
                        dispatch({
                            type: 'ns',
                            nsMap: {
                                [ns.id]: {
                                    ...ns,
                                    display:
                                        id === null
                                            ? undefined
                                            : { id, options: null },
                                },
                            },
                        });
                    }}
                >
                    {id === null ? 'Default' : id}
                </button>
            ))}
        </div>
    );
}
