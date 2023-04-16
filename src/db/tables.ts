import { Library, Sandbox } from '../to-ast/library';
import { Map } from '../types/mcst';
import { definitionsConfig, namesConfig } from './library';
import { sandboxesConfig } from './sandbox';

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
    const tables: TableConfig[] = [
        namesConfig,
        definitionsConfig,
        sandboxesConfig,
    ];

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
