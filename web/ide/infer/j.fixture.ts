// import { test, expect } from 'vitest';
import { parseByCharacter } from '../../../src/parse/parse';
import { ListLikeContents, fromMCST } from '../../../src/types/mcst';
import { parse } from './parse-j';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { infer, typToString } from './j';
import { builtins } from './j-builtins';
import raw from './j.test.clj';

export const loadChunks = (text: string) => {
    let line = 1;
    return text.split('\n\n').map((item, i) => {
        let type: string | null = null;
        let errors: string[] = [];
        const lines = item.split('\n');
        let title = null as null | string;
        if (lines[0].startsWith(';')) {
            title = lines.shift()!;
        }
        const code = lines
            .filter((line) => {
                if (line.startsWith('->')) {
                    type = line.slice(2).trim();
                } else if (line.startsWith('x ')) {
                    errors.push(line.slice(2).trim());
                } else {
                    return true;
                }
            })
            .join('\n');
        let l = line;
        line += lines.length + 1;
        return { code, line: l, type, errors, title };
    });
};

const FILE = join(__dirname, 'j.test.clj.ts');
export const chunks = loadChunks(raw);

export type Chunk = {
    title: string | null;
    type: string | null;
    errors: string[];
    code: string;
    line: number;
};

export const runChunk = (code: string) => {
    const { map } = parseByCharacter(code, null);
    const idx = (map[-1] as ListLikeContents).values[0];
    const node = fromMCST(idx, map);
    const parseErrors = {};
    const expr = parse(node, parseErrors);
    if (!expr) {
        return { errors: Object.values(parseErrors) };
    }
    const typs = {};
    try {
        return { type: infer(builtins, expr, typs), errors: [] };
    } catch (err) {
        return { type: null, errors: [(err as Error).message] };
    }
};

// chunks.forEach((chunk) => testChunk(chunk));

export const remakeFixture = (chunks: Chunk[]) => {
    return (
        'export default `' +
        chunks
            .map((chunk) => {
                const res = runChunk(chunk.code);
                const lines = [chunk.code];
                if (res.type) {
                    lines.push('-> ' + typToString(res.type));
                }
                res.errors.forEach((line) => lines.push('x ' + line));
                return lines.join('\n');
            })
            .join('\n\n') +
        '`;\n'
    );
};

const [_, name] = process.argv;
// Are we running this file directly?
if (name.endsWith('/j.fixture.ts')) {
    writeFileSync(FILE, remakeFixture(chunks));
}

console.log('done', process.argv);
