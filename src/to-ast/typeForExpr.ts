import { Node } from '../types/cst';
import { Expr, Type } from '../types/ast';
import { Ctx, blank, nilt } from './to-ast';

export const typeForExpr = (value: Expr, ctx: Ctx): Type => {
    switch (value.type) {
        case 'if': {
            return unifyTypes(
                typeForExpr(value.yes, ctx),
                typeForExpr(value.no, ctx),
                ctx,
                value.form,
            );
        }
        case 'number': {
            return { type: 'builtin', name: value.kind, form: blank };
        }
        case 'builtin':
            return (
                ctx.global.builtins.terms[value.hash] ?? {
                    type: 'unresolved',
                    form: value.form,
                    reason: 'unknown builtin ' + value.hash,
                }
            );
        case 'tag':
            return {
                type: 'tag',
                name: value.name,
                args: [],
                form: value.form,
            };
        case 'apply': {
            if (value.target.type === 'tag') {
                return {
                    type: 'tag',
                    name: value.target.name,
                    args: value.args.map((arg) => typeForExpr(arg, ctx)),
                    form: value.form,
                };
            }
            const inner = typeForExpr(value.target, ctx);
            if (inner.type === 'fn') {
                return inner.body;
            }
            return {
                type: 'unresolved',
                form: value.form,
                reason: 'apply a non-function',
            };
        }
        case 'def': {
            return nilt;
        }
        case 'fn': {
            return {
                type: 'fn',
                args: value.args.map((arg) => arg.type ?? nilt),
                body: value.body.length
                    ? typeForExpr(value.body[value.body.length - 1], ctx)
                    : nilt,
                form: value.form,
            };
        }
    }
    return {
        type: 'unresolved',
        form: value.form,
        reason: 'not impl ' + value.type,
    };
};

export const unifyTypes = (
    one: Type,
    two: Type,
    ctx: Ctx,
    form: Node,
): Type => {
    if (one.type === 'builtin' && two.type === 'builtin') {
        return one.name === two.name
            ? { ...one, form }
            : {
                  type: 'unresolved',
                  reason: 'incompatible builtins',
                  form,
              };
    }
    return {
        type: 'unresolved',
        reason: 'incompatible builtins',
        form,
    };
};
