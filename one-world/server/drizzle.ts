import 'dotenv/config';
import { and, eq } from 'drizzle-orm';
import { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite';
import { genId } from '../client/cli/edit/newDocument';
import { DocStage, HistoryItem } from '../shared/state2';
import { Toplevel } from '../shared/toplevels';
import * as tb from './schema';

export type DrizzleDb = BunSQLiteDatabase<typeof tb>;

export const newStage = (id: string, now: number, title = 'Untitled') => {
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
        modules: {
            [id]: {
                id,
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

export const newDocument = async (
    db: DrizzleDb,
    root: string,
    branch: string,
) => {
    const doc = newStage(genId(), Date.now());

    await db.insert(tb.editedDocuments).values([
        {
            id: doc.id,
            body: {
                nodes: doc.nodes,
                nextLoc: doc.nextLoc,
            },
            branch,
            evaluator: doc.evaluator,
            title: doc.title,
            root,
        },
    ]);

    await Promise.all(
        Object.values(doc.modules).map((module) => {
            const { ts, ...rest } = module;
            return db.insert(tb.editedDocumentsModules).values([
                {
                    docid: doc.id,
                    branch,
                    ...rest,
                    created: ts.created,
                    updated: ts.updated,
                },
            ]);
        }),
    );

    await Promise.all(
        Object.values(doc.toplevels).map((top) => {
            const { nodes, nextLoc, root, ts, ...rest } = top;
            return db.insert(tb.editedDocumentsToplevels).values([
                {
                    ...rest,
                    docid: doc.id,
                    branch,
                    body: { nodes, nextLoc, root },
                    updated: ts.updated,
                    created: ts.created,
                    // Denormalization! Which, ... ok maybe we actually don't want it, for the editeds?
                    // hmmmm.
                    accessories: [],
                    recursives: [],
                },
            ]);
        }),
    );

    return doc.id;
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
        // module: mp[mp.length - 1],
        modules: edit.modules.reduce(
            (map: DocStage['modules'], mod) => (
                (map[mod.id] = {
                    ...mod,
                    hash: mod.hash ?? undefined,
                    ts: { created: mod.created, updated: mod.updated },
                }),
                map
            ),
            {},
        ),
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
                    nextLoc: top.body.nextLoc,
                    nodes: top.body.nodes,
                    root: top.body.root,
                    ts: {
                        created: top.created,
                        updated: top.updated,
                    },
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
