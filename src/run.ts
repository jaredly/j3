// // ok?
// // @ts-ignore
// import { parse } from './grammar.mjs';

// import fs from 'fs';
// import { addDef } from './to-ast/to-ast';
// import { newCtx, noForm } from './to-ast/Ctx';
// import { nodeToExpr } from './to-ast/nodeToExpr';
// import { Node } from './types/cst';
// import { toTs } from './to-ast/to-ts';
// import { CstCtx } from './to-ast/library.js';

// const [_, __, fname] = process.argv;

// if (!fname) {
//     console.log(`give me a file`);
//     process.exit(1);
// }
// if (!fs.existsSync(fname)) {
//     console.log(`cant fint ${fname}`);
//     process.exit(1);
// }

// const cst: Node[] = parse(fs.readFileSync(fname, 'utf8'));
// let ctx = newCtx();
// const exprs = cst.map((node) => {
//     const res = nodeToExpr(node, ctx);
//     ctx = addDef(res, ctx) as CstCtx;
//     console.log(JSON.stringify(noForm(res)));
//     // console.log(typeForExpr_deprecated(res, ctx));
//     return res;
// });

// // console.log(toTs(exprs, ctx));
