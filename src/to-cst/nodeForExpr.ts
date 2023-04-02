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

export const asTuple = (record: TRecord, ctx: Ctx): Type[] | null => {
    const map = recordMap(record, ctx);
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

export const nodeForExpr = (expr: Expr, ctx: Ctx): Node => {
    switch (expr.type) {
        case 'local':
            return {
                type: 'hash',
                hash: ':' + expr.sym,
                loc: expr.form.loc,
            };

        case 'global':
            return {
                type: 'hash',
                hash: expr.hash,
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
