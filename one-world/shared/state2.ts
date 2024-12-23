// full on state
// probably persisted or something

import { MultiSelect } from '../client/cli/resolveMultiSelect';
import { DropTarget } from './IR/block-to-text';
import { IRSelection } from './IR/intermediate';
import { Cursor, Path, PathRoot, RecNodeT } from './nodes';
import { Toplevel, Toplevels } from './toplevels';

export type TS = { created: number; updated: number };

export type Reference = {
    toplevel: string;
    loc: number;
};

export type DocSelection =
    | IRSelection
    | {
          type: 'namespace';
          root: PathRoot;
          start: number;
          end: number;
          text?: string[];
      };

export type DocSession = {
    doc: string;
    selections: DocSelection[];
    clipboard: RecNodeT<boolean>[];
    dragState?: {
        source: MultiSelect;
        dest?: DropTarget;
    };
    // TODO: 'jump' history. for backtracking selections
    jumpHistory: Path[];

    // The 'column' position that the cursor is pulled back to
    // for making up/down navigation better.
    verticalLodeStone?: number;

    dropdown?: {
        selection: number[];
        dismissed?: string;
    };
};

export const getDoc = (state: PersistedState, id: string): Doc => {
    if (id !== state.id) throw new Error(`cant wrong doc`);
    return state;
};

export const getTop = (
    state: PersistedState,
    doc: string,
    id: string,
): Toplevel => {
    return state.toplevels[id];
    // return state.stages[doc]?.toplevels[id] ?? state._toplevels[id];
};

export type DocState = {
    stage: DocStage;
    session: DocSession;
};

export type PersistedState = DocStage;

export type EvaluatorPath = { id: string; hash: string }[];

export type Doc = {
    id: string;
    title: string;
    published: null | number;
    archived?: number | null;
    hash?: string | null;
    evaluator: EvaluatorPath;

    nodes: Record<number, DocumentNode>;
    nextLoc: number;
    ts: TS;
};

export type HistoryItem = {
    idx: number;
    reverts?: number;
    session: string;
    changes: {
        toplevels?: Toplevels;
        prevToplevels?: Toplevels;
        nodes?: Record<number, DocumentNode>;
        prevNodes?: Record<number, DocumentNode>;
        selections: DocSelection[];
        prevSelections: DocSelection[];
    };
};

export type HashedMod = Omit<Mod, 'hash'> & {
    hash: string;
    docHash: string;
};

export type Mod = {
    id: string;
    hash: string | null;
    docHash: string | null;
    assets: Record<
        string,
        { id: string; hash: string }
        // Goes to a lookup:
        // { id: string; hash: string; data?: any; mime: string; meta: any }
    >;
    submodules: Record<string, string>; // Record<id, hash>
    aliases: Record<string, string>; // name to module id

    // These are the evaluators that are /enabled/ for the current module.
    evaluators: EvaluatorPath[];
    ts: TS;

    // These are ... aliases, if you will. Named things, including evaluators, but also pinns.
    artifacts: Record<
        string,
        {
            id: string;
            hash: string;
            evaluator: EvaluatorPath;
            kind: 'evaluator' | 'ffi' | 'backend' | 'visual';
        }
    >;

    // this is the path from the root to get to this module.
    // must be synchronized with the `submodules` of the ancestors
    // It doesn't get saved to disk, because it's not stable
    // from the hash of the module.
    path: string[];

    // DENORMALIZED
    // idx is the node idx of the export
    terms: Record<
        string,
        { id: string; hash: string; idx: number; kind: string }
    >;
};

export type DocStage = Doc & {
    toplevels: Toplevels;
    modules: Record<string, Mod>;
    history: HistoryItem[];
    root: string; // the hash of the root module that we're based on
};

export type DocumentNode = {
    id: number;
    toplevel: string;
    topLock?: { hash: string; manual: boolean };
    children: number[];
    ts: TS;

    // the location where the exports of the associated toplevel should live.
    // and any children. If unspecified, inherits from parent.
    // module?: string;

    // namespace?: string;
    // encapsulates plugins as welll
    display?: { id: string; options: any };
    trace?: {
        top: boolean;
        // iff I want `fmt` to be fully nodified, where would it live?
        // on the toplevel? or like ... somewhere else?
        nodes: Record<number, null | { fmt?: string }>;
    };
};

export type LockedNode = Omit<DocumentNode, 'topLock'> & {
    topLock: NonNullable<DocumentNode['topLock']>;
};
