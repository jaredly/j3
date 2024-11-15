import { IHasher } from 'hash-wasm/dist/lib/WASMInterface';
import { Doc, EvaluatorPath, Mod } from '../shared/state2';

export type Module = {
    hash?: string;
    id: string;
    aliases: Record<string, string>;
    submodules: Record<string, { id: string; hash: string }>;
    terms: Record<string, { id: string; hash: string; idx?: number }>;
    evaluators: EvaluatorPath[];
    assets: Record<string, { id: string; hash: string }>;
    artifacts: Record<
        string,
        {
            id: string;
            hash: string;
            evaluator: EvaluatorPath;
            kind: 'evaluator' | 'ffi' | 'backend' | 'visual';
        }
    >;
    created: number;
    updated: number;
};

export type Commit = {
    hash?: string;
    sourceDoc?: string;
    root: string;
    message: string;
    parent?: string;
    author?: string;
    created: number;
};
export type Branch = { name: string; head: string };
export const hashit = (value: string, hasher: IHasher) => {
    return hasher.init().update(value).digest('hex');
};
const keyString = (k: string) =>
    k.match(/^[a-zA-Z0-9_-]+$/) ? k : JSON.stringify(k);

export const normDoc = (doc: Doc): string =>
    norm({
        id: doc.id,
        title: doc.title,
        nodes: doc.nodes,
        published: doc.published,
        evaluator: doc.evaluator,
        nextLoc: doc.nextLoc,
        ts: doc.ts,
    });

export const norm = (value: any): string => {
    if (value == null) return '';
    if (Array.isArray(value)) return `[${value.map(norm)}]`;
    if (typeof value === 'object') {
        return `{${Object.keys(value)
            .filter((k) => value[k] !== undefined)
            .sort()
            .map((k) => `${keyString(k)}:${norm(value[k])}`)
            .join(',')}}`;
    }
    return JSON.stringify(value);
};
export const hashModule = (module: Mod) =>
    norm({ ...module, hash: undefined, ts: undefined });
export const hashCommit = (commit: Commit) =>
    norm({ ...commit, hash: undefined });
