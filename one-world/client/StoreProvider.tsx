import * as React from 'react';
import { useEffect, useState } from 'react';
import { PersistedState } from '../shared/state';
import { StateContext, Store } from './StoreContext';
import { update } from '../shared/update';
import { rid } from '../shared/rid';

const lskey = 'stoa:ssid';

const getSsid = () => {
    if (location.search.startsWith('?ssid=')) {
        return location.search.slice('?ssid='.length);
    }
    if (!localStorage[lskey]) {
        localStorage[lskey] = rid() + rid();
    }
    return localStorage[lskey];
};

export const StoreProvider = ({ children }: { children: React.ReactNode }) => {
    // const [state, setState] = useState(null as null | PersistedState);
    // const [ws, setWs] = useState(null as null | WebSocket);
    const [store, setStore] = useState(null as null | Store);
    useEffect(() => {
        const ssid = getSsid();
        fetch('http://localhost:8227')
            .then((res) => res.json())
            .then((state) => {
                const ws = new WebSocket('ws://localhost:8227/ws?ssid=' + ssid);
                ws.onopen = () => {
                    const f = (msg: MessageEvent<any>) => {
                        ws.removeEventListener('message', f);
                        const data = JSON.parse(String(msg.data));
                        if (data.type !== 'hello') {
                            throw new Error(`first message wasnt hello.`);
                        }
                        if (data.ssid !== ssid) {
                            history.replaceState(
                                null,
                                '',
                                '?ssid=' + data.ssid,
                            );
                        }
                        setStore(newStore(state, ws));
                    };
                    ws.addEventListener('message', f);
                };
            });
    }, []);

    if (store == null) {
        return <div>loading initial world state...</div>;
    }
    return (
        <StateContext.Provider value={store}>{children}</StateContext.Provider>
    );
};

const newStore = (state: PersistedState, ws: WebSocket): Store => {
    const store: Store = {
        getState() {
            return state;
        },
        update(action) {
            state = update(state, action);
            ws.send(
                JSON.stringify({
                    type: 'action',
                    action,
                }),
            );
            // todo notify
        },
        on(evt, f) {
            return () => {};
        },
        onNode(id, f) {
            return () => {};
        },
    };
    return store;
};
