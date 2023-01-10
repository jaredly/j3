import { Ctx } from '../to-ast/to-ast';
import { unifyTypes } from '../to-ast/typeForExpr';
import { Expr, Type } from './ast';

export type TypeMap = { [idx: number]: Type };

// So, IF we have a localized error, we will *not*
// propagate it up.
export const getType = (expr: Expr, ctx: Ctx, types?: TypeMap): Type => {
    const type = _getType(expr, ctx, types);
    if (types) {
        types[expr.form.loc.idx] = type;
    }
    return type;
};

const _getType = (expr: Expr, ctx: Ctx, types?: TypeMap): Type => {
    switch (expr.type) {
        case 'string':
            if (types) {
                // Populate the map
                expr.templates.forEach(({ expr }) => getType(expr, ctx, types));
            }
            // TODO: support string constant types
            return { type: 'builtin', name: 'string', form: expr.form };
        case 'number':
        case 'bool':
            return expr;
        case 'local':
            // So this, is like a compiler error. Right?
            // Should never happen.
            return (
                ctx.localMap.terms[expr.sym]?.type ?? {
                    type: 'unresolved',
                    reason: `local not found ${expr.sym}`,
                    form: expr.form,
                }
            );
        case 'global':
            // Should we cache? idk
            return getType(ctx.global.terms[expr.hash], ctx);
        case 'if': {
            const cond = getType(expr.cond, ctx, types);
            const yes = getType(expr.yes, ctx, types);
            const no = getType(expr.no, ctx, types);
            // Are there other places where,
            // the type isn't "unresolved", it's just "wrong"?
            // oh yeah definitely.
            // So there's a difference between
            // "we can't tell" and "this is known and bad".
            if (cond.type !== 'builtin' || cond.name !== 'bool') {
                return {
                    type: 'unresolved',
                    reason: `if condition is not a bool (${cond.type})`,
                    form: expr.form,
                };
            }
            return unifyTypes(yes, no, ctx, expr.form);
        }
    }
};
