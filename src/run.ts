// ok?
// @ts-ignore
import { parse } from './grammar';

import fs from 'fs';
import { addDef, newCtx, nodeToExpr, noForm, typeForExpr } from './to-ast';
import { Node } from './types/cst';

const [_, __, fname] = process.argv;

if (!fname) {
    console.log(`give me a file`);
    process.exit(1);
}
if (!fs.existsSync(fname)) {
    console.log(`cant fint ${fname}`);
    process.exit(1);
}

const cst: Node[] = parse(fs.readFileSync(fname, 'utf8'));
let ctx = newCtx();
const exprs = cst.map((node) => {
    const res = nodeToExpr(node, ctx);
    ctx = addDef(res, ctx);
    return res;
});
exprs.forEach((expr) => {
    console.log(JSON.stringify(noForm(expr)));
    console.log(typeForExpr(expr, ctx));
});
