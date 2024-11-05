import 'dotenv/config';
import { ServerBackend } from './json-git';
import { BunSQLiteDatabase, drizzle } from 'drizzle-orm/bun-sqlite';
import * as tb from './schema';
import { genId } from '../client/cli/edit/newDocument';
import { Toplevel } from '../shared/toplevels';
import { DocStage, HistoryItem } from '../shared/state2';
import { nextAtom } from '../shared/nodes';
import { and, eq } from 'drizzle-orm';

export type DrizzleDb = BunSQLiteDatabase<typeof tb>;

export const newDocument = async (
    db: DrizzleDb,
    modulePath: string[],
    root: string,
    branch: string,
) => {
    const id = genId();
    const tid = id + ':top';

    const ts = {
        created: Date.now(),
        updated: Date.now(),
    } as const;

    const top: Toplevel = {
        id: tid,
        // module: modulePath[modulePath.length - 1],
        auxiliaries: [],
        nextLoc: 1,
        nodes: { 0: { type: 'id', loc: 0, text: '' } },
        root: 0,
        ts,
    };

    const doc: DocStage = {
        // module: modulePath[modulePath.length - 1],
        history: [],
        toplevels: { [tid]: top },
        modules: {},
        evaluator: [],
        published: null,
        id,
        title: 'Untitled',
        ts,

        nextLoc: 2,
        nodes: { 0: { id: 0, children: [], toplevel: '', ts } },
    };

    await db.insert(tb.editedDocuments).values([
        {
            id: doc.id,
            body: {
                nodes: doc.nodes,
                nextLoc: doc.nextLoc,
            },
            branch,
            evaluator: doc.evaluator,
            modulePath,
            title: doc.title,
            root,
        },
    ]);

    await Promise.all(
        Object.values(doc.toplevels).map((top) => {
            return db.insert(tb.editedDocumentsToplevels).values([
                {
                    topid: top.id,
                    docid: doc.id,
                    accessories: [],
                    module: modulePath[modulePath.length - 1],
                    body: {
                        nodes: top.nodes,
                        nextAtom: top.nextLoc,
                        root: top.root,
                    },
                    branch,
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
    const mp = edit.modulePath as string[];
    const ds: DocStage = {
        // module: mp[mp.length - 1],
        modules: {}, // nothing at the moment
        evaluator: edit.evaluator as any,
        history: edit.history
            .map(
                (item): HistoryItem => ({
                    idx: item.idx,
                    session: item.session,
                    reverts: item.reverts ?? undefined,
                    changes: item.changes as any,
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
                (map[top.topid] = {
                    id: top.topid,
                    // module: mp[mp.length - 1],
                    auxiliaries: [],
                    nextLoc: (top.body as any).nextLoc,
                    nodes: (top.body as any).nodes,
                    root: (top.body as any).root,
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
