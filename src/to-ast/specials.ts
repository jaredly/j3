import { Node } from '../types/cst';
import { Expr, Pattern, Type } from '../types/ast';
import objectHash from 'object-hash';
import { Ctx, Local, nil, nilt, noForm } from './to-ast';
import { nodeToType } from './nodeToType';
import { nodeToExpr } from './nodeToExpr';
import { nodeToPattern } from './nodeToPattern';
import { getType } from '../types/get-types-new';

export const specials: {
    [key: string]: (form: Node, args: Node[], ctx: Ctx) => Expr;
} = {
    fn: (form, contents, ctx): Expr => {
        if (contents.length < 1) {
            return {
                type: 'fn',
                args: [],
                body: [],
                form,
            };
        }
        if (contents[0].type === 'array') {
            let args: { pattern: Pattern; type?: Type }[] = [];
            let locals: Local['terms'] = [];

            let pairs: { pat: Node; type?: Node }[] = [];

            contents[0].values.forEach((arg) => {
                if (arg.type === 'identifier' && arg.text.startsWith(':')) {
                    if (pairs.length) {
                        pairs[pairs.length - 1].type = {
                            ...arg,
                            text: arg.text.slice(1),
                        };
                    }
                } else if (
                    arg.type === 'list' &&
                    arg.values.length > 1 &&
                    arg.values[0].type === 'identifier' &&
                    arg.values[0].text === ':'
                ) {
                    if (pairs.length) {
                        pairs[pairs.length - 1].type =
                            arg.values.length > 2
                                ? {
                                      ...arg,
                                      values: arg.values.slice(1),
                                  }
                                : arg.values[1];
                    }
                } else {
                    pairs.push({ pat: arg });
                }
            });

            pairs.forEach(({ pat, type }) => {
                const t: Type = type
                    ? nodeToType(type, ctx)
                    : {
                          type: 'unresolved',
                          form: nil.form,
                          reason: 'not provided type',
                      };
                args.push({
                    pattern: nodeToPattern(pat, t, ctx, locals),
                    type: t,
                });
            });
            locals.forEach(
                (loc) =>
                    (ctx.localMap.terms[loc.sym] = {
                        name: loc.name,
                        type: loc.type,
                    }),
            );
            const ct2: Ctx = {
                ...ctx,
                local: {
                    ...ctx.local,
                    terms: [...locals, ...ctx.local.terms],
                },
            };
            const body = contents.slice(1);
            let ret: Type | undefined;
            if (body[0].type === 'identifier' && body[0].text.startsWith(':')) {
                ret = nodeToType(
                    {
                        ...body[0],
                        text: body[0].text.slice(1),
                    },
                    ctx,
                );
                body.shift();
            }
            // parse fn args
            return {
                type: 'fn',
                args,
                body: body.map((child) => nodeToExpr(child, ct2)),
                ret,
                form,
            };
        }
        return {
            type: 'fn',
            args: [],
            body: contents.map((child) => nodeToExpr(child, ctx)),
            form,
        };
    },
    defn: (form, contents, ctx): Expr => {
        if (contents.length < 2) {
            return { type: 'unresolved', form, reason: 'no engouh args' };
        }
        const [name, ...rest] = contents;
        if (name.type !== 'identifier') {
            return {
                type: 'unresolved',
                reason: 'cant defn not id ' + name.type,
                form,
            };
        }
        const value = specials.fn(form, rest, ctx);
        return {
            type: 'def',
            name: name.text,
            hash: objectHash(noForm(value)),
            value,
            form,
        };
    },
    def: (form, contents, ctx): Expr => {
        if (!contents.length) {
            return { type: 'unresolved', form, reason: 'no contents' };
        }
        const first = contents[0];
        if (first.type !== 'identifier') {
            return {
                type: 'unresolved',
                form,
                reason: 'first arg must be an identifier',
            };
        }
        const value = contents.length > 1 ? nodeToExpr(contents[1], ctx) : nil;
        return {
            type: 'def',
            name: first.text,
            hash: objectHash(noForm(value)),
            value,
            form,
        };
    },
    let: (form, contents, ctx): Expr => {
        const first = contents[0];
        if (!first || first.type !== 'array') {
            return { type: 'unresolved', form, reason: 'first not array' };
        }
        const locals: Local['terms'] = [];
        const bindings: { pattern: Pattern; value: Expr; type?: Type }[] = [];
        for (let i = 0; i < first.values.length - 1; i += 2) {
            const value = nodeToExpr(first.values[i + 1], ctx);
            const inferred = getType(value, ctx) ?? nilt;
            bindings.push({
                pattern: nodeToPattern(first.values[i], inferred, ctx, locals),
                value,
                type: inferred,
            });
        }
        locals.forEach(
            (loc) =>
                (ctx.localMap.terms[loc.sym] = {
                    name: loc.name,
                    type: loc.type,
                }),
        );
        const ct2: Ctx = {
            ...ctx,
            local: {
                ...ctx.local,
                terms: [...locals, ...ctx.local.terms],
            },
        };
        return {
            type: 'let',
            bindings,
            form,
            body: contents.slice(1).map((child) => nodeToExpr(child, ct2)),
        };
    },
    if: (form, contents, ctx): Expr => {
        const [cond, yes, no] = contents;
        return {
            type: 'if',
            cond: cond ? nodeToExpr(cond, ctx) : nil,
            yes: yes ? nodeToExpr(yes, ctx) : nil,
            no: no ? nodeToExpr(no, ctx) : nil,
            form,
        };
    },
    ',': (form, contents, ctx): Expr => {
        return {
            type: 'record',
            form,
            entries: contents.map((item, i) => ({
                name: i.toString(),
                value: nodeToExpr(item, ctx),
            })),
        };
    },
};
