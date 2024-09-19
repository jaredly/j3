import { Node } from './nodes';
import { Doc, DocSession, DocumentNode, PersistedState } from './state2';
import { Toplevel } from './toplevels';

export type Action =
    | { type: 'reset'; state: PersistedState }
    | { type: 'module'; action: ModuleAction }
    | { type: 'multi'; actions: Action[] }
    | { type: 'doc'; id: string; action: DocAction }
    | {
          type: 'toplevel';
          id: string;
          doc: string;
          action: ToplevelAction;
          stage?: string;
      }
    | {
          type: 'selection';
          doc: string;
          selections: DocSession['selections'];
          verticalLodeStone?: number;
          autocomplete?: boolean;
      }
    | { type: 'drag'; doc: string; drag: DocSession['dragState'] };
// | { type: 'namespaces'; action: NamespaceAction }
// | { type: 'stage'; id: string; action: StageAction };

// export type StageAction = { type: 'reset'; stage: Stage } | { type: 'delete' };
export type ModuleAction =
    | {
          type: 'add';
          parent: string;
          id: string;
          name: string;
      }
    | {
          type: 'move';
          from: string;
          to: string;
          id: string;
          name: string;
      };

// export type NamespaceAction = {
//     type: 'update';
//     map: Record<string, Reference | null>;
// };

export type ToplevelUpdate = {
    type: 'update';
    update: Partial<Omit<Toplevel, 'nodes'>> & {
        nodes?: Record<string, Node | undefined>;
    };
};

export type ToplevelAction =
    | { type: 'reset'; toplevel: Toplevel }
    | ToplevelUpdate
    | { type: 'delete' };

export type DocAction =
    | { type: 'reset'; doc: Doc }
    | { type: 'delete' }
    | {
          type: 'update';
          update: Partial<Omit<Doc, 'nodes'>> & {
              nodes?: Record<string, DocumentNode | undefined>;
          };
      };
