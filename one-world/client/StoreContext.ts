import { createContext, useContext } from 'react';
import { DocSession, PersistedState } from '../shared/state';
import { Action } from '../shared/action';
import { Path } from '../shared/nodes';

export type Store = {
    getDocSession(doc: string, session: string): DocSession;
    getState(): PersistedState;
    update(action: Action): void;
    onSelection(session: string, path: Path, f: () => void): () => void;
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

export const SessionContext = createContext<string>(null as any);

export const useSessionId = () => {
    return useContext(SessionContext);
};
