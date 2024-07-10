import { Doc, DocSession, PersistedState, Reference, Stage } from './state';
import { Toplevel } from './toplevels';

export type Action =
    | { type: 'reset'; state: PersistedState }
    | { type: 'multi'; actions: Action[] }
    | { type: 'doc'; id: string; action: DocAction }
    | { type: 'toplevel'; id: string; action: ToplevelAction; stage?: string }
    | {
          type: 'in-session';
          doc: string;
          session: string;
          action: Action;
          selections?: DocSession['selections'];
      }
    | { type: 'namespaces'; action: NamespaceAction }
    | { type: 'stage'; id: string; action: StageAction };

export type StageAction = { type: 'reset'; stage: Stage } | { type: 'delete' };

export type NamespaceAction = {
    type: 'update';
    map: Record<string, Reference | null>;
};

export type ToplevelUpdate = {
    type: 'update';
    update: Partial<Omit<Toplevel, 'nodes'>> & {
        nodes?: Partial<Toplevel['nodes']>;
    };
};

export type ToplevelAction =
    | { type: 'reset'; toplevel: Toplevel }
    | ToplevelUpdate
    | { type: 'delete' };

export type DocAction = { type: 'reset'; doc: Doc } | { type: 'delete' };
