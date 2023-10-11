// hmm
import { existsSync, readFileSync } from 'fs';
import { evalExpr } from './bootstrap';
import { parseByCharacter } from '../../../../src/parse/parse.js';
import { fromMCST } from '../../../../src/types/mcst.js';
import { parseStmt, stmt } from './parse';

const [_, __, arg] = process.argv;
if (!existsSync(arg)) {
    console.log('no arg sllry', arg);
    process.exit(1);
}

const src = readFileSync(arg, 'utf-8')
    // .replaceAll(/;.*$/gm, '')
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

const errors = {};
const stmts = top.values
    .map((n) => parseStmt(n, errors))
    .filter(Boolean) as stmt[];
if (Object.keys(errors).length) {
    console.log(errors);
    process.exit(1);
}
// console.log(stmts);
const env: { [key: string]: any } = {};
stmts.forEach((stmt) => {
    console.log(stmt.type);
    if (stmt.type === 'sdeftype') {
        console.log('skipping deftype');
        return;
    }
    if (stmt.type === 'sdef') {
        const res = evalExpr(stmt[1], env);
        env[stmt[0]] = res;
        console.log('got', stmt[0], res);
    }
    console.log('what is this', stmt.type);
});
console.log(env);
