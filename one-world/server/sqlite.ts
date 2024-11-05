import sqlite from 'better-sqlite3';
import { ServerBackend } from './json-git';

const ts = `created DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated DATETIME DEFAULT CURRENT_TIMESTAMP,`;

const tables: string[] = [];

const top_shared = `
    module TEXT NOT NULL,

    body TEXT NOT NULL, -- jsonified nodes, root, nextLoc, auxiliaries, testConfig(??)

    ${ts}
`;

tables.push(`
CREATE TABLE IF NOT EXISTS toplevels (
    id TEXT NOT NULL,
    hash TEXT NOT NULL,

    ${top_shared}

    PRIMARY KEY (hash, id)
)
`);

tables.push(`
CREATE TABLE IF NOT EXISTS edited_documents_toplevels (
    topid TEXT NOT NULL,
    docid TEXT NOT NULL,
    hash TEXT, -- might be null if this is a new toplevel

    ${top_shared}

    PRIMARY KEY (docid, topid)
)
`);

const doc_shared = `
    title TEXT NOT NULL,
    published DATETIME,
    module TEXT NOT NULL,
    evaluator TEXT NOT NULL,

    body TEXT NOT NULL, -- jsonified nodes, nextLoc, nsAliases

    ${ts}
`;

tables.push(`
CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    hash TEXT NOT NULL,

    ${doc_shared}

    PRIMARY KEY (hash, id)
)
`);

tables.push(`
CREATE TABLE IF NOT EXISTS edited_documents (
    id TEXT PRIMARY KEY,

    ${doc_shared}
)
`);

tables.push(`
CREATE TABLE IF NOT EXISTS edited_documents_history (
    id INTEGER PRIMARY KEY,

    ${doc_shared}
)
`);

// export const sqliteBackend = (dbPath: string): ServerBackend => {
//     const db = sqlite(dbPath);

//     db.prepare(
//         `
//       `,
//     ).run();

//     // return {};
// };
