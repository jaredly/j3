import bsq from 'better-sqlite3';
import { Db } from './tables';
import { transactionQueue } from './transact';

export const getMemDb = (): Promise<Db> => {
    const db = bsq(':memory:');
    return Promise.resolve({
        all(text, args) {
            const stmt = db.prepare(text);
            const res = stmt.all(...(args ?? [])) as any[];
            return Promise.resolve(res);
        },
        run(text, args) {
            const stmt = db.prepare(text);
            stmt.run(...(args ?? []));
            return Promise.resolve();
        },
        transact: transactionQueue((text, args) => {
            const stmt = db.prepare(text);
            stmt.run(...(args ?? []));
            return Promise.resolve();
        }),
    });
};
