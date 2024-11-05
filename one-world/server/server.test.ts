import { BunSQLiteDatabase, drizzle } from 'drizzle-orm/bun-sqlite';
import { and, eq } from 'drizzle-orm';
import { createBLAKE3 } from 'hash-wasm';
import sqlite from 'bun:sqlite';
import {
    Module,
    hashit,
    hashModule,
    Commit,
    hashCommit,
    Branch,
} from './hashings';

import { test, expect } from 'bun:test';
import { seed } from './seed';
import * as dk from 'drizzle-kit/payload';
import * as tb from './schema';
import { genId } from '../client/cli/edit/newDocument';
import { DocStage } from '../shared/state2';
import { Toplevel } from '../shared/toplevels';
import { DrizzleDb, newDocument } from './drizzle';

const prepare = (async () => {
    const prev = await dk.generateSQLiteDrizzleJson({});
    const schema = await dk.generateSQLiteDrizzleJson(tb);
    return dk.generateSQLiteMigration(prev, schema);
})();

const emptyDb = async (): Promise<DrizzleDb> => {
    const db = sqlite.open(':memory:');

    db.exec('begin');
    (await prepare).forEach((stmt) => db.exec(stmt));
    db.exec('commit');

    const dzb = drizzle(db, { schema: tb });
    await seed(dzb);
    return dzb;
};

test('doing a little seed I guess', async () => {
    const db = await emptyDb();

    const main = await db.query.branches.findFirst({
        where: eq(tb.branches.name, 'main'),
        with: { commit: { with: { module: true } } },
    });
    expect(main).toBeTruthy();
    const { commit } = main!;
    expect(commit.module.id).toEqual('root');
});

const getHeadRoot = async (db: DrizzleDb, branch: string) => {
    const main = await db.query.branches.findFirst({
        where: eq(tb.branches.name, branch),
        with: { commit: true },
    });
    return main!.commit.root;
};

/*

Full end-to-end:

- clean seed
- new document (at root & main)
- edit the root toplevel with some text
- commit it
- load up and serialize the document in its new form

*/

test('noww to like, make a new document?', async () => {
    const db = await emptyDb();

    const root = await getHeadRoot(db, 'main');

    const id = await newDocument(db, root, 'main');
});

/*

Fuller ender-to-end

- clean seed
- new document
- edit with `(def x 10)`
- commit it
- /x should be defined

*/
