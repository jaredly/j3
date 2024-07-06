// full on state
// probably persisted or something

import { Cursor } from './nodes';
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

export type PersistedState = {
    toplevels: Toplevels;
    documents: Record<string, Doc>;
    namespaces: Record<string, Reference>;
    stages: Record<string, Stage>;
};

export type EvaluatorPath = {
    toplevel: string;
    commit: string;
}[];

// State for the active user.
// Maybeeeee completely transient? idk
// Like session-only
export type UserDocument = {
    history: any[];
    activeStage: null | string;
    selections: { start: Cursor; end?: Cursor }[];
};

export type Doc = {
    id: string;
    title?: string;
    namespace: string;
    nsAliases: Record<string, string>;
    nodes: Record<number, DocumentNode>;
    evaluator: EvaluatorPath;
    nextLoc: number;
    ts: TS;
};

export type DocumentNode = {
    id: number;
    document: string;
    toplevel: number;
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
