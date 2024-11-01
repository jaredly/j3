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
    module: string;
    evaluator: EvaluatorPath;

    nsAliases: Record<string, string>;
    nodes: Record<number, DocumentNode>;
    nextLoc: number;
    ts: TS;
};

type HistoryItem = {
    id: string;
    reverts?: string;
    session: string;
    toplevels?: Toplevels;
    prevToplevels?: Toplevels;
    nodes?: Record<number, DocumentNode>;
    prevNodes?: Record<number, DocumentNode>;
    selections: DocSelection[];
    prevSelections: DocSelection[];
};

export type DocStage = Doc & {
    toplevels: Toplevels;
    history: HistoryItem[];
};

export type DocumentNode = {
    id: number;
    toplevel: string;
    children: number[];
    ts: TS;

    namespace?: string;
    // encapsulates plugins as welll
    display?: { id: string; options: any };
    trace?: {
        top: boolean;
        // iff I want `fmt` to be fully nodified, where would it live?
        // on the toplevel? or like ... somewhere else?
        nodes: Record<number, null | { fmt?: string }>;
    };
};
