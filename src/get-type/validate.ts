import { Ctx } from '../to-ast/Ctx';
import type { Expr, Loc, Type } from '../types/ast';
import type { Error, MatchError } from '../types/types';
import type { Report } from './get-types-new';
import { applyAndResolve, expandEnumItems } from './matchesType';

const err = (
    errors: Report['errors'],
    type: Type | Expr | MatchError,
    error: Error,
) => {
    if (!errors[type.form.loc.idx]) {
        errors[type.form.loc.idx] = [];
    }
    errors[type.form.loc.idx].push(error);
};

export const validateExpr = (
    expr: Expr,
    ctx: Ctx,
    errors: Report['errors'],
): unknown => {
    switch (expr.type) {
        case 'unresolved':
        case 'blank':
            // return err(errors, expr, { type: 'unresolved', form: expr.form });
            return;
        case 'deftype':
            return validateType(expr.value, ctx, errors);
        case 'def':
            return validateExpr(expr.value, ctx, errors);
        case 'fn':
            for (let arg of expr.args) {
                if (arg.type) validateType(arg.type, ctx, errors);
            }
            expr.body.forEach((expr) => validateExpr(expr, ctx, errors));
            return;
        case 'apply':
            validateExpr(expr.target, ctx, errors);
            expr.args.forEach((arg) => validateExpr(arg, ctx, errors));
            return;
        case 'record':
            expr.entries.forEach((entry) =>
                validateExpr(entry.value, ctx, errors),
            );
            return;
        case 'string':
            return expr.templates.forEach(({ expr }) =>
                validateExpr(expr, ctx, errors),
            );
        case 'type-apply':
            validateExpr(expr.target, ctx, errors);
            expr.args.forEach((arg) => validateType(arg, ctx, errors));
            return;
        case 'tag':
        case 'number':
        case 'bool':
            return;
        case 'builtin':
            if (!ctx.global.builtins.terms[expr.hash]) {
                err(errors, expr, {
                    type: 'misc',
                    message: 'unresolved builtin ' + expr.hash,
                });
            }
            return;
        case 'local':
            if (!ctx.localMap.terms[expr.sym]) {
                err(errors, expr, {
                    type: 'misc',
                    message: 'unresolved local ' + expr.sym,
                });
            }
            return;
        case 'global':
            if (!ctx.global.terms[expr.hash]) {
                err(errors, expr, {
                    type: 'misc',
                    message: 'unresolved global ' + expr.hash,
                });
            }
            return;
        case 'let':
            // TODO validate patterns?
            expr.bindings.forEach((binding) =>
                validateExpr(binding.value, ctx, errors),
            );
            expr.body.forEach((body) => validateExpr(body, ctx, errors));
            return;
        case 'switch':
            validateExpr(expr.target, ctx, errors);
            expr.cases.forEach((kase) => {
                // TODO validate patterns
                validateExpr(kase.body, ctx, errors);
            });
            return;
        case 'if':
            validateExpr(expr.cond, ctx, errors);
            validateExpr(expr.yes, ctx, errors);
            validateExpr(expr.no, ctx, errors);
            return;
        case 'array':
            expr.values.forEach((item) => validateExpr(item, ctx, errors));
            return;
        // case 'attribute':
        //     validateExpr(expr.target, ctx, errors);
        //     return;
        case 'recordAccess':
            if (expr.target) {
                validateExpr(expr.target, ctx, errors);
            }
            return;
        case 'recur':
            return;
        case 'type-fn':
            validateExpr(expr.target, ctx, errors);
            return;
        case 'let-type':
            expr.bindings.forEach((bound) => {
                validateType(bound.type, ctx, errors);
            });
            expr.body.forEach((expr) => validateExpr(expr, ctx, errors));
            return;
        case 'attachment':
        case 'rich-text':
            // TODO: Markdown will maybe have embedded expressions
            // and stuff? Yeah I think it will ....
            return;
    }
    let _: never = expr;
    throw new Error('not validated ' + JSON.stringify(expr));
};

export const validateType = (
    type: Type,
    ctx: Ctx,
    errors: Report['errors'],
): unknown => {
    switch (type.type) {
        case 'unresolved':
            return err(errors, type, { type: 'unresolved', form: type.form });
        case 'local':
            return ctx.localMap.types[type.sym] != null
                ? null
                : err(errors, type, {
                      type: 'misc',
                      message: 'unresolved local ' + type.sym,
                  });
        case 'global':
            return ctx.global.types[type.hash] != null
                ? null
                : err(errors, type, {
                      type: 'misc',
                      message: 'unresolved global ' + type.hash,
                  });
        case 'builtin':
            return ctx.global.builtins.types[type.name] != null
                ? null
                : type.form.loc;
        case 'none':
            return err(errors, type, {
                type: 'misc',
                message: 'This has the empty type',
            });
        case 'bool':
        case 'number':
            return null;
        case 'any':
            return err(errors, type, {
                type: 'misc',
                message:
                    'This has the universal type. Do you want to give it an explicit type, or create a type variable?',
            });
        case 'tag':
            return type.args.forEach((arg) => validateType(arg, ctx, errors));
        case 'fn':
            type.args.forEach((arg) => validateType(arg, ctx, errors));
            return validateType(type.body, ctx, errors);
        case 'record':
            for (let entry of type.entries) {
                validateType(entry.value, ctx, errors);
            }
            return null;
        case 'union':
            const map = expandEnumItems(type.items, ctx, []);
            if (map.type === 'error') {
                return err(errors, map.error, map.error);
            }
            for (let item of Object.values(map.map)) {
                for (let arg of item.args) {
                    validateType(arg, ctx, errors);
                }
            }
            return;
        case 'tfn':
            for (let arg of type.args) {
                if (arg.bound) {
                    validateType(arg.bound, ctx, errors);
                }
            }
            return validateType(type.body, ctx, errors);
        case 'apply':
            type.args.forEach((type) => validateType(type, ctx, errors));
            const result = applyAndResolve(type, ctx, []);
            if (result.type === 'error') {
                err(errors, type, result.error);
            }
            return;
    }

    // @ts-ignore
    throw new Error(`cant validate ${type.type}`);
};
