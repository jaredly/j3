import { Document, PersistedState, Reference, Stage } from './state';
import { Toplevel } from './toplevels';

export type Action =
    | { type: 'reset'; state: PersistedState }
    | { type: 'multi'; actions: Action[] }
    | { type: 'doc'; id: string; action: DocAction }
    | { type: 'toplevel'; id: string; action: ToplevelAction; stage?: string }
    | { type: 'namespaces'; action: NamespaceAction }
    | { type: 'stage'; id: string; action: StageAction };

export type StageAction = { type: 'reset'; stage: Stage } | { type: 'delete' };

export type NamespaceAction = {
    type: 'update';
    map: Record<string, Reference | null>;
};

export type ToplevelAction =
    | { type: 'reset'; toplevel: Toplevel }
    | { type: 'update'; update: Partial<Toplevel> }
    | { type: 'nodes'; nodes: Partial<Toplevel['nodes']> }
    | { type: 'delete' };

export type DocAction = { type: 'reset'; doc: Document } | { type: 'delete' };
