import SQLiteESMFactory from 'wa-sqlite/dist/wa-sqlite.mjs';
import * as SQLite from 'wa-sqlite';
import IDBBatchAtomicVFS from 'wa-sqlite/src/examples/IDBBatchAtomicVFS.js';

export type Db = { api: SQLiteAPI; id: number };

export type TableConfig = {
    name: string;
    params: { name: string; config: string }[];
};

export const createTable = async (db: Db, { name, params }: TableConfig) => {
    await db.api.exec(
        db.id,
        `create table ${name} (${params
            .map(({ name, config }) => `${name} ${config}`)
            .join(',\n')})`,
    );
};

export const namesConfig = {
    name: 'names',
    params: [
        { name: 'id', config: 'text primary key' },
        { name: 'map', config: 'text check(json_valid(map)) not null' },
        { name: 'root_date', config: 'integer' },
    ],
};

export const definitionsConfig = {
    name: 'definitions',
    params: [
        { name: 'id', config: 'text primary key' },
        { name: 'value', config: 'text check(json_valid(value)) not null' },
    ],
};

export const sandboxesConfig = {
    name: 'sandboxes',
    params: [
        { name: 'id', config: 'text primary key' },
        { name: 'title', config: 'text not null' },
        { name: 'created_date', config: 'integer not null' },
        { name: 'updated_date', config: 'integer not null' },
    ],
};

export const sandboxNodesConfig = (id: string) => ({
    name: `sandbox_${id}_nodes`,
    params: [
        { name: 'idx', config: 'integer primary key' },
        {
            name: 'value',
            config: 'text check(json_valid(value)) not null',
        },
    ],
});

export const sandboxHistoryConfig = (id: string) => ({
    name: `sandbox_${id}_updates`,
    params: [
        { name: 'id', config: 'integer primary key autoupdate' },
        {
            name: 'update',
            config: 'text check(json_valid(value)) not null',
        },
    ],
});

async function hello() {
    const module = await SQLiteESMFactory();
    const sqlite3 = SQLite.Factory(module);
    const vfs = new IDBBatchAtomicVFS({ idbDatabaseName: 'jerd-sqlite' });
    await vfs.isReady;
    sqlite3.vfs_register(vfs, true);
    const dbid = await sqlite3.open_v2('myDB');
    await sqlite3.exec(dbid, `SELECT 'Hello, world!'`, (row, columns) => {
        console.log(row);
    });
    await sqlite3.close(dbid);
}

hello();

// import localforage from 'localforage';

// const name = 'jerd';

// export const names = localforage.createInstance({
//     name,
//     storeName: 'names',
// });

// export const definitions = localforage.createInstance({
//     name,
//     storeName: 'definitions',
// });

// export const sandboxes = localforage.createInstance({
//     name,
//     storeName: 'sandboxes',
// });

// export const sandboxNodes = (id: string) =>
//     localforage.createInstance({
//         name,
//         storeName: `sandboxNodes_${id}`,
//     });

// export const sandboxHistory = (id: string) =>
//     localforage.createInstance({
//         name,
//         storeName: `sandboxHistory_${id}`,
//     });

// ergh, but I would kinda like some transactionality.
// and so I'm left wanting sqlite again.
