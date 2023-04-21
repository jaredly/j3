import { UpdateMap } from '../../web/store';
import { emptyMap } from '../parse/parse';
import { Library, Sandbox } from '../to-ast/library';
import { Map } from '../types/mcst';
import { Db, createTable } from './tables';

// Configs

export const sandboxesConfig = {
    name: 'sandboxes',
    params: [
        { name: 'id', config: 'text primary key' },
        { name: 'title', config: 'text not null' },
        { name: 'created_date', config: 'integer not null' },
        { name: 'updated_date', config: 'integer not null' },
        { name: 'version', config: 'integer not null' },
        { name: 'settings', config: 'text' },
    ],
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
        { name: 'id', config: 'integer primary key' },
        {
            name: 'item',
            config: 'text check(json_valid(item)) not null',
        },
    ],
});

// Getters

export const getSandboxes = async (db: Db) => {
    const sandboxes: Sandbox['meta'][] = [];
    await db
        .all(
            `SELECT id, title, created_date, updated_date, version, settings from sandboxes`,
        )
        .then((rows) =>
            rows.forEach(
                ({
                    id,
                    title,
                    created_date,
                    updated_date,
                    version,
                    settings,
                }) => {
                    sandboxes.push({
                        id: id as string,
                        title: title as string,
                        created_date: created_date as number,
                        updated_date: updated_date as number,
                        version: version as number,
                        settings: settings
                            ? JSON.parse(settings as string)
                            : {
                                  namespace: [],
                              },
                    });
                },
            ),
        );
    return sandboxes;
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
        .all(`SELECT id, item from ${sandboxHistoryTable(meta.id)}`)
        .then((rows) =>
            rows.forEach(({ item }) => {
                history.push(JSON.parse(item as string));
            }),
        );

    return { meta, map, root: -1, history };
};

// Updaters

export const updateSandboxMeta = async (db: Db, meta: Sandbox['meta']) => {
    await db.run(
        `update sandboxes set title=?, created_date=?, updated_date=?, version=?, settings=? where id=?;`,
        [
            meta.title,
            meta.created_date,
            meta.updated_date,
            meta.version,
            JSON.stringify(meta.settings),
            meta.id,
        ],
    );
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
        settings: { namespace: [] },
    };
    const map = emptyMap();

    await transact(db, async () => {
        await db.run(`insert into sandboxes values (?, ?, ?, ?, ?, ?);`, [
            meta.id,
            meta.title,
            meta.created_date,
            meta.updated_date,
            meta.version,
            JSON.stringify(meta.settings),
        ]);
        await createTable(db, sandboxNodesConfig(id));
        await createTable(db, sandboxHistoryConfig(id));

        await addUpdateNodes(db, id, map);
    });

    return { meta, history: [], map, root: -1 };
};

export const transact = async (db: Db, fn: () => Promise<void>) => {
    await db.run('begin;');
    await fn();
    await db.run('commit;');
};

/** Does not wrap in a transaction */
export const addUpdateNodes = async (db: Db, id: string, map: UpdateMap) => {
    for (let key of Object.keys(map)) {
        if (map[+key]) {
            const value = JSON.stringify(map[+key]);
            await db.run(
                `insert into ${sandboxNodesTable(
                    id,
                )} values (?, ?) on conflict do update set value=?`,
                [+key, value, value],
            );
        } else {
            await db.run(`delete from ${sandboxNodesTable(id)} where idx=?`, [
                +key,
            ]);
        }
    }
};

export const addUpdateHistoryItems = async (
    db: Db,
    id: string,
    history: Sandbox['history'],
) => {
    for (let item of history) {
        const value = JSON.stringify(item);
        await db.run(
            `insert into ${sandboxHistoryTable(
                id,
            )} values (?, ?) on conflict do update set item=?`,
            [item.id, value, value],
        );
    }
};
