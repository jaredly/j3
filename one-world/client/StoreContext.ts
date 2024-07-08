import { createContext, useContext } from 'react';
import { PersistedState } from '../shared/state';
import { Action } from '../shared/action';

export type Store = {
    getState(): PersistedState;
    update(action: Action): void;
    onTop(id: string, f: () => void): () => void;
    onTopNode(top: string, id: number, f: () => void): () => void;
    onDoc(id: string, f: () => void): () => void;
    onDocNode(doc: string, id: number, f: () => void): () => void;
    on(evt: any, f: () => void): () => void;
};

export const StoreContext = createContext<Store>(null as any);

export const useStore = () => {
    return useContext(StoreContext);
};
