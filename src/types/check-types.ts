import { Ctx } from '../to-ast/to-ast';
import { unifyTypes } from '../to-ast/typeForExpr';
import { Expr, Type } from './ast';
import { Visitor } from './walk-ast';

export type CacheCtx = {
    ctx: Ctx;
    globalTypes: { [hash: string]: Type };
    types: {
        [key: number]: Type;
    };
};

export const getType = (expr: Expr, ctx: CacheCtx): Type => {
    switch (expr.type) {
        case 'number':
            return expr;
        case 'local':
            return (
                ctx.ctx.localMap.terms[expr.sym]?.type ?? {
                    type: 'unresolved',
                    reason: 'no local',
                    form: expr.form,
                }
            );
        case 'global':
            // Should we cache? prolly.
            if (ctx.globalTypes[expr.hash]) {
                return ctx.globalTypes[expr.hash];
            }
            return (ctx.globalTypes[expr.hash] = getCachedType(
                ctx.ctx.global.terms[expr.hash],
                ctx,
            ));
        case 'if': {
            const cond = getCachedType(expr.cond, ctx);
            const yes = getCachedType(expr.yes, ctx);
            const no = getCachedType(expr.no, ctx);
            if (cond.type !== 'builtin' || cond.name !== 'bool') {
                return {
                    type: 'unresolved',
                    reason: `if condition is not a bool (${cond.type})`,
                    form: expr.form,
                };
            }
            // STOPSHIP: unify yes and no
            return unifyTypes(yes, no, ctx.ctx, expr.form);
        }
        case 'record': {
            const entries = expr.entries.map((entry) => ({
                name: entry.name,
                value: getCachedType(entry.value, ctx),
            }));
            return {
                type: 'record',
                entries,
                form: expr.form,
                open: false,
            };
        }
        case 'fn': {
            const body = expr.body.map((item) => getCachedType(item, ctx));
            return {
                type: 'fn',
                args: expr.args.map(
                    (arg) =>
                        arg.type ?? {
                            type: 'unresolved',
                            reason: 'no type',
                            form: arg.pattern.form,
                        },
                ),
                body: body[body.length - 1] ?? {
                    type: 'record',
                    entries: [],
                    form: expr.form,
                    open: false,
                },
                form: expr.form,
            };
        }
        case 'let': {
            expr.bindings.forEach((binding) => {
                getCachedType(binding.value, ctx);
            });
            const body = expr.body.map((item) => getCachedType(item, ctx));
            return (
                body[body.length - 1] ?? {
                    type: 'record',
                    entries: [],
                    form: expr.form,
                    open: false,
                }
            );
        }
        case 'apply':
            if (expr.target.type === 'tag') {
                return {
                    type: 'tag',
                    name: expr.target.name,
                    args: expr.args.map((arg) => getCachedType(arg, ctx)),
                    form: expr.form,
                };
            }
            const fn = getCachedType(expr.target, ctx);
            const args = expr.args.map((arg) => getCachedType(arg, ctx));
            if (fn.type === 'fn') {
                // TODO: Check args
                if (fn.args.length !== args.length) {
                    return {
                        type: 'unresolved',
                        reason: `wrong number of args, got ${args.length}, expected ${fn.args.length}`,
                        form: expr.form,
                    };
                }
                return fn.body;
            }
            return {
                type: 'unresolved',
                reason: `apply a non-function ${fn.type}`,
                form: expr.form,
            };
        case 'def':
            // TODO: associate the type with the name as well? maybe it's fine.
            return getCachedType(expr.value, ctx);
        case 'builtin':
            return ctx.ctx.global.builtins.terms[expr.hash];
        case 'tag':
            return {
                type: 'tag',
                name: expr.name,
                args: [],
                form: expr.form,
            };
    }
    return {
        type: 'unresolved',
        reason: 'not handled ' + expr.type,
        form: expr.form,
    };
};

export const getCachedType = (expr: Expr, ctx: CacheCtx): Type => {
    const at = expr.form.loc.idx;
    if (ctx.types[at] == null) {
        ctx.types[at] = getType(expr, ctx);
    }
    return ctx.types[at];
};

// export const checkTypes: Visitor<CCtx> = {
//     ExprPost(node, ctx) {
//         if (node.type === 'def') {
//             const vidx = node.value.form.loc.idx;
//             const found = ctx.ctx.localMap.terms[vidx]?.type;
//             ctx.types[node.form.loc.idx] = found ?? {
//                 type: 'unresolved',
//                 form: node.form,
//                 reason: `value ${vidx} not resolved`,
//             };
//         }
//         return null;
//     },
//     Identifier(node, { ctx, types }) {
//         if (node.type === 'local') {
//             const found = ctx.localMap.terms[node.sym]?.type;
//             types[node.form.loc.idx] = found ?? {
//                 type: 'unresolved',
//                 form: node.form,
//                 reason: 'local not found',
//             };
//         } else {
//             const at = ctx.global.terms[node.hash]?.form.loc.idx;
//             types[node.form.loc.idx] = types[at] ?? {
//                 type: 'unresolved',
//                 form: node.form,
//                 reason: `global ${at} (${node.hash}) not checked yet`,
//             };
//         }
//         return null;
//     },
//     Number(node, ctx) {
//         ctx.types[node.form.loc.idx] = {
//             type: 'builtin',
//             name: node.kind,
//             form: node.form,
//         };
//         return null;
//     },
// };
