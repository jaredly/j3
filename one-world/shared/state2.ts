// full on state
// probably persisted or something

import { MultiSelect } from '../client/cli/resolveMultiSelect';
import { DropTarget } from './IR/block-to-text';
import { IRSelection } from './IR/intermediate';
import { Cursor, Path, PathRoot, RecNodeT } from './nodes';
import { Toplevels } from './toplevels';

export type TS = { created: number; updated: number };

export type Stage = {
    id: string;
    title?: string;
    toplevels: Toplevels;
    ts: TS;
};

export type Reference = {
    toplevel: string;
    loc: number;
};

// export type NodeSelection_ =
//     | {
//           type: 'id';
//           path: Path;
//           pathKey: string;
//           cursor: number;
//           start?: number;
//           text?: string[];
//       }
//     | {
//           type: 'without';
//           path: Path;
//           pathKey: string;
//           child?: {
//               path: number[];
//               final: NodeSelection;
//           };
//           location: 'start' | 'end' | 'inside' | 'all';
//       }
//     | {
//           type: 'multi';
//           start?: {
//               path: Path;
//               pathKey: string;
//               location: 'start' | 'end' | 'inside' | number;
//           };
//           cursor: { path: Path; pathKey: string };
//       };

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
    history: any[];
    activeStage: null | string;
    selections: DocSelection[];
    clipboard: RecNodeT<boolean>[];
    dragState?: {
        source: MultiSelect;
        dest?: DropTarget;
    };
    // TODO: 'jump' history. for backtracking selections

    // The 'column' position that the cursor is pulled back to
    // for making up/down navigation better.
    verticalLodeStone?: number;

    dropdown?: {
        selection: number[];
        dismissed?: string;
    };

    // idTexts: Record<number, string[]>;
    // selection cache???
    // selections: {
    //     sels: { start?: Cursor; cursor: Cursor }[];
    //     cache: Record<number, {idx: number}>
    // }
};

export type PersistedState = {
    toplevels: Toplevels;
    documents: Record<string, Doc>;
    // moduleid -> (name -> moduleid)
    modules: Record<string, Record<string, string>>;
    stages: Record<string, Stage>;
};

export type EvaluatorPath = {
    toplevel: string;
    commit: string;
}[];

export type Doc = {
    id: string;
    title: string;
    published: boolean;
    module: string;
    nsAliases: Record<string, string>;
    nodes: Record<number, DocumentNode>;
    evaluator: EvaluatorPath;
    nextLoc: number;
    ts: TS;
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
