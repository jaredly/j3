import {
    existsSync,
    readFileSync,
    readdirSync,
    unlinkSync,
    writeFileSync,
} from 'fs';
import { join } from 'path';

const nsPrefix = `ns`;

export const separator = '⫽';

export const nameSpaces = (dataDirectory: string) => {
    const dir = join(dataDirectory, nsPrefix);
    const items = readdirSync(dir);
    return items.map((item) => ({
        path: item,
        id: readFileSync(join(dir, item), 'utf-8').trim(),
    }));
};

export const saveNameSpaces = (
    dataDirectory: string,
    mapping: Record<string, string | null>,
) => {
    Object.entries(mapping).forEach(([name, id]) => {
        const path = join(dataDirectory, nsPrefix, name);
        if (id === null) {
            if (existsSync(path)) {
                unlinkSync(path);
            }
        } else {
            writeFileSync(path, id);
        }
    });
};
