import * as React from 'react';
import { createContext, useEffect, useState } from 'react';
import { PersistedState } from '../shared/state';

const ctx = createContext<PersistedState>(null as any);

export const StoreProvider = ({ children }: { children: React.ReactNode }) => {
    const [state, setState] = useState(null as null | PersistedState);
    const [ws, setWs] = useState(null as null | WebSocket);
    useEffect(() => {
        fetch('http://localhost:8227')
            .then((res) => res.json())
            .then((state) => {
                setState(state);
                const ws = new WebSocket('ws://localhost:8227/ws');
                ws.onopen = () => {
                    setWs(ws);
                };
            });
    }, []);

    if (state === null || ws === null) {
        return <div>loading initial world state...</div>;
    }
    return <ctx.Provider value={state}>{children}</ctx.Provider>;
};
