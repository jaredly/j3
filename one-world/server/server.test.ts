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
import { DocStage, getDoc } from '../shared/state2';
import { Toplevel } from '../shared/toplevels';
import { DrizzleDb, getEditedDoc, newDocument } from './drizzle';
import { newStore, WS } from '../client/newStore2';
import { parseAndCache, render } from '../client/cli/render';
import { NopEvaluator, SimplestEvaluator } from '../evaluators/simplest';
import { splitGraphemes } from '../../src/parse/splitGraphemes';
import {
    handleDropdown,
    handleMovement,
    handleUpDown,
} from '../client/cli/edit/handleMovement';
import { handleUpdate } from '../client/cli/edit/handleUpdate';
import { Caches, Context, evaluate } from '../graphh/by-hand';
import {
    aBlockToString,
    toABlock,
} from '../shared/IR/block-to-attributed-text';
import { Path, serializePath } from '../shared/nodes';
import { selectEODoc } from '../shared/IR/nav';

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

test('smallest load & show', async () => {
    const db = await emptyDb();
    const root = await getHeadRoot(db, 'main');
    const id = await newDocument(db, root, 'main');
    const ds = await getEditedDoc(db, id, 'main');
});

/*

Full end-to-end:

- clean seed
- new document (at root & main)
- edit the root toplevel with some text
- commit it
- load up and serialize the document in its new form

*/

const nows: WS = { close() {}, onMessage(fn) {}, send(msg) {} };

const runText = (ds: DocStage, text: string) => {
    const store = newStore(ds!, nows, null);
    const id = ds.id;

    const W = 200;

    const ev = NopEvaluator;
    const { parseCache, caches, ctx } = parseAndCache(store, id, {}, ev);
    let rstate = render(W, store, id, parseCache);

    // Select the end of the document!
    const sel = selectEODoc(ds!, rstate.cache);
    expect(sel).toBeTruthy();
    store.update({ type: 'selection', doc: id, selections: [sel!] });

    const reval = (caches: Caches<unknown>, ctx: Context) => {
        Object.keys(caches.parse).forEach((tid) => {
            rstate.parseAndEval[tid].output = evaluate(tid, ctx, ev, caches);
        });
    };

    reval(caches, ctx);

    const rerender = () => {
        const { parseCache, caches, ctx } = parseAndCache(
            store,
            id,
            rstate.parseAndEval,
            ev,
        );

        rstate = render(W, store, id, parseCache);
        reval(caches, ctx);
    };

    const keys = splitGraphemes(text);

    const kick = () => {};

    keys.forEach((key) => {
        if (handleDropdown(key, id, store, rstate, kick, ev)) {
            return true;
        }

        if (
            handleUpDown(key, id, store, rstate) ||
            handleMovement(key, id, rstate.cache, store)
        ) {
            return true;
        }
        if (handleUpdate(key, id, rstate.cache, store)) {
            return true;
        }
    });

    rerender();

    return aBlockToString(rstate.txt, false);
};

test('noww to like, make a new document?', async () => {
    const db = await emptyDb();
    const root = await getHeadRoot(db, 'main');
    const id = await newDocument(db, root, 'main');
    const ds = (await getEditedDoc(db, id, 'main'))!;
    expect(ds).toBeTruthy();

    const text = runText(ds, 'hello-folks');

    expect(text).toEqual('▶️ hello-folks');
});

test('and now for a little more fun...', async () => {
    const db = await emptyDb();
    const root = await getHeadRoot(db, 'main');
    const id = await newDocument(db, root, 'main');
    const ds = (await getEditedDoc(db, id, 'main'))!;
    expect(ds).toBeTruthy();

    const text = runText(ds, '(hello');

    expect(text).toEqual('▶️ (hello)');
});

/*

Fuller ender-to-end

- clean seed
- new document
- edit with `(def x 10)`
- commit it
- /x should be defined

*/
