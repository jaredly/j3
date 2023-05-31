import { Library, Sandbox } from '../to-ast/library';
import { Map } from '../types/mcst';
import { definitionsConfig, namesConfig } from './library';
import { sandboxesConfig } from './sandbox';
import parseSqlite from 'sqlite-parser';

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
    const existing = (
        await db.all('SELECT name, sql FROM sqlite_schema')
    ).reduce(
        (map, row) => ((map[row.name as string] = row.sql), map),
        {} as { [name: string]: string },
    );
    const tables: TableConfig[] = [
        namesConfig,
        definitionsConfig,
        sandboxesConfig,
    ];

    for (let config of tables) {
        if (!existing[config.name]) {
            await createTable(db, config);
        } else {
            // config.
        }
    }
};

export const dropTable = async (db: Db, name: string) => {
    await db.run(`drop table ${name}`);
};

export const createTable = async (db: Db, { name, params }: TableConfig) => {
    await db.run(
        `create table ${name} (${params
            .map(({ name, config }) => `${name} ${config}`)
            .join(',\n')})`,
    );
};

export const parseColumns = (
    sql: string,
): { name: string; datatype: { type: string } & any; constraints: any[] }[] =>
    parseSqlite(sql).statement[0].definition.map(
        ({ name, datatype, definition }: any) => ({
            name,
            datatype,
            constraints: definition,
        }),
    );
