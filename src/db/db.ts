import SQLiteESMFactory from 'wa-sqlite/dist/wa-sqlite.mjs';
import * as SQLite from 'wa-sqlite';
import IDBBatchAtomicVFS from 'wa-sqlite/src/examples/IDBBatchAtomicVFS.js';
import MemoryAsyncVFS from 'wa-sqlite/src/examples/MemoryAsyncVFS.js';
import { Db } from './tables';

type ok = number | string | null;

export async function getIDB(): Promise<Db> {
    const module = await SQLiteESMFactory();
    const sqlite3 = SQLite.Factory(module);
    const vfs = new IDBBatchAtomicVFS({ idbDatabaseName: 'jerd-sqlite' });
    await vfs.isReady;
    sqlite3.vfs_register(vfs, true);
    const dbid = await sqlite3.open_v2('ide-db');

    const run = async (text: string, args?: ok[]) => {
        if (args) {
            const str = sqlite3.str_new(dbid, text);
            const prepared = (await sqlite3.prepare_v2(
                dbid,
                sqlite3.str_value(str),
            ))!;
            sqlite3.bind_collection(prepared.stmt, args);

            const rows: { [key: string]: ok }[] = [];
            let columns;
            while ((await sqlite3.step(prepared.stmt)) === SQLite.SQLITE_ROW) {
                columns = columns ?? sqlite3.column_names(prepared.stmt);
                const res = sqlite3.row(prepared.stmt) as ok[];
                const row: { [key: string]: ok } = {};
                columns.forEach((col, i) => (row[col] = res[i]));
                rows.push(row);
            }
            await sqlite3.finalize(prepared.stmt);
            return rows;
        } else {
            const rows: { [key: string]: ok }[] = [];
            await sqlite3.exec(dbid, text, (row, columns) => {
                const res: { [key: string]: ok } = {};
                columns.forEach((col, i) => (res[col] = row[i] as ok));
                rows.push(res);
            });
            return rows;
        }
    };
    return {
        async run(text, args) {
            await run(text, args);
        },
        all: run,
    };
}

// export async function getMemDb(): Promise<Db> {
//     const module = await SQLiteESMFactory();
//     const sqlite3 = SQLite.Factory(module);
//     // @ts-ignore
//     const vfs = new MemoryAsyncVFS();
//     await vfs.isReady;
//     sqlite3.vfs_register(vfs, true);
//     const dbid = await sqlite3.open_v2('ide-db');
//     return { api: sqlite3, id: dbid };
// }
