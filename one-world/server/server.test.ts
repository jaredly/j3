import sqlite from 'bun:sqlite';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/bun-sqlite';

import { expect, test } from 'bun:test';
import * as dk from 'drizzle-kit/payload';
import { splitGraphemes } from '../../src/parse/splitGraphemes';
import {
    handleDropdown,
    handleMovement,
    handleUpDown,
} from '../client/cli/edit/handleMovement';
import { handleUpdate } from '../client/cli/edit/handleUpdate';
import { parseAndCache, render, RState } from '../client/cli/render';
import { newStore, WS } from '../client/newStore2';
import { AnyEvaluator } from '../evaluators/boot-ex/types';
import { NopEvaluator, SimplestEvaluator } from '../evaluators/simplest';
import { Caches, Context, evaluate } from '../graphh/by-hand';
import { aBlockToString } from '../shared/IR/block-to-attributed-text';
import { ParseAndEval, selectEODoc } from '../shared/IR/nav';
import { DocStage } from '../shared/state2';
import {
    DrizzleDb,
    getDoc,
    getEditedDoc,
    getHeadRoot,
    getModule,
    newStage,
    saveDocument,
} from './drizzle';
import * as tb from './schema';
import { seed } from './seed';
import { showChanges } from './showChanges';
import { ServerMessage } from './run';
import { applyChanges } from '../shared/update2';
import { commitDoc } from './commit';
import { createBLAKE3 } from 'hash-wasm';
import { hashit } from './hashings';

const prepare = (async () => {
    const prev = await dk.generateSQLiteDrizzleJson({});
    const schema = await dk.generateSQLiteDrizzleJson(tb);
    return dk.generateSQLiteMigration(prev, schema);
})();

const emptyDb = async (name = ':memory:'): Promise<DrizzleDb> => {
    const db = sqlite.open(name);

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
    Undo: 'UNDO',
    Redo: 'REDO',
};

const runText = (
    ds: DocStage,
    text: string | string[],
    ws: WS = nows,
    ev: AnyEvaluator = NopEvaluator,
) => {
    const store = newStore(ds!, ws, null);

    const W = 200;

    const { parseCache, caches, ctx } = parseAndCache(store, ds.id, {}, ev);
    updateModuleExports(parseCache);
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

    function updateModuleExports(parseCache: ParseAndEval<unknown>) {
        const state = store.getState();
        Object.entries(parseCache).forEach(([tid, value]) => {
            const top = state.toplevels[tid];
            value.parseResult.exports.forEach((exp) => {
                const name = top.nodes[exp.loc[0][1]];
                if (name.type !== 'id') {
                    throw new Error(`export loc must be id`);
                }
                if (name.ref) {
                    throw new Error(`export id must not have a ref`);
                }
                state.modules[top.module].terms[name.text] = {
                    hash: '',
                    id: tid,
                    idx: exp.loc[0][1],
                };
            });
        });
        // TODO remove staleee
    }

    singles.forEach((key) => {
        const { parseCache, caches, ctx } = parseAndCache(store, ds.id, {}, ev);
        // state.modules ... are going to be mutable for now.
        updateModuleExports(parseCache);
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

    {
        const { parseCache, caches, ctx } = parseAndCache(store, ds.id, {}, ev);
        // state.modules ... are going to be mutable for now.
        updateModuleExports(parseCache);
    }

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
    let rstate = render(W, store, ds.id, parseCache, {
        plainBullets: true,
        showRefHashes: true,
    });
    reval(caches, ctx, rstate, NopEvaluator);
    rstate = render(W, store, ds.id, parseCache, {
        plainBullets: true,
        showRefHashes: true,
    });
    return aBlockToString(rstate.txt, false);
};

/*

Let's talk, tests.


DS -> keys -> DS


*/

// MARK: New tests

test.only("nowww let's do some exportsss", async () => {
    const text = 'x 1 (def x 10) x 23';
    const doc = newStage('lol', 10, 'na');
    const d2 = runText(doc, text, undefined, SimplestEvaluator);
    // ok forks. how do we populate the modules.
    // expect(editorToString(d2, 200)).toEqual(getEx(text));
    expect(d2.modules[d2.id].terms.x).toBeTruthy();
});

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
    Array.isArray(text) ? text[0] : '- ' + text;

const examples: (string | string[])[] = [
    'hello',
    '[one two]',
    '{yes no 123}',
    '(hello [folks yes])',
    [
        '- (hello forks)',
        '(hello folk',
        'ArrowLeft',
        'Backspace',
        'r',
        'ArrowRight',
        's)',
    ],
    // ['- hello-yall\n- folks', 'hello folks', 'ArrowUp', '-yall'],
];

test('lets do some history', () => {
    const text = ['- (hello)', '(hello folks', 'Undo'];
    // const text = ['(hello)', '(hello last things', 'Undo'];
    const doc = newStage('lol', 10, 'na');
    const d2 = runText(doc, text);
    expect(
        d2.history.map((h) => showChanges(h.changes)).join('\n\n'),
    ).toMatchSnapshot();
    expect(editorToString(d2, 200)).toEqual(getEx(text));
});

test('lets do some movement and stuff', () => {
    const text = ['- hello-yall\n- folks', 'hello folks', 'ArrowUp', '-yall'];
    const doc = newStage('lol', 10, 'na');
    const d2 = runText(doc, text);
    expect(
        d2.history.map((h) => showChanges(h.changes)).join('\n\n'),
    ).toMatchSnapshot();
    expect(editorToString(d2, 200)).toEqual(getEx(text));
});

// DS -> keys -> DS
examples.forEach((text) => {
    test('DS -> keys -> DS : ' + getEx(text), () => {
        const doc = newStage('lol', 10, 'na');
        const d2 = runText(doc, text);
        expect(editorToString(d2, 200)).toEqual(getEx(text));
    });
});

// DS -> keys&cross
// TODO: revisit once I have history items

examples.forEach((text) => {
    test('DS sync to other DS : ' + getEx(text), async () => {
        const doc = newStage('lol', 10, 'na');
        const listeners: ((msg: ServerMessage) => void)[] = [];

        const other = newStore(
            doc,
            {
                close() {},
                onMessage(fn) {
                    listeners.push(fn);
                },
                send(msg) {},
            },
            null,
        );

        const d2 = runText(doc, text, {
            close() {},
            onMessage(fn) {},
            send(msg) {
                if (msg.type === 'changes') {
                    listeners.forEach((f) => f(msg));
                }
            },
        });
        expect(editorToString(d2, 200)).toEqual(getEx(text));
        expect(editorToString(other.getState(), 200)).toEqual(getEx(text));
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
        ).toEqual(getEx(text));
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

examples.forEach((text) => {
    test('DS -> keys & sync : ' + getEx(text), async () => {
        const id = 'lol';
        const doc = newStage(id, 10, 'main');
        let tmp = doc;

        const edit = runText(doc, text, {
            close() {},
            onMessage(fn) {},
            send(msg) {
                if (msg.type === 'changes') {
                    // const ups: Updated = { toplevels: {}, selections: {} };
                    msg.items.forEach((item) => {
                        tmp = applyChanges(tmp, item.changes);
                    });
                    tmp = { ...tmp, history: tmp.history.concat(msg.items) };
                }
            },
        });

        expect(edit).toEqual(tmp);
        expect(editorToString(tmp, 200)).toEqual(getEx(text));
    });
});

examples.forEach((text) => {
    test('DS->DB->DS -> keys & sync -> DB->DS : ' + getEx(text), async () => {
        const db = await emptyDb();
        const root = await getHeadRoot(db, 'main');
        const id = 'lol';

        await saveDocument(db, newStage(id, 10, root), 'main');
        const doc = (await getEditedDoc(db, id, 'main'))!;

        const { enqueue, fin } = queue();

        const edit = runText(doc, text, {
            close() {},
            onMessage(fn) {},
            send(msg) {
                if (msg.type === 'changes') {
                    enqueue(async () => {
                        const doc = await getEditedDoc(db, id, 'main');
                        let upd = doc!;
                        if (msg.items[0].idx !== upd.history.length) {
                            throw new Error(`history out of sync`);
                        }
                        msg.items.forEach((item) => {
                            upd = applyChanges(upd, item.changes);
                        });
                        upd = {
                            ...upd,
                            history: upd.history.concat(msg.items),
                        };
                        await saveDocument(db, upd, 'main');
                    });
                }
            },
        });

        await fin();

        const dbdoc = await getEditedDoc(db, id, 'main');
        expect(dbdoc).toEqual(edit);
        expect(editorToString(dbdoc!, 200)).toEqual(getEx(text));
    });
});

test('now try to commit', async () => {
    const db = await emptyDb();
    const root = await getHeadRoot(db, 'main');

    const id = 'lol';
    await saveDocument(db, newStage(id, 10, root), 'main');

    const text = 'hello multiple folks';
    const doc = runText((await getEditedDoc(db, id, 'main'))!, text);

    await saveDocument(db, doc, 'main');

    const hasher = await createBLAKE3();
    const nroot = await commitDoc(db, id, 'main', (str) => hashit(str, hasher));

    const docModule = await getModule(db, nroot, [doc.id]);
    const docBack = await getDoc(db, doc.id, docModule!.docHash, nroot);

    expect(editorToString(docBack!, 200)).toEqual(
        '- hello\n- multiple\n- folks',
    );
});

//
// old, silly tests

// test('noww to like, make a new document?', async () => {
//     const db = await emptyDb();
//     const root = await getHeadRoot(db, 'main');
//     const id = await newDocument(db, root, 'main');
//     const ds = await getEditedDoc(db, id, 'main');
//     expect(ds).toBeTruthy();

//     const text = editorToString(runText(ds!, 'hello-folks'));

//     expect(text).toEqual('- hello-folks');
// });

// const fullRun = async (text: string) => {
//     const db = await emptyDb();
//     const root = await getHeadRoot(db, 'main');
//     const id = await newDocument(db, root, 'main');
//     const ds = await getEditedDoc(db, id, 'main');
//     expect(ds).toBeTruthy();

//     return editorToString(runText(ds!, text));
// };

/*

Fuller ender-to-end

- clean seed
- new document
- edit with `(def x 10)`
- commit it
- /x should be defined

*/
