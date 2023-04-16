import { Library, Sandbox } from '../to-ast/library';
import { Map } from '../types/mcst';
import { sandboxesConfig } from './sandbox';
import { Db } from './tables';

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
    roots.sort((a, b) => b.date - a.date);
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
