import { UpdateMap } from '../../web/store';
import { emptyMap } from '../parse/parse';
import { Library, Sandbox } from '../to-ast/library';
import { Map } from '../types/mcst';
import { Db, createTable } from './tables';

export const getSandboxes = async (db: Db) => {
    const sandboxes: Sandbox['meta'][] = [];
    await db
        .all(
            `SELECT id, title, created_date, updated_date, version from sandboxes`,
        )
        .then((rows) =>
            rows.forEach(
                ({ id, title, created_date, updated_date, version }) => {
                    sandboxes.push({
                        id: id as string,
                        title: title as string,
                        created_date: created_date as number,
                        updated_date: updated_date as number,
                        version: version as number,
                    });
                },
            ),
        );
    return sandboxes;
};

export const sandboxesConfig = {
    name: 'sandboxes',
    params: [
        { name: 'id', config: 'text primary key' },
        { name: 'title', config: 'text not null' },
        { name: 'created_date', config: 'integer not null' },
        { name: 'updated_date', config: 'integer not null' },
        { name: 'version', config: 'integer not null' },
    ],
};

/** Does wrap in a transaction */
export const addSandbox = async (
    db: Db,
    id: string,
    title: string,
): Promise<Sandbox> => {
    const meta: Sandbox['meta'] = {
        id,
        title,
        created_date: Date.now() / 1000,
        updated_date: Date.now() / 1000,
        version: 0,
    };
    await db.run('begin;');
    await db.run(`insert into sandboxes values (?, ?, ?, ?, ?);`, [
        meta.id,
        meta.title,
        meta.created_date,
        meta.updated_date,
        meta.version,
    ]);
    await createTable(db, sandboxNodesConfig(id));
    await createTable(db, sandboxHistoryConfig(id));

    const map = emptyMap();
    await persistMap(db, id, map);
    await db.run('commit;');

    return { meta, history: [], map, root: -1 };
};

export const transact = async (db: Db, fn: () => Promise<void>) => {
    await db.run('begin;');
    await fn();
    await db.run('commit;');
};

/** Does not wrap in a transaction */
export const addDefinitions = async (
    db: Db,
    definitions: Library['definitions'],
) => {
    for (let hash of Object.keys(definitions)) {
        const value = JSON.stringify(definitions[hash]);
        await db.run(`insert into definitions values (?, ?)`, [hash, value]);
    }
};

/** Does not wrap in a transaction */
export const addNamespaces = async (
    db: Db,
    namespaces: Library['namespaces'],
    root?: { hash: string; date: number },
) => {
    for (let hash of Object.keys(namespaces)) {
        const value = JSON.stringify(namespaces[hash]);
        await db.run(`insert into names values (?, ?, ?)`, [
            hash,
            value,
            hash === root?.hash ? root.date : null,
        ]);
    }
};

/** Does not wrap in a transaction */
export const persistMap = async (db: Db, id: string, map: UpdateMap) => {
    for (let key of Object.keys(map)) {
        if (map[+key]) {
            const value = JSON.stringify(map[+key]);
            await db.run(
                `insert into ${sandboxNodesTable(
                    id,
                )} values (?, ?) on conflict do update set value=?`,
                [+key, value, value],
            );
        }
    }
};

export const getSandbox = async (
    db: Db,
    meta: Sandbox['meta'],
): Promise<Sandbox> => {
    const map: Sandbox['map'] = {};
    await db
        .all(`SELECT idx, value from ${sandboxNodesTable(meta.id)}`)
        .then((rows) =>
            rows.forEach(({ idx, value }) => {
                map[idx as number] = JSON.parse(value as string);
            }),
        );

    const history: Sandbox['history'] = [];
    await db
        .all(`SELECT id, value from ${sandboxHistoryTable(meta.id)}`)
        .then((rows) =>
            rows.forEach(({ id, value }) => {
                history.push({
                    id: id as number,
                    update: JSON.parse(value as string),
                });
            }),
        );

    return { meta, map, root: -1, history };
};

export const sandboxNodesTable = (id: string) => `sandbox_${id}_nodes`;

export const sandboxNodesConfig = (id: string) => ({
    name: sandboxNodesTable(id),
    params: [
        { name: 'idx', config: 'integer primary key' },
        {
            name: 'value',
            config: 'text check(json_valid(value)) not null',
        },
    ],
});

export const sandboxHistoryTable = (id: string) => `sandbox_${id}_updates`;

export const sandboxHistoryConfig = (id: string) => ({
    name: sandboxHistoryTable(id),
    params: [
        { name: 'id', config: 'integer primary key autoincrement' },
        {
            name: 'value',
            config: 'text check(json_valid(value)) not null',
        },
    ],
});
