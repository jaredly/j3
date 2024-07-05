import * as React from 'react';
import { useEffect, useState } from 'react';
import { PersistedState } from '../shared/state';
import { StateContext, Store } from './StoreContext';
import { update } from '../shared/update';

export const StoreProvider = ({ children }: { children: React.ReactNode }) => {
    // const [state, setState] = useState(null as null | PersistedState);
    // const [ws, setWs] = useState(null as null | WebSocket);
    const [store, setStore] = useState(null as null | Store);
    useEffect(() => {
        fetch('http://localhost:8227')
            .then((res) => res.json())
            .then((state) => {
                // setState(state);
                const ws = new WebSocket('ws://localhost:8227/ws');
                ws.onopen = () => {
                    // setWs(ws);
                    setStore(newStore(state, ws));
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
