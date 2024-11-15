import { createContext, RefObject, useContext } from 'react';
import { DocSession, PersistedState } from '../shared/state2';
import { Action } from '../shared/action2';
import { Path } from '../shared/nodes';

export type StoreEvt = 'selection' | 'all';

export type Store = {
    session: string;
    docSession: DocSession;
    // getDocSession(doc: string, session?: string): DocSession;
    getState(): PersistedState;
    update(...actions: Action[]): void;
    onSelection(session: string, path: Path, f: () => void): () => void;
    onTop(id: string, f: () => void): () => void;
    onTopNode(top: string, id: number, f: () => void): () => void;
    onDoc(id: string, f: () => void): () => void;
    onDocNode(doc: string, id: number, f: () => void): () => void;
    on(evt: 'selection', f: (autocomplete?: boolean) => void): () => void;
    on(evt: 'all', f: () => void): () => void;
    // focus and drag management
    textRef(path: Path, pathKey: string): RefObject<HTMLElement>;
    startDrag(pathKey: string, path: Path): void;
    dispose(): void;
};

export const StoreContext = createContext<Store>(null as any);

export const useStore = () => {
    return useContext(StoreContext);
};

// export const SessionContext = createContext<string>(null as any);
// export const useSessionId = () => {
//     return useContext(SessionContext);
// };
