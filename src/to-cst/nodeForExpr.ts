import { Ctx, nilt } from '../to-ast/Ctx';
import { recordMap } from '../get-type/get-types-new';
import {
    Expr,
    Loc,
    Node,
    NodeContents,
    Record,
    TRecord,
    Type,
} from '../types/ast';

export const loc = (loc: Loc, contents: NodeContents): Node => ({
    loc,
    ...contents,
});

export const id = (text: string, loc: Loc): Node => ({
    type: 'identifier',
    text,
    loc,
});

export const asTuple = (record: TRecord): Type[] | null => {
    const map = recordMap(record);
    const res: Type[] = [];
    for (let i = 0; i < record.entries.length; i++) {
        if (!map[i.toString()]) {
            return null;
        }
        if (map[i.toString()].default) {
            return null;
        }
        res.push(map[i.toString()].value);
    }
    return res;
};

// export type RCtx = Ctx & {
//     reverseNames: { [hash: string]: string };
// };

// export const makeRCtx = (ctx: Ctx): RCtx => {
//     // const reverseNames: { [hash: string]: string } = {};
//     // for (const name in ctx.global.names) {
//     //     ctx.global.names[name].forEach((hash) => (reverseNames[hash] = name));
//     // }
//     // for (const name in ctx.global.typeNames) {
//     //     ctx.global.typeNames[name].forEach(
//     //         (hash) => (reverseNames[hash] = name),
//     //     );
//     // }
//     // for (const name in ctx.global.builtins.names) {
//     //     ctx.global.builtins.names[name].forEach(
//     //         (hash) => (reverseNames[hash] = name),
//     //     );
//     // }
//     // THIS THO
//     // for (const sym in ctx.localMap.terms) {
//     //     reverseNames[sym] = ctx.localMap.terms[sym].name;
//     // }
//     // for (const sym in ctx.localMap.types) {
//     //     reverseNames[sym] = ctx.localMap.types[sym].name;
//     // }
//     // return { ...ctx, reverseNames };
// };

export const nodeForExpr = (expr: Expr, ctx: Ctx): Node => {
    switch (expr.type) {
        case 'local':
            return {
                type: 'identifier',
                text: '',
                hash: '#' + expr.sym,
                loc: expr.form.loc,
            };

        case 'global':
            return {
                type: 'identifier',
                text: '',
                hash: '#' + expr.hash,
                loc: expr.form.loc,
            };
        case 'unresolved':
            return expr.form;
        case 'apply':
            if (expr.args.length === 0 && expr.target.type === 'tag') {
                return nodeForExpr(expr.target, ctx);
            }
            return {
                loc: expr.form.loc,
                type: 'array',
                values: [
                    nodeForExpr(expr.target, ctx),
                    ...expr.args.map((arg) => nodeForExpr(arg, ctx)),
                ],
            };
    }
    // return expr.form;
    return {
        loc: expr.form.loc,
        type: 'identifier',
        text: 'nodeForExpr ' + expr.type,
    };
};
