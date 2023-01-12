import { blank, Ctx, nilt } from '../to-ast/to-ast';
import { Expr, Node, Type } from '../types/ast';
import { matchesType } from './matchesType';
import { Error } from '../types/types';
import { unifyTypes } from './unifyTypes';

export type Report = {
    types: { [idx: number]: Type };
    errors: { [idx: number]: Error[] };
};

export const err = (report: Report, expr: Type | Expr, error: Error) => {
    if (!report.errors[expr.form.loc.idx]) {
        report.errors[expr.form.loc.idx] = [];
    }
    report.errors[expr.form.loc.idx].push(error);
};

export const errf = (report: Report, form: Node, error: Error) => {
    if (!report.errors[form.loc.idx]) {
        report.errors[form.loc.idx] = [];
    }
    report.errors[form.loc.idx].push(error);
};

// So, IF we have a localized error, we will *not*
// propagate it up.
export const getType = (expr: Expr, ctx: Ctx, report?: Report): Type | void => {
    const type = _getType(expr, ctx, report);
    if (type && report) {
        report.types[expr.form.loc.idx] = type;
    }
    return type;
};

const _getType = (expr: Expr, ctx: Ctx, report?: Report): Type | void => {
    switch (expr.type) {
        case 'builtin': {
            return ctx.global.builtins.terms[expr.hash];
        }
        case 'unresolved':
            if (report) {
                err(report, expr, {
                    type: 'unresolved',
                    form: expr.form,
                });
            }
            return;
        case 'string':
            if (report) {
                // Populate the map
                expr.templates.forEach(({ expr }) => {
                    const t = getType(expr, ctx, report);
                    if (t) {
                        matchesType(
                            t,
                            { type: 'builtin', name: 'string', form: blank },
                            ctx,
                            expr.form,
                            report,
                        );
                    }
                });
            }
            // TODO: support string constant report
            return { type: 'builtin', name: 'string', form: expr.form };
        case 'number':
        case 'bool':
            return expr;
        case 'local':
            if (report && !ctx.localMap.terms[expr.sym]) {
                err(report, expr, {
                    type: 'misc',
                    message: `local not found ${expr.sym}`,
                });
            }
            return ctx.localMap.terms[expr.sym]?.type;
        case 'global':
            // Should we cache? idk
            return ctx.global.termTypes[expr.hash];
        case 'if': {
            const cond = getType(expr.cond, ctx, report);
            const yes = getType(expr.yes, ctx, report);
            const no = getType(expr.no, ctx, report);
            // Are there other places where,
            // the type isn't "unresolved", it's just "wrong"?
            // oh yeah definitely.
            // So there's a difference between
            // "we can't tell" and "this is known and bad".
            if (cond && report) {
                matchesType(
                    cond,
                    { type: 'builtin', name: 'bool', form: blank },
                    ctx,
                    expr.form,
                    report,
                );
            }
            return yes && no && unifyTypes(yes, no, ctx, expr.form, report);
        }
        case 'tag': {
            return {
                type: 'tag',
                name: expr.name,
                args: [],
                form: expr.form,
            };
        }
        case 'apply': {
            const args: Type[] = [];
            expr.args.forEach((arg) => {
                const res = getType(arg, ctx, report);
                if (res) {
                    args.push(res);
                }
            });
            if (expr.target.type === 'tag') {
                if (args.length < expr.args.length) {
                    return;
                }
                return {
                    type: 'tag',
                    name: expr.target.name,
                    args,
                    form: expr.form,
                };
            }
            const target = getType(expr.target, ctx, report);
            if (!target) {
                return;
            }
            if (args.length < expr.args.length) {
                return;
            }
            if (target.type !== 'fn') {
                if (report) {
                    err(report, expr, {
                        type: 'invalid type',
                        form: expr.form,
                        expected: {
                            type: 'fn',
                            args: [],
                            body: nilt,
                            form: blank,
                        },
                        found: target,
                        path: [],
                    });
                }
                return;
            }
            if (report) {
                for (
                    let i = 0;
                    i < args.length && i < target.args.length;
                    i++
                ) {
                    matchesType(
                        args[i],
                        target.args[i],
                        ctx,
                        expr.args[i].form,
                        report,
                    );
                }
                if (report && args.length < target.args.length) {
                    err(report, expr, {
                        type: 'too few arguments',
                        expected: target.args.length,
                        received: args.length,
                        form: expr.form,
                    });
                }
                for (let i = target.args.length; i < args.length; i++) {
                    err(report, expr.args[i], {
                        type: 'extra argument',
                        form: expr.args[i].form,
                    });
                }
            }
            return target.body;
        }
        case 'fn': {
            const args: Type[] = [];
            expr.args.forEach((arg) => {
                if (arg.type) {
                    args.push(arg.type);
                } else {
                    if (report) {
                        err(report, arg.pattern, {
                            type: 'misc',
                            message: 'missing type annotation',
                        });
                    }
                }
            });
            if (args.length < expr.args.length) {
                return;
            }
            const body = expr.body.map((body) => getType(body, ctx, report));
            const last =
                expr.ret ?? (body.length ? body[body.length - 1] : nilt);
            if (!last) {
                return;
            }
            return {
                type: 'fn',
                args,
                body: last,
                form: expr.form,
            };
        }
        case 'def':
        case 'deftype':
            return nilt;
    }
    console.log('nope', expr.type);
};
