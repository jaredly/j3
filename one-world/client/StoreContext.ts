import { createContext } from 'react';
import { PersistedState } from '../shared/state';
import { Action } from '../shared/action';

export type Store = {
    getState(): PersistedState;
    update(action: Action): void;
    onNode(id: string, f: () => void): () => void;
    on(evt: any, f: () => void): () => void;
};

export const StateContext = createContext<Store>(null as any);
