import { relations, sql } from 'drizzle-orm';
import {
    blob,
    int,
    primaryKey,
    SQLiteColumn,
    sqliteTable,
    SQLiteTextJsonBuilder,
    text,
} from 'drizzle-orm/sqlite-core';
import { EvaluatorPath, HistoryItem } from '../shared/state2';
import { Module } from './hashings';

type JsonText<TName extends string, Data> = SQLiteTextJsonBuilder<{
    name: TName;
    dataType: 'json';
    columnType: 'SQLiteTextJson';
    data: Data;
    driverParam: string;
    enumValues: undefined;
}>;

const json =
    <Data>() =>
    <TName extends string>(name: TName) =>
        text(name, { mode: 'json' }) as JsonText<TName, Data>;

const ts = {
    created: int('created')
        .notNull()
        .default(sql`(unixepoch(current_timestamp))`),
    updated: int('updated')
        .notNull()
        .default(sql`(unixepoch(current_timestamp))`),
} as const;

const topShared = {
    // this is the module that this toplevel thinks it belongs do.
    // when it gets yoinked into a document, and this module is not the same
    // as the one where it lands, we'll indicate that in the UI.
    // Q: if a toplevel has multiple exports, can they be rearranged to live in
    // different modules? nopedynope.
    // When this toplevel is parsed, and there are exports, they get plopped onto
    // this /module/'s `toplevels` thing. although it probably shouldn't be called `toplevels` tbh.
    module: text('module').notNull(),
    recursives: json<string[]>()('recursives').notNull(), // a list of IDs that are mutually recursive. sorted lexigraphically.
    // a list of backlinks to siblings (in the same module) that accessorize some export of this toplevel
    // I guess I probably want it to be {topid: string, loc: number, myloc: number}[]
    // for the sake of completeness.
    accessories: text('accessories', { mode: 'json' }).notNull(),
    // jsonified nodes, root, nextLoc, auxiliaries, testConfig(??)
    body: text('body', { mode: 'json' }).notNull(),
    ...ts,
} as const;

// MARK: ByHash

export const toplevelsTable = sqliteTable(
    'toplevels',
    {
        id: text('id').notNull(),
        hash: text('hash').notNull(),
        // the 'previous hash' of this toplevel. used for ordering revisions of a toplevel, for finding "least common ancestor"
        // this is /not/ included in the 'hash' calculation, but is only used for local record-keeping
        prevHash: text('hash'),
        ...topShared,
    },
    (table) => ({
        pk: primaryKey({ columns: [table.id, table.hash] }),
    }),
);

const docShared = {
    title: text('title').notNull(),
    published: int('published'), // datetime of publishment, if present
    evaluator: json<EvaluatorPath>()('evaluator').notNull(),
    body: text('body', { mode: 'json' }).notNull(), // jsonified nodes, nextLoc, nsAliases
    ...ts,
} as const;

export const documents = sqliteTable(
    'documents',
    {
        id: text('id').notNull(),
        hash: text('hash').notNull(),
        archived: int('archived'), // datetime of archival, if present
        ...docShared,
    },
    (table) => ({
        pk: primaryKey({ columns: [table.id, table.hash] }),
    }),
);

const jsonM = <TName extends keyof Module>(name: TName) =>
    text(name, { mode: 'json' }) as JsonText<TName, Module[TName]>;

// type IdHashMap = Record<string, { id: string; hash: string }>;

const modulesShared = {
    // exports from toplevels y'all -- this is derived data!
    terms: jsonM('terms').notNull().default({}),

    // These all are manually added:
    assets: jsonM('assets').notNull().default({}),
    submodules: jsonM('submodules').notNull().default({}),
    evaluators: jsonM('evaluators').notNull().default([]),
    aliases: jsonM('aliases').notNull().default({}),
    artifacts: jsonM('artifacts').notNull().default({}),

    ...ts,
} as const;

export const modules = sqliteTable(
    'modules',
    {
        // Q: do we need an `id` that's separate from the ... `hash`?
        // hm it would be for tracking ~identity over time. which I do
        // think is something I'm interested in. Yeah.
        // and for like, in-memory representation, I think I'll be passing
        // around module ids, not hashes. And then we compute the hashes.
        id: text('id').notNull(),
        hash: text('hash').notNull(),

        ...modulesShared,
    },
    (table) => ({
        pk: primaryKey({ columns: [table.id, table.hash] }),
    }),
);

export const assets = sqliteTable(
    'assets',
    {
        id: text('id').notNull(),
        hash: text('hash').notNull(),
        data: blob('data').notNull(),
        mime: text('mime').notNull(),
        meta: text('meta', { mode: 'json' }), // like width/height for images
    },
    (table) => ({
        pk: primaryKey({ columns: [table.id, table.hash] }),
    }),
);

// MARK: Versioning

export const commits = sqliteTable('commits', {
    hash: text('hash').primaryKey(), // a hash of the commit
    root: text('root').notNull(), // hash of the root module? yeah. root module has id "root"
    message: text('message').notNull(),
    parent: text('parent'), // root commit has no parent
    author: text('author'),
    created: ts.created,
});

export const commitRelations = relations(commits, ({ one }) => ({
    module: one(modules, {
        fields: [commits.root],
        references: [modules.hash],
    }),
}));

// When we commit, we squash all the granular history into a single row here, which we can
// hydrate if we want to get fine-grained history of a past commit.
export const commitEditedHistory = sqliteTable('commit_edited_history', {
    hash: text('hash').primaryKey(), // the hash of the commit
    doc: text('doc').notNull(), // the document this came from
    history: json<HistoryItem[]>()('history').notNull(),
});

export const branches = sqliteTable('branches', {
    name: text('name').primaryKey(), // `main` branch will be our only one to start
    head: text('head').notNull(), // commit hash,
});

export const branchRelations = relations(branches, ({ one }) => ({
    commit: one(commits, {
        fields: [branches.head],
        references: [commits.hash],
    }),
}));

// MARK: Editeds

export const editedDocuments = sqliteTable(
    'edited_documents',
    {
        id: text('id').notNull(),
        branch: text('branch').notNull(),
        root: text('root').notNull(), // the 'root' hash of the whole module tree that we're based on.
        ...docShared,
    },
    (table) => ({ pk: primaryKey({ columns: [table.id, table.branch] }) }),
);

export const editedDocumentsToplevels = sqliteTable(
    'edited_documents_toplevels',
    {
        topid: text('topid').notNull(),
        docid: text('docid').notNull(),
        branch: text('branch').notNull(),
        hash: text('hash'), // might be null if this is a new toplevel
        ...topShared,
    },
    (table) => ({
        pk: primaryKey({ columns: [table.docid, table.branch, table.topid] }),
    }),
);

export const editedDocumentsToplevelsRelations = relations(
    editedDocumentsToplevels,
    ({ one }) => ({
        document: one(editedDocuments, {
            fields: [
                editedDocumentsToplevels.docid,
                editedDocumentsToplevels.branch,
            ],
            references: [editedDocuments.id, editedDocuments.branch],
        }),
    }),
);

export const editedDocumentsModules = sqliteTable(
    'edited_documents_modules',
    {
        id: text('id').notNull(),
        docid: text('docid').notNull(),
        branch: text('branch').notNull(),
        hash: text('hash'), // might be null if this is a new module
        ...modulesShared,
    },
    (table) => ({
        pk: primaryKey({ columns: [table.docid, table.branch, table.id] }),
    }),
);

export const editedDocumentsModulesRelations = relations(
    editedDocumentsModules,
    ({ one }) => ({
        document: one(editedDocuments, {
            fields: [
                editedDocumentsModules.docid,
                editedDocumentsModules.branch,
            ],
            references: [editedDocuments.id, editedDocuments.branch],
        }),
    }),
);

export const editedDocumentsHistory = sqliteTable(
    'edited_documents_history',
    {
        doc: text('doc').notNull(),
        branch: text('branch').notNull(),
        session: text('session').notNull(),
        idx: int('idx').notNull(),
        reverts: int('reverts'),
        changes: text('changes', { mode: 'json' }).notNull(), // json blob
        created: ts.created,
    },
    (table) => ({
        pk: primaryKey({ columns: [table.doc, table.branch, table.idx] }),
    }),
);

export const editedDocumentsHistoryRelations = relations(
    editedDocumentsHistory,
    ({ one }) => ({
        document: one(editedDocuments, {
            fields: [editedDocumentsHistory.doc, editedDocumentsHistory.branch],
            references: [editedDocuments.id, editedDocuments.branch],
        }),
    }),
);

export const editedDocumentsRelations = relations(
    editedDocuments,
    ({ many }) => ({
        toplevels: many(editedDocumentsToplevels),
        modules: many(editedDocumentsModules),
        history: many(editedDocumentsHistory),
    }),
);

// MARK: Latest

// export const latestToplevels = sqliteTable('latest_toplevels', {
//     id: text('id').primaryKey(),
//     hash: text('hash').notNull(),
//     module: text('module').notNull(),
//     ...ts,
// });

// export const latestDocuments = sqliteTable('latest_documents', {
//     id: text('id').primaryKey(),
//     hash: text('hash').notNull(),
//     module: text('module').notNull(),
//     ...ts,
// });

// export const latestModules = sqliteTable('latest_modules', {
//     id: text('id').primaryKey(),
//     hash: text('hash').notNull(),
//     ...ts,
// });

// MARK: Caches

export const parseCache = sqliteTable(
    'parse_cache',
    {
        topHash: text('topHash').notNull(),
        topId: text('topId').notNull(),
        evaluator: text('evaluator', { mode: 'json' }).notNull(),

        exports: text('exports', { mode: 'json' }).notNull(), // string[]
        references: text('references', { mode: 'json' }).notNull(), // string[], the topids of referenced things
        accessories: text('accessories', { mode: 'json' }).notNull(), // string[], the topids of the "targets" of the association

        body: text('body', { mode: 'json' }).notNull(), // the jsonified full parseResult
        ...ts,
    },
    (table) => ({
        pk: primaryKey({
            columns: [table.topHash, table.topId, table.evaluator],
        }),
    }),
);

// GOTTA BE
export const typeCache = sqliteTable('type_cache', {
    topHash: text('topHash').notNull(),
    // So, here we only do one type per hash, meaning that
    // mutually recursive things get lumped together. That makes sense, right?
    // topId: text('topId').notNull(),
    evaluator: text('evaluator', { mode: 'json' }).notNull(),
    tinfo: text('tinfo', { mode: 'json' }).notNull(), // json blob
});
