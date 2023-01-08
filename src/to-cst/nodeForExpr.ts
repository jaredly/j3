import { Ctx, nilt, noloc } from '../to-ast/to-ast';
import { recordMap } from '../to-ast/typeForExpr';
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
    contents,
});

export const id = (text: string, loc: Loc): Node => ({
    loc,
    contents: {
        type: 'identifier',
        text,
    },
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

export const nodeForType = (type: Type, ctx: Ctx): Node => {
    switch (type.type) {
        case 'builtin':
            return {
                loc: type.form.loc,
                contents: {
                    type: 'identifier',
                    text: type.name,
                },
            };
        case 'number':
            return {
                loc: type.form.loc,
                contents: {
                    type: 'number',
                    raw: type.value.toString(),
                },
            };
        case 'tag':
            return {
                loc: type.form.loc,
                contents: {
                    type: 'list',
                    values: [
                        {
                            loc: noloc,
                            contents: { type: 'tag', text: type.name },
                        },
                        ...type.args.map((arg) => nodeForType(arg, ctx)),
                    ],
                },
            };
        case 'record':
            const tuple = asTuple(type);
            if (tuple) {
                return {
                    loc: type.form.loc,
                    contents: {
                        type: 'list',
                        values: [
                            id(',', noloc),
                            ...tuple.map((t) => nodeForType(t, ctx)),
                        ],
                    },
                };
            }
            return loc(type.form.loc, {
                type: 'record',
                values: type.entries.flatMap(({ name, value }) => [
                    id(name, noloc),
                    nodeForType(value, ctx),
                ]),
            });
        case 'fn': {
            return loc(type.form.loc, {
                type: 'list',
                values: [
                    id('fn', noloc),
                    loc(noloc, {
                        type: 'array',
                        values: type.args.map((arg) => nodeForType(arg, ctx)),
                    }),
                    nodeForType(type.body, ctx),
                ],
            });
        }
        case 'unresolved':
            return loc(type.form.loc, {
                type: 'identifier',
                text: `unresolved ${type.reason}`,
            });
    }
    return {
        loc: type.form.loc,
        contents: { type: 'identifier', text: 'NOT HANDLED ' + type.type },
    };
};

export const nodeForExpr = (expr: Expr, ctx: Ctx): Node => {
    switch (expr.type) {
        case 'local':
            return {
                contents: {
                    type: 'identifier',
                    text: ctx.localMap.terms[expr.sym].name,
                    hash: '#' + expr.sym,
                },
                loc: expr.form.loc,
            };

        case 'global':
            return {
                contents: {
                    type: 'identifier',
                    text: 'need-reverse',
                    hash: '#' + expr.hash,
                },
                loc: expr.form.loc,
            };
        case 'apply':
            return {
                loc: expr.form.loc,
                contents: {
                    type: 'array',
                    values: [
                        nodeForExpr(expr.target, ctx),
                        ...expr.args.map((arg) => nodeForExpr(arg, ctx)),
                    ],
                },
            };
    }
    // return expr.form;
    return {
        loc: expr.form.loc,
        contents: { type: 'identifier', text: 'NOT HANDLED ' + expr.type },
    };
};