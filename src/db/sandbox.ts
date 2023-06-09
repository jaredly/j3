import { UpdateMap } from '../state/getKeyUpdate';
import { emptyMap } from '../parse/parse';
import { Library, Sandbox } from '../to-ast/library';
import { Map } from '../types/mcst';
import { Db, createTable, dropTable } from './tables';

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
        { name: 'deleted_date', config: 'integer' },
        { name: 'node_count', config: 'integer' },
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

export const getSandboxes = async (db: Db, just?: string) => {
    const sandboxes: Sandbox['meta'][] = [];
    await db
        .all(
            `SELECT id, title, created_date, updated_date, version, settings, deleted_date, node_count from sandboxes`,
        )
        .then((rows) => processSandboxRows(rows, sandboxes));
    return sandboxes.sort((a, b) => a.created_date - b.created_date);
};

export const getSandboxById = async (db: Db, id: string) => {
    const sandboxes: Sandbox['meta'][] = [];
    await db
        .all(
            `SELECT id, title, created_date, updated_date, version, settings, deleted_date, node_count from sandboxes where id=?`,
            [id],
        )
        .then((rows) => processSandboxRows(rows, sandboxes));
    return sandboxes.length ? getSandbox(db, sandboxes[0]) : null;
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

export const updateSandboxMeta = async (
    db: Db,
    id: string,
    meta: Partial<Sandbox['meta']>,
) => {
    const keys = Object.keys(meta);
    await db.run(
        `update sandboxes set ${keys
            .map((k) => k + `=?`)
            .join(', ')} where id=?;`,
        keys
            .map((k) =>
                k === 'settings'
                    ? JSON.stringify(meta[k])
                    : (meta[k as 'id'] as string),
            )
            .concat([id]),
        // [
        //     meta.title,
        //     meta.created_date,
        //     meta.updated_date,
        //     meta.version,
        //     JSON.stringify(meta.settings),
        //     meta.id,
        // ],
    );
};

export const setSandboxDeletedDate = async (
    db: Db,
    id: string,
    deleted: number | null,
) => {
    await db.run(`update sandboxes set deleted_date=? where id=?;`, [
        deleted,
        id,
    ]);
};

export const updateSandboxUpdatedDate = async (
    db: Db,
    id: string,
    updated: number,
    node_count: number,
) => {
    await db.run(
        `update sandboxes set updated_date=?, node_count=? where id=?;`,
        [updated, node_count, id],
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
        deleted_date: null,
        version: 0,
        settings: { namespace: ['sandbox', id], aliases: [] },
        node_count: 0,
    };
    const map = emptyMap();

    await db.transact(async () => {
        await db.run(`insert into sandboxes values (?, ?, ?, ?, ?, ?, ?, ?);`, [
            meta.id,
            meta.title,
            meta.created_date,
            meta.updated_date,
            meta.version,
            JSON.stringify(meta.settings),
            meta.deleted_date,
            meta.node_count,
        ]);
        await createTable(db, sandboxNodesConfig(id));
        await createTable(db, sandboxHistoryConfig(id));

        await addUpdateNodes(db, id, map);
    });

    return { meta, history: [], map, root: -1 };
};

export const deleteSandbox = async (db: Db, id: string) => {
    await db.transact(async () => {
        await db.run(`delete from sandboxes where id=?`, [id]);
        await dropTable(db, sandboxNodesTable(id));
        await dropTable(db, sandboxHistoryTable(id));
    });
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

function processSandboxRows(
    rows: { [key: string]: string | number | null }[],
    sandboxes: Sandbox['meta'][],
): void | PromiseLike<void> {
    return rows.forEach(
        ({
            id,
            title,
            created_date,
            updated_date,
            version,
            settings,
            deleted_date,
            node_count,
        }) => {
            const pset: Sandbox['meta']['settings'] = settings
                ? {
                      aliases: [],
                      namespace: ['sandbox', id],
                      ...JSON.parse(settings as string),
                  }
                : {
                      aliases: [],
                      namespace: ['sandbox', id],
                  };
            if (pset.namespace.length === 0) {
                pset.namespace = ['sandbox', id as string];
            }
            sandboxes.push({
                id: id as string,
                title: title as string,
                created_date: created_date as number,
                updated_date: updated_date as number,
                deleted_date: deleted_date as number | null,
                version: version as number,
                settings: pset,
                node_count: (node_count as number) ?? 0,
            });
        },
    );
}
