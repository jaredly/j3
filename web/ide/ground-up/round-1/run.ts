// hmm
import { existsSync, readFileSync, statSync, writeFileSync } from 'fs';
import { evalExpr } from './bootstrap';
import { parseByCharacter } from '../../../../src/parse/parse.js';
import { fromMCST } from '../../../../src/types/mcst.js';
import { Ctx, parseStmt, stmt } from './parse';
import { sanitize } from './builtins';

const [_, __, arg, outfile] = process.argv;
if (!existsSync(arg)) {
    console.log('no arg sllry', arg);
    process.exit(1);
}

const loadFile = (arg: string) => {
    const src = readFileSync(arg, 'utf-8')
        .replaceAll(/\n +/g, '\n')
        .replaceAll(/\n+/g, '\n')
        .trim();
    console.log(src);
    const res = parseByCharacter(src, null);
    const top = fromMCST(-1, res.map);
    if (top.type !== 'list') {
        console.log('top not list');
        process.exit(1);
    }

    const errors: Ctx = { errors: {}, display: {} };
    const stmts = top.values
        .map((n) => parseStmt(n, errors))
        .filter(Boolean) as stmt[];
    if (Object.keys(errors).length) {
        console.log(errors);
        process.exit(1);
    }
    return stmts;
};

const cachePath = '.cache';
let stmts: stmt[];
if (
    existsSync(cachePath) &&
    statSync(cachePath).mtimeMs > statSync(arg).mtimeMs
) {
    stmts = JSON.parse(readFileSync(cachePath, 'utf-8'));
} else {
    stmts = loadFile(arg);
    writeFileSync(cachePath, JSON.stringify(stmts));
}

type arr<a> = { type: 'cons'; 0: a; 1: arr<a> } | { type: 'nil' };
const unwrapArray = <a>(v: arr<a>): a[] =>
    v.type === 'nil' ? [] : [v[0], ...unwrapArray(v[1])];

const env: { [key: string]: any } = {
    nil: { type: 'nil' },
    cons: (a: any) => (b: any) => ({ type: 'cons', 0: a, 1: b }),
    '++': (items: arr<string>) => unwrapArray(items).join(''),
    '+': (a: number) => (b: number) => a + b,
    '-': (a: number) => (b: number) => a - b,
    'int-to-string': (a: number) => a + '',
    'replace-all': (a: string) => (b: string) => (c: string) => {
        return a.replaceAll(b, c);
    },
    ',':
        <a, b>(a: a) =>
        (b: b): any => ({ type: ',', 0: a, 1: b }),
    sanitize,
    reduce:
        <T, A>(init: T) =>
        (items: arr<A>) =>
        (f: (res: T) => (item: A) => T) => {
            // console.log('unwrap', items);
            return unwrapArray(items).reduce((a, b) => f(a)(b), init);
        },
};

stmts.forEach((stmt) => {
    console.log(stmt.type);
    if (stmt.type === 'sdeftype') {
        console.log('skipping deftype');
        return;
    }
    if (stmt.type === 'sdef') {
        const res = evalExpr(stmt[1], env);
        env[stmt[0]] = res;
    }
});
console.log(env);

// Object.keys(env).forEach((k) => {
//     if (typeof env[k] === 'function') {
//         const f = env[k];
//         env[k] = (...args: any[]) => {
//             console.log(
//                 `calling ${k} with`,
//                 JSON.stringify(args).slice(0, 100),
//             );
//             const res = f(...args);
//             console.log('got', res, 'from', k);
//             return res;
//         };
//     }
// });

const source = stmts.map((stmt) => env['compile-st'](stmt)).join('\n\n');
writeFileSync(outfile, env.builtins + source);

import('./' + outfile).then((module) => {
    console.log('got a', module);
    const src = stmts.map(module.compile_st).join('\n\n');
    writeFileSync(outfile + '.2.js', module.builtins + src);
    import('./' + outfile + '.2.js').then((m2) => {
        const second = stmts.map(m2.compile_st).join('\n\n');
        console.log('Double bind', second === src);
    });
});
