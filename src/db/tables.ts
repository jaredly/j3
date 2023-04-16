import { Library, Sandbox } from '../to-ast/library';
import { Map } from '../types/mcst';

export type Db_ = { api: SQLiteAPI; id: number };

export type Db = {
    run(text: string, args?: (number | string | null)[]): Promise<void>;
    all(
        text: string,
        args?: (number | string | null)[],
    ): Promise<{ [key: string]: number | string | null }[]>;
};

export type TableConfig = {
    name: string;
    params: { name: string; config: string }[];
};

export const initialize = async (db: Db) => {
    const names = (await db.all('SELECT name FROM sqlite_schema')).map(
        (m) => m.name,
    );
    for (let config of tables) {
        if (!names.includes(config.name)) {
            await createTable(db, config);
        }
    }
};

export const createTable = async (db: Db, { name, params }: TableConfig) => {
    await db.run(
        `create table ${name} (${params
            .map(({ name, config }) => `${name} ${config}`)
            .join(',\n')})`,
    );
};

export type NamesRow = {
    hash: string;
    map: { [key: string]: string };
    root_date?: number;
};

export const getNames = async (db: Db) => {
    const roots: { hash: string; date: number }[] = [];
    const names: Library['namespaces'] = {};
    await db.all(`SELECT hash, map, root_date from names`).then((rows) => {
        rows.forEach(({ hash, map: mapRaw, root_date }) => {
            const map = JSON.parse(mapRaw as string);
            if (root_date) {
                roots.push({ hash: hash as string, date: root_date as number });
            }
            names[hash as string] = map;
        });
    });
    return { names, roots };
};

export const namesConfig = {
    name: 'names',
    params: [
        { name: 'hash', config: 'text primary key' },
        { name: 'map', config: 'text check(json_valid(map)) not null' },
        { name: 'root_date', config: 'integer' },
    ],
};

export const getDefinitions = async (db: Db) => {
    const definitions: Library['definitions'] = {};
    await db.all(`SELECT hash, value from definitions`).then((rows) => {
        rows.forEach(({ hash, value }) => {
            definitions[hash as string] = JSON.parse(value as string);
        });
    });
    return definitions;
};

export const definitionsConfig = {
    name: 'definitions',
    params: [
        { name: 'hash', config: 'text primary key' },
        { name: 'value', config: 'text check(json_valid(value)) not null' },
    ],
};

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
    await db.run('commit;');
    // ooh I should make a root node for the nodes table
    return { meta, history: [], map: {}, root: -1 };
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

export const tables: TableConfig[] = [
    namesConfig,
    definitionsConfig,
    sandboxesConfig,
];

// import localforage from 'localforage';

// const name = 'jerd';

// export const names = localforage.createInstance({
//     name,
//     storeName: 'names',
// });

// export const definitions = localforage.createInstance({
//     name,
//     storeName: 'definitions',
// });

// export const sandboxes = localforage.createInstance({
//     name,
//     storeName: 'sandboxes',
// });

// export const sandboxNodes = (id: string) =>
//     localforage.createInstance({
//         name,
//         storeName: `sandboxNodes_${id}`,
//     });

// export const sandboxHistory = (id: string) =>
//     localforage.createInstance({
//         name,
//         storeName: `sandboxHistory_${id}`,
//     });

// ergh, but I would kinda like some transactionality.
// and so I'm left wanting sqlite again.
