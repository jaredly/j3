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
import {
    DrizzleDb,
    getEditedDoc,
    newDocument,
    newStage,
    saveDocument,
} from './drizzle';
import { newStore, WS } from '../client/newStore2';
import { parseAndCache, render, RState } from '../client/cli/render';
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
import { AnyEvaluator } from '../evaluators/boot-ex/types';
import { update, Updated } from '../shared/update2';

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

const nows: WS = { close() {}, onMessage(fn) {}, send(msg) {} };

const reval = (
    caches: Caches<unknown>,
    ctx: Context,
    rstate: RState,
    ev: AnyEvaluator,
) => {
    Object.keys(caches.parse).forEach((tid) => {
        rstate.parseAndEval[tid].output = evaluate(tid, ctx, ev, caches);
    });
};

const specials: { [key: string]: string } = {
    ArrowUp: 'UP',
    ArrowDown: 'DOWN',
    ArrowLeft: 'LEFT',
    ArrowRight: 'RIGHT',
    Enter: 'ENTER',
    Backspace: 'BACKSPACE',
    Tab: 'TAB',
};

const runText = (ds: DocStage, text: string | string[], ws: WS = nows) => {
    const store = newStore(ds!, ws, null);

    const W = 200;

    const ev = NopEvaluator;
    const { parseCache, caches, ctx } = parseAndCache(store, ds.id, {}, ev);
    let rstate = render(W, store, ds.id, parseCache);

    // Select the end of the document!
    const sel = selectEODoc(ds!, rstate.cache);
    expect(sel).toBeTruthy();
    store.update({ type: 'selection', doc: ds.id, selections: [sel!] });

    reval(caches, ctx, rstate, ev);

    const singles: string[] = [];
    if (Array.isArray(text)) {
        text.slice(1).forEach((line) => {
            if (specials[line]) {
                singles.push(specials[line]);
            } else {
                singles.push(...splitGraphemes(line));
            }
        });
    } else {
        singles.push(...splitGraphemes(text));
    }

    singles.forEach((key) => {
        rstate = render(W, store, ds.id, parseCache);

        if (handleDropdown(key, ds.id, store, rstate, () => {}, ev)) {
            return true;
        }

        if (
            handleUpDown(key, ds.id, store, rstate) ||
            handleMovement(key, ds.id, rstate.cache, store)
        ) {
            return true;
        }

        if (handleUpdate(key, ds.id, rstate.cache, store)) {
            return true;
        }
    });

    store.update({ type: 'selection', doc: ds.id, selections: [] });

    return store.getState();
};

const editorToString = (ds: DocStage, W = 200) => {
    const store = newStore(ds!, nows, null);
    const { parseCache, caches, ctx } = parseAndCache(
        store,
        ds.id,
        {},
        NopEvaluator,
    );
    let rstate = render(W, store, ds.id, parseCache);
    reval(caches, ctx, rstate, NopEvaluator);
    rstate = render(W, store, ds.id, parseCache);
    return aBlockToString(rstate.txt, false);
};

/*

Let's talk, tests.


DS -> keys -> DS


*/

// MARK: New tests

// DS -> DB -> DS
test('store and retrieve a newStage', async () => {
    const db = await emptyDb();
    const root = await getHeadRoot(db, 'main');
    const doc = newStage('lol', 10, root);
    await saveDocument(db, doc, 'main');
    const got = await getEditedDoc(db, doc.id, 'main');
    expect(got).toEqual(doc);
});

const getEx = (text: string | string[]) =>
    Array.isArray(text) ? text[0] : text;

const dsKeysds = async (text: string | string[]) => {
    const doc = newStage('lol', 10, 'na');
    const d2 = runText(doc, text);
    expect(editorToString(d2, 200)).toEqual('▶️ ' + getEx(text));
};

const examples: (string | string[])[] = [
    'hello',
    '[one two]',
    '{yes no 123}',
    '(hello [folks yes])',
    [
        '(hello forks)',
        '(hello folk',
        'ArrowLeft',
        'Backspace',
        'r',
        'ArrowRight',
        's)',
    ],
];

// DS -> keys -> DS
examples.forEach((text) => {
    test('DS -> keys -> DS : ' + getEx(text), async () => {
        dsKeysds(text);
    });
});

examples.forEach((text) => {
    test('DS->DB->DS -> keys -> DS->DB->DS : ' + getEx(text), async () => {
        const db = await emptyDb();
        const root = await getHeadRoot(db, 'main');

        const id = 'lol';
        await saveDocument(db, newStage(id, 10, root), 'main');

        const doc = runText((await getEditedDoc(db, id, 'main'))!, text);

        await saveDocument(db, doc, 'main');

        expect(
            editorToString((await getEditedDoc(db, id, 'main'))!, 200),
        ).toEqual('▶️ ' + getEx(text));
    });
});

const queue = () => {
    let cur = Promise.resolve<unknown>(0);
    return {
        enqueue(p: () => Promise<unknown>) {
            cur = cur.then(p);
        },
        fin() {
            return cur;
        },
    };
};

// TODO: should have like a fixture thing that runs this path with a bunch of things
examples.forEach((text) => {
    test('DS -> keys & sync : ' + getEx(text), async () => {
        const id = 'lol';
        const doc = newStage(id, 10, 'main');
        let tmp = doc;

        const edit = runText(doc, text, {
            close() {},
            onMessage(fn) {},
            send(msg) {
                if (msg.type === 'action') {
                    const ups: Updated = { toplevels: {}, selections: {} };
                    tmp = update(tmp, msg.action, ups);
                }
            },
        });

        expect(edit).toEqual(tmp);
        expect(editorToString(tmp, 200)).toEqual('▶️ ' + getEx(text));
    });
});

examples.forEach((text) => {
    test('DS->DB->DS -> keys & sync -> DB->DS : ' + getEx(text), async () => {
        const db = await emptyDb();
        const root = await getHeadRoot(db, 'main');
        const id = 'lol';

        await saveDocument(db, newStage(id, 10, root), 'main');
        const doc = (await getEditedDoc(db, id, 'main'))!;
        // let tmp = doc;

        const { enqueue, fin } = queue();

        const edit = runText(doc, text, {
            close() {},
            onMessage(fn) {},
            send(msg) {
                if (msg.type === 'action') {
                    enqueue(async () => {
                        const doc = await getEditedDoc(db, id, 'main');
                        const ups: Updated = { toplevels: {}, selections: {} };
                        const upd = update(doc!, msg.action, ups);
                        await saveDocument(db, upd, 'main');
                    });
                }
            },
        });

        await fin();

        const dbdoc = await getEditedDoc(db, id, 'main');
        expect(dbdoc).toEqual(edit);
        expect(editorToString(dbdoc!, 200)).toEqual('▶️ ' + getEx(text));
    });
});

//
// old, silly tests

test('noww to like, make a new document?', async () => {
    const db = await emptyDb();
    const root = await getHeadRoot(db, 'main');
    const id = await newDocument(db, root, 'main');
    const ds = await getEditedDoc(db, id, 'main');
    expect(ds).toBeTruthy();

    const text = editorToString(runText(ds!, 'hello-folks'));

    expect(text).toEqual('▶️ hello-folks');
});

const fullRun = async (text: string) => {
    const db = await emptyDb();
    const root = await getHeadRoot(db, 'main');
    const id = await newDocument(db, root, 'main');
    const ds = await getEditedDoc(db, id, 'main');
    expect(ds).toBeTruthy();

    return editorToString(runText(ds!, text));
};

test('and now for a little more fun...', async () => {
    expect(await fullRun('(hello')).toEqual('▶️ (hello)');
    expect(await fullRun('(goodbye folks')).toEqual('▶️ (goodbye folks)');
    expect(await fullRun('(goodbye folks)')).toEqual('▶️ (goodbye folks)');
    expect(await fullRun('(hello folks [and such] things')).toEqual(
        '▶️ (hello folks [and such] things)',
    );
});

test('hrm. what next then?', async () => {
    // const db = await emptyDb();
    // const root = await getHeadRoot(db, 'main');
    // const id = await newDocument(db, root, 'main');
    // const ds = (await getEditedDoc(db, id, 'main'))!;
    // expect(ds).toBeTruthy();
    // const text = runText(ds, '(hello folks');
    // expect(text).toEqual('▶️ (hello folks)');
});

/*

Fuller ender-to-end

- clean seed
- new document
- edit with `(def x 10)`
- commit it
- /x should be defined

*/
