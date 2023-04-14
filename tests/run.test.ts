import { readdirSync, readFileSync } from 'fs';
import { getLine, idxLines } from '../src/to-ast/utils';
import { ListLikeContents } from '../src/types/mcst';

it.skip('skipping for now', () => {});

// readdirSync(__dirname)
//     .filter((m) => m.endsWith('.jd') && !m.endsWith('.types.jd'))
//     .filter(() => false)
//     .forEach((name) => {
//         describe(name, () => {
//             const raw = readFileSync(__dirname + '/' + name, 'utf8');
//             const lines = idxLines(raw);
//         });
//     });
