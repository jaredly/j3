import { Report } from '../get-type/get-types-new';
import { Def, DefType, Expr, TVar, Type } from '../types/ast';
import { Layout, MNode } from '../types/mcst';
import { AutoCompleteResult, Mod, NodeStyle } from './Ctx';
import { HashedTree } from '../db/hash-tree';
import { Cursor, StateUpdate } from '../state/getKeyUpdate';
import { UpdateMap } from '../state/getKeyUpdate';

export type CompilationResults = {
    errors: Report['errors'];
    mods: {
        [idx: number]: Mod[];
    };
    hashNames: { [idx: number]: string };
    globalNames: { [hash: string]: string[] };
    display: {
        [idx: number]: {
            style?: NodeStyle;
            layout?: Layout;
            autoComplete?: AutoCompleteResult[];
        };
    };
    localMap: {
        terms: { [idx: number]: { name: string; type: Type } };
        types: { [idx: number]: { name: string; bound?: Type } };
    };
    toplevel: { [idx: number]: Expr };
};

export type Local = {
    terms: { sym: number; name: string; type: Type }[];
    types: { sym: number; name: string; bound?: Type }[];
    loop?: { sym: number; type: Type };
    loopType?: { sym: number };
};

export type Ctx = {
    results: CompilationResults;
    global: Env;
};

export type CstCtx = Ctx & {
    local: Local;
};

export type Env = {
    builtins: Builtins;
    library: Library;
};

export const globalTerm = (lib: Library, hash: string): LibTerm | null => {
    const defn = lib.definitions[hash];
    return defn?.type === 'term' ? defn : null;
};

export const globalType = (lib: Library, hash: string): LibType | null => {
    const defn = lib.definitions[hash];
    return defn?.type === 'type' ? defn : null;
};

export type Builtins = {
    [name: string]:
        | {
              type: 'type';
              args: TVar[];
          }
        | {
              type: 'term';
              ann: Type;
          };
};

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
    at: Cursor[];
    prevAt: Cursor[];
    ts: number;
    revert?: number;
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
        };
    };

    root: number;
    map: { [idx: number]: MNode };
    history: HistoryItem[];
    // namespace: string[];
};
