import { Card, MetaDataUpdateMap } from '../../web/custom/UIState';
import { HashedTree } from '../db/hash-tree';
// import { Report } from '../get-type/get-types-new';
// import { InferMod } from '../infer/infer';
import { Cursor, NsUpdateMap, UpdateMap } from '../state/getKeyUpdate';
import { Expr, TVar, Type } from '../types/ast';
import { Layout, MNode } from '../types/mcst';
import { AutoCompleteResult } from './Ctx';
// import { AutoCompleteResult, NodeStyle } from './Ctx';

export type Display = {
    [idx: number]: {
        style?: any;
        layout?: Layout;
        autoComplete?: AutoCompleteResult[];
    };
};

// export type CompilationResults = {
//     errors: Report['errors'];
//     mods: { [idx: number]: InferMod };
//     hashNames: { [idx: number]: string };
//     globalNames: { [hash: string]: string[] };
//     display: Display;
//     localMap: {
//         terms: { [idx: number]: { name: string; type: Type } };
//         types: { [idx: number]: { name: string; bound?: Type } };
//     };
//     toplevel: { [idx: number]: Expr };
// };

// export type Local = {
//     terms: { sym: number; name: string; type: Type }[];
//     types: { sym: number; name: string; bound?: Type }[];
//     loop?: { sym: number; type: Type };
//     loopType?: { sym: number };
// };

// export type Ctx = {
//     results: CompilationResults;
//     global: Env;
// };

// export type CstCtx = Ctx & {
//     local: Local;
// };

// export type Env = {
//     builtins: Builtins;
//     library: Library;
// };

// export const globalTerm = (lib: Library, hash: string): LibTerm | null => {
//     const defn = lib.definitions[hash];
//     return defn?.type === 'term' ? defn : null;
// };

// export const globalType = (lib: Library, hash: string): LibType | null => {
//     const defn = lib.definitions[hash];
//     return defn?.type === 'type' ? defn : null;
// };

// export type Builtins = {
//     [name: string]:
//         | {
//               type: 'type';
//               args: TVar[];
//           }
//         | {
//               type: 'term';
//               ann: Type;
//           };
// };

export type LibTerm = {
    type: 'term';
    value: Expr;
    ann: Type;
    originalName: string;
};

export type LibType = {
    type: 'type';
    value: Type;
    originalName: string;
};

export type Library = {
    root: string;
    // Do I want like commit messages or something? hmmm
    history: { hash: string; date: number }[];
    namespaces: HashedTree;
    definitions: {
        [hash: string]: LibTerm | LibType;
    };
};

export type HistoryItem = {
    id: number;
    map: UpdateMap;
    prev: UpdateMap;
    nsMap: NsUpdateMap;
    nsPrev: NsUpdateMap;
    meta: MetaDataUpdateMap;
    metaPrev: MetaDataUpdateMap;
    at: Cursor[];
    prevAt: Cursor[];
    ts: number;
    revert?: number;
    libraryRoot?: string;
};

export type Sandbox = {
    meta: {
        id: string;
        title: string;
        created_date: number;
        updated_date: number;
        version: number;
        settings: {
            namespace: string[];
            aliases: { from: string[]; to: string[] }[];
        };
        deleted_date: number | null;
        node_count: number;
    };

    root: number;
    map: { [idx: number]: MNode };
    cards: Card[];
    history: HistoryItem[];
};
