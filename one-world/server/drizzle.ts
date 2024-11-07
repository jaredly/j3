import 'dotenv/config';
import { and, eq, sql } from 'drizzle-orm';
import { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite';
import { genId } from '../client/cli/edit/newDocument';
import { DocStage, HashedMod, HistoryItem, Mod } from '../shared/state2';
import { Toplevel, Toplevels } from '../shared/toplevels';
import * as tb from './schema';
import { Updated } from '../shared/update2';
import { hashit, norm, normDoc } from './hashings';
import { createBLAKE3 } from 'hash-wasm';

export type DrizzleDb = BunSQLiteDatabase<typeof tb>;

export const newStage = (
    id: string,
    now: number,
    root: string,
    title = 'Untitled',
) => {
    const tid = id + ':top';

    const ts = { created: now, updated: now } as const;

    const doc: DocStage = {
        id,
        title,
        history: [],
        toplevels: {
            [tid]: {
                id: tid,
                auxiliaries: [],
                module: id,
                nextLoc: 1,
                nodes: { 0: { type: 'id', loc: 0, text: '' } },
                root: 0,
                ts,
            },
        },
        root,
        modules: {
            [id]: {
                id,
                path: ['root'],
                hash: null,
                docHash: null,
                aliases: {},
                artifacts: {},
                assets: {},
                evaluators: [],
                submodules: {},
                terms: {},
                ts,
            },
        },
        evaluator: [],
        published: null,

        nextLoc: 2,
        nodes: {
            0: { id: 0, children: [1], toplevel: '', ts },
            1: { id: 1, children: [], toplevel: tid, ts },
        },
        ts,
    };

    return doc;
};

const saveDoc = (db: DrizzleDb, doc: DocStage, branch: string) => {
    const { ts, nodes, nextLoc, ...rest } = doc;
    const docval = {
        ...rest,
        id: doc.id,
        branch,
        body: { nodes, nextLoc },
        updated: ts.updated,
        created: ts.created,
    };
    return db
        .insert(tb.editedDocuments)
        .values([docval])
        .onConflictDoUpdate({
            target: [tb.editedDocuments.id, tb.editedDocuments.branch],
            set: docval,
        });
};

const saveTop = (
    db: DrizzleDb,
    docId: string,
    top: Toplevel,
    branch: string,
) => {
    const { nodes, nextLoc, root, ts, ...rest } = top;
    const values = {
        ...rest,
        docid: docId,
        branch,
        body: { nodes, nextLoc, root },
        updated: ts.updated,
        created: ts.created,
        // Denormalization! Which, ... ok maybe we actually don't want it, for the editeds?
        // hmmmm.
        accessories: [],
        recursives: [],
    };
    return db
        .insert(tb.editedDocumentsToplevels)
        .values([values])
        .onConflictDoUpdate({
            target: [
                tb.editedDocumentsToplevels.docid,
                tb.editedDocumentsToplevels.branch,
                tb.editedDocumentsToplevels.id,
            ],
            set: values,
        });
};

export const saveUpdates = async (
    db: DrizzleDb,
    doc: DocStage,
    branch: string,
    updates: Updated,
) => {
    if (updates.doc) {
        await saveDoc(db, doc, branch);
    }
    for (let id of Object.keys(updates.toplevels)) {
        await saveTop(db, doc.id, doc.toplevels[id], branch);
    }
};

export const saveMod = (
    db: DrizzleDb,
    docId: string,
    mod: Mod,
    branch: string,
) => {
    const { ts, ...rest } = mod;
    const value = {
        docid: docId,
        branch,
        ...rest,
        created: ts.created,
        updated: ts.updated,
    };
    return db
        .insert(tb.editedDocumentsModules)
        .values([value])
        .onConflictDoUpdate({
            target: [
                tb.editedDocumentsModules.docid,
                tb.editedDocumentsModules.branch,
                tb.editedDocumentsModules.id,
            ],
            set: value,
        });
};

export const saveHistory = (
    db: DrizzleDb,
    docId: string,
    item: HistoryItem,
    branch: string,
) => {
    const value = {
        branch,
        ...item,
        doc: docId,
    };
    return db
        .insert(tb.editedDocumentsHistory)
        .values([value])
        .onConflictDoUpdate({
            target: [
                tb.editedDocumentsHistory.doc,
                tb.editedDocumentsHistory.branch,
                tb.editedDocumentsHistory.idx,
            ],
            set: value,
        });
};

export const saveDocument = async (
    db: DrizzleDb,
    doc: DocStage,
    branch: string,
) => {
    await saveDoc(db, doc, branch);

    await Promise.all(
        Object.values(doc.history).map((history) =>
            saveHistory(db, doc.id, history, branch),
        ),
    );

    await Promise.all(
        Object.values(doc.modules).map((module) =>
            saveMod(db, doc.id, module, branch),
        ),
    );

    await Promise.all(
        Object.values(doc.toplevels).map((top) =>
            saveTop(db, doc.id, top, branch),
        ),
    );
};

export const newDocument = async (
    db: DrizzleDb,
    root: string,
    branch: string,
) => {
    const doc = newStage(genId(), Date.now(), root);
    await saveDocument(db, doc, branch);
    return doc.id;
};

// export const findModulePath = async (db: DrizzleDb, id: string) => {
//     const path: string[] = [];
//     while (id !== 'root') {
//         if (path.length > 100) {
//             throw new Error(`Module depth too large... (loop?)`);
//         }
//         const parent = await db.query.modules.findFirst({
//             where: sql``,
//         });
//     }
// };

export const getHeadRoot = async (db: DrizzleDb, branch: string) => {
    const main = await db.query.branches.findFirst({
        where: eq(tb.branches.name, branch),
        with: { commit: true },
    });
    return main!.commit.root;
};

export const getModule = async (
    db: DrizzleDb,
    root: string,
    path: string[],
) => {
    let mod = await db.query.modules.findFirst({
        where: and(eq(tb.modules.hash, root), eq(tb.modules.id, 'root')),
    });
    for (let name of path) {
        if (!mod) return null;
        const child = mod.submodules[name];
        if (!child) return null;
        mod = await db.query.modules.findFirst({
            where: and(
                eq(tb.modules.hash, child.hash),
                eq(tb.modules.id, child.id),
            ),
        });
    }
    return mod;
};

export const getDoc = async (
    db: DrizzleDb,
    id: string,
    hash: string,
    root: string,
): Promise<DocStage | null> => {
    const doc = await db.query.documents.findFirst({
        where: and(eq(tb.documents.id, id), eq(tb.documents.hash, hash)),
    });
    if (!doc) return null;
    const toplevels: Toplevels = {};
    for (let node of Object.values(doc.body.nodes)) {
        const { hash } = node.topLock;
        const top = await db.query.toplevels.findFirst({
            where: and(
                eq(tb.toplevels.id, node.toplevel),
                eq(tb.toplevels.hash, hash),
            ),
        });
        if (!top)
            throw new Error(
                `unknown top in docnode ${hash} : ${node.toplevel}`,
            );
        toplevels[node.toplevel] = {
            ...top,
            nodes: top.body.nodes,
            nextLoc: top.body.nextLoc,
            root: top.body.root,
            ts: { created: top.created, updated: top.updated },
            auxiliaries: [],
        };
    }
    return {
        ...doc,
        ts: { updated: doc.updated, created: doc.created },
        nodes: doc.body.nodes,
        nextLoc: doc.body.nextLoc,
        history: [],
        modules: {},
        toplevels,
        root,
    };
};

export const getEditedDoc = async (
    db: DrizzleDb,
    id: string,
    branch: string,
) => {
    const edit = await db.query.editedDocuments.findFirst({
        where: and(
            eq(tb.editedDocuments.id, id),
            eq(tb.editedDocuments.branch, branch),
        ),
        with: { toplevels: true, modules: true, history: true },
    });
    if (!edit) return null;

    const { nextLoc, nodes } = edit.body as any;
    const ds: DocStage = {
        modules: edit.modules.reduce((map: DocStage['modules'], mod) => {
            const { created, updated, branch, docid, ...rest } = mod;
            map[mod.id] = {
                ...rest,
                ts: { created, updated },
            };
            return map;
        }, {}),
        root: edit.root,
        evaluator: edit.evaluator,
        history: edit.history
            .map(
                (item): HistoryItem => ({
                    idx: item.idx,
                    session: item.session,
                    reverts: item.reverts ?? undefined,
                    changes: item.changes,
                }),
            )
            .sort((a, b) => a.idx - b.idx),
        id: edit.id,
        nextLoc,
        nodes,
        published: edit.published,
        title: edit.title,
        toplevels: edit.toplevels.reduce(
            (map: Record<string, Toplevel>, top) => (
                (map[top.id] = {
                    id: top.id,
                    module: edit.id,
                    auxiliaries: [],
                    ...top.body,
                    ts: { created: top.created, updated: top.updated },
                }),
                map
            ),
            {},
        ),
        ts: {
            created: edit.created,
            updated: edit.updated,
        },
    };
    return ds;
};

// export const drizzleBackend = (
//     db: BunSQLiteDatabase<typeof tb>,
// ): ServerBackend => {
//     // branch = main
//     return {
//         newDoc(title) {
//             return newDocument(db, [], 'root', 'main');
//         },
//         async doc(id) {
//             const ds = await getEditedDoc(db, id, 'main');
//             if (ds) {
//                 return ds;
//             }
//             throw new Error('not doing decontextualized docs sry');
//         },
//         docsList() {
//             return db.query.editedDocuments.findMany();
//         },
//         update(action, doc) {
//             //
//         },
//     };
// };
