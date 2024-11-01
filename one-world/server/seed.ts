import 'dotenv/config';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { eq } from 'drizzle-orm';
import * as tb from './schema';
import { EvaluatorPath } from '../shared/state2';
import { createBLAKE3 } from 'hash-wasm';
import sqlite from 'bun:sqlite';
import { IHasher } from 'hash-wasm/dist/lib/WASMInterface';

type Module = {
    hash?: string;
    id: string;
    submodules: Record<string, { id: string; hash: string }>;
    toplevels: Record<string, { id: string; hash: string; idx?: number }>;
    documents: Record<string, { id: string; hash: string }>;
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

type Commit = {
    hash?: string;
    sourceDoc?: string;
    root: string;
    message: string;
    parent?: string;
    author?: string;
    created: number;
};

type Branch = { name: string; head: string };

const hashit = (value: string, hasher: IHasher) => {
    return hasher.init().update(value).digest('hex');
};

const db = drizzle(sqlite.open(process.env.DB_FILE_NAME!));

const keyString = (k: string) =>
    k.match(/^[a-zA-Z0-9_-]+$/) ? k : JSON.stringify(k);

const norm = (value: any): string => {
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

const hashModule = (module: Module) =>
    norm({
        ...module,
        hash: undefined,
        created: undefined,
        updated: undefined,
    });

const hashCommit = (commit: Commit) => norm({ ...commit, hash: undefined });

async function seed() {
    const hasher = await createBLAKE3();

    const module: Module = {
        id: 'root',
        submodules: {},
        toplevels: {},
        documents: {},
        evaluators: [],
        assets: {},
        artifacts: {},
        created: Date.now(),
        updated: Date.now(),
    };
    const moduleHash = hashit(hashModule(module), hasher);

    const commit: Commit = {
        root: moduleHash,
        message: 'Initial',
        author: 'me',
        created: Date.now(),
    };
    const commitHash = hashit(hashCommit(commit), hasher);

    const branch: Branch = {
        name: 'main',
        head: commitHash,
    };

    await db.insert(tb.modules).values({
        ...module,
        hash: moduleHash,
        submodules: JSON.stringify(module.submodules),
        toplevels: JSON.stringify(module.toplevels),
        documents: JSON.stringify(module.documents),
        evaluators: JSON.stringify(module.evaluators),
    });

    await db.insert(tb.commits).values({
        ...commit,
        hash: commitHash,
    });

    await db.insert(tb.branches).values(branch);

    // await db.insert(tb.modules).values();

    //     const user: typeof usersTable.$inferInsert = {
    //         name: 'John',
    //         age: 30,
    //         email: 'john@example.com',
    //     };

    //     await db.insert(usersTable).values(user);
    //     console.log('New user created!');

    //     const users = await db.select().from(usersTable);
    //     console.log('Getting all users from the database: ', users);
    //     /*
    //   const users: {
    //     id: number;
    //     name: string;
    //     age: number;
    //     email: string;
    //   }[]
    //   */

    //     await db
    //         .update(usersTable)
    //         .set({
    //             age: 31,
    //         })
    //         .where(eq(usersTable.email, user.email));
    //     console.log('User info updated!');

    //     await db.delete(usersTable).where(eq(usersTable.email, user.email));
    //     console.log('User deleted!');
}

// seed();
