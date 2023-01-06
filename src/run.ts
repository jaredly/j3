// ok?
import { parse } from './grammar';

import fs from 'fs';
import { addDef, newCtx, noForm } from './to-ast/to-ast';
import { nodeToExpr } from './to-ast/nodeToExpr';
import { typeForExpr } from './to-ast/typeForExpr';
import { Node } from './types/cst';
import { toTs } from './to-ast/to-ts';

const [_, __, fname] = process.argv;

if (!fname) {
    console.log(`give me a file`);
    process.exit(1);
}
if (!fs.existsSync(fname)) {
    console.log(`cant fint ${fname}`);
    process.exit(1);
}

const cst = parse(fs.readFileSync(fname, 'utf8'));
let ctx = newCtx();
const exprs = cst.map((node) => {
    const res = nodeToExpr(node, ctx);
    ctx = addDef(res, ctx);
    console.log(JSON.stringify(noForm(res)));
    console.log(typeForExpr(res, ctx));
    return res;
});

console.log(toTs(exprs, ctx));
