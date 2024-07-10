import * as React from 'react';
import { useEffect, useState } from 'react';
import { StoreContext, Store } from './StoreContext';
import { rid } from '../shared/rid';
import { newStore } from './newStore';

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
                        setStore(newStore(state, ws, ssid));
                    };
                    ws.addEventListener('message', f);
                };
            });
    }, []);

    if (store == null) {
        return <div>loading initial world state...</div>;
    }
    return (
        <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
    );
};
