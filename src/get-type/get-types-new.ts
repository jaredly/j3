import {
    blank,
    Ctx,
    file,
    fileLazy,
    imageFile,
    imageFileLazy,
    nilt,
} from '../to-ast/Ctx';
import { Expr, Node, Pattern, TRecord, Type } from '../types/ast';
import {
    applyAndResolve,
    applyTypeVariables,
    matchesType,
} from './matchesType';
import type { Error } from '../types/types';
import { unifyTypes } from './unifyTypes';
import { transformType } from '../types/walk-ast';

export type RecordMap = { [key: string]: TRecord['entries'][0] };
export const recordMap = (record: TRecord) => {
    const map: RecordMap = {};
    record.entries.forEach((entry) => {
        map[entry.name] = entry;
    });
    return map;
};

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
                if (expr.form.type === 'unparsed') {
                    err(report, expr, {
                        type: 'unparsed',
                        form: expr.form,
                    });
                } else if (expr.form.type === 'attachment') {
                    err(report, expr, {
                        type: 'misc',
                        message: 'empty attachment',
                    });
                } else {
                    err(report, expr, {
                        type: 'unresolved',
                        form: expr.form,
                    });
                }
            }
            return;
        case 'blank':
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
        case 'type-apply': {
            const target = getType(expr.target, ctx, report);
            if (!target) {
                return;
            }
            if (target.type !== 'tfn') {
                if (report) {
                    err(report, expr, {
                        type: 'misc',
                        message: `not a tfn`,
                    });
                }
                return;
            }
            if (expr.args.length !== target.args.length) {
                if (report) {
                    err(report, expr, {
                        type: 'misc',
                        message: `wrong number of args`,
                    });
                }
                return;
            }
            const map: { [key: number]: Type } = {};
            for (let i = 0; i < expr.args.length; i++) {
                if (target.args[i].bound) {
                    const match = matchesType(
                        expr.args[i],
                        target.args[i].bound!,
                        ctx,
                        expr.form,
                        report,
                    );
                    if (!match) {
                        return;
                    }
                }
                map[target.args[i].sym] = expr.args[i];
            }
            return applyTypeVariables(target.body, map);
        }
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
                const res: Type = {
                    type: 'tag',
                    name: expr.target.name,
                    args,
                    form: expr.form,
                };
                if (report) {
                    report.types[expr.target.form.loc.idx] = res;
                }
                return res;
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
                args.push(arg.type);
                if (report) {
                    report.types[arg.type.form.loc.idx] = arg.type;
                    report.types[arg.pattern.form.loc.idx] = arg.type;
                    getPatternTypes(arg.pattern, arg.type, report.types);
                }
            });
            if (args.length < expr.args.length) {
                return;
            }
            if (expr.ret && report) {
                report.types[expr.ret.form.loc.idx] = expr.ret;
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
            return getType(expr.value, ctx, report);
        case 'deftype':
            if (report) {
                transformType(
                    expr.value,
                    {
                        Type(node) {
                            report.types[node.form.loc.idx] = node;
                            return null;
                        },
                    },
                    null,
                );
                report.types[expr.form.loc.idx] = expr.value;
            }
            return expr.value;
        case 'array': {
            let res = null;
            // hmmmmm I should have a "ground" type ... for the empty array.
            // like, this is a type that unifies with everything.
            let failed = false;
            for (let value of expr.values) {
                const type = getType(value, ctx, report);
                if (type) {
                    if (res) {
                        res = unifyTypes(res, type, ctx, expr.form, report);
                        if (!res) {
                            failed = true;
                        }
                    } else {
                        res = type;
                    }
                } else {
                    failed = true;
                }
            }
            if (failed || !res) {
                return;
            }
            return {
                type: 'apply',
                target: { type: 'builtin', name: 'array', form: expr.form },
                args: [
                    res,
                    {
                        type: 'number',
                        value: expr.values.length,
                        form: expr.form,
                        kind: 'uint',
                    },
                ],
                form: expr.form,
            };
        }
        case 'let': {
            expr.bindings.forEach((binding) =>
                getType(binding.value, ctx, report),
            );
            const body = expr.body.map((body) => getType(body, ctx, report));
            return body[body.length - 1] ?? nilt;
        }
        case 'switch': {
            getType(expr.target, ctx, report);
            let res: null | Type = null;
            let bad = false;
            expr.cases.forEach(({ pattern, body }) => {
                if (report) {
                    walkPattern(pattern, ctx, report);
                }
                const type = getType(body, ctx, report);
                if (!type) {
                    return;
                }
                if (!res) {
                    res = type;
                } else {
                    const un = unifyTypes(res, type, ctx, expr.form, report);
                    if (!un) {
                        bad = true;
                        return;
                    }
                    res = un;
                }
            });
            if (bad || !res) {
                return;
            }
            return res;
        }
        case 'record': {
            let spreadMap: null | RecordMap = null;
            if (expr.spread) {
                const spread = getType(expr.spread, ctx, report);
                if (!spread) {
                    return;
                }
                if (spread.type !== 'record') {
                    const res = applyAndResolve(spread, ctx, []);
                    if (res.type === 'error') {
                        return report
                            ? errf(report, spread.form, res.error)
                            : undefined;
                    }
                    if (res.type === 'local-bound') {
                        if (res.bound?.type !== 'record') {
                            return report
                                ? errf(report, spread.form, {
                                      type: 'not a record',
                                      form: spread.form,
                                  })
                                : undefined;
                        }
                        spreadMap = recordMap(res.bound);
                    }
                    if (res.type !== 'record') {
                        return report
                            ? errf(report, spread.form, {
                                  type: 'not a record',
                                  form: spread.form,
                              })
                            : undefined;
                    }
                    spreadMap = recordMap(res);
                } else {
                    spreadMap = recordMap(spread);
                }
            }
            const seen: { [key: string]: true } = {};
            const entries: { name: string; value: Type }[] = [];
            expr.entries.forEach((entry) => {
                let type = getType(entry.value, ctx, report);
                if (type) {
                    seen[entry.name] = true;
                    const prev = spreadMap ? spreadMap[entry.name] : null;
                    if (prev) {
                        const un = unifyTypes(
                            prev.value,
                            type,
                            ctx,
                            entry.value.form,
                            report,
                        );
                        if (!un) {
                            return;
                        }
                        type = un;
                    }
                    entries.push({
                        name: entry.name,
                        value: type,
                    });
                }
            });
            if (spreadMap) {
                Object.values(spreadMap).forEach((entry) => {
                    if (!seen[entry.name]) {
                        entries.push(entry);
                    }
                });
            }
            return {
                type: 'record',
                form: expr.form,
                open: false,
                entries,
            };
        }
        case 'recordAccess':
            if (expr.target) {
                let inner = getType(expr.target, ctx, report);
                if (!inner) return;
                for (let attr of expr.items) {
                    let resolved = applyAndResolve(inner, ctx, []);
                    if (resolved.type === 'error') {
                        return report
                            ? errf(report, expr.form, resolved.error)
                            : undefined;
                    }
                    if (resolved.type === 'local-bound') {
                        if (!resolved.bound) {
                            return report
                                ? errf(report, expr.form, {
                                      type: 'misc',
                                      message:
                                          'local has no bound, cannot take attribute',
                                  })
                                : undefined;
                        }
                        resolved = resolved.bound;
                    }
                    if (resolved.type !== 'record') {
                        return report
                            ? errf(report, expr.form, {
                                  type: 'misc',
                                  message:
                                      'cannot take attribute of a non-record ' +
                                      resolved.type,
                              })
                            : undefined;
                    }
                    const map = recordMap(resolved);
                    if (!map[attr]) {
                        return report
                            ? errf(report, expr.form, {
                                  type: 'misc',
                                  message: `record has no attribute ${attr}`,
                              })
                            : undefined;
                    }
                    inner = map[attr].value;
                }
                return inner;
            } else {
                // Ok so this is like very polymorphic, right?
                // and what do I do with that.
                // ok so
                // .a.b.c is shorthand for...
                // <V, T: {a {b {c V ...} ...} ...}>(m: T) => V
                // right? And then you call it with something
                // and we can figure out what's going on, with
                // some degree of reliability
                if (report) {
                    errf(report, expr.form, {
                        type: 'misc',
                        message: 'not yet impl',
                    });
                }
                return;
            }
        // TODO: This will probably be more complex?
        case 'markdown':
            return { type: 'builtin', name: 'string', form: expr.form };
        case 'attachment':
            // return { type: 'builtin', name: 'bytes', form: expr.form };
            if (!expr.file) {
                if (report) {
                    errf(report, expr.form, {
                        type: 'misc',
                        message: 'empty attachment',
                    });
                }
                return;
            }
            if (expr.file.meta.type === 'image') {
                return imageFileLazy;
            }
            return fileLazy;
        case 'recur':
            throw new Error('Not recur yet');
        case 'type-fn':
            throw new Error('what the heck');
        case 'let-type':
            throw new Error('ok');
    }
    let _: never = expr;
    console.error('getType is sorry about', expr);
};

export const walkPattern = (pattern: Pattern, ctx: Ctx, report: Report) => {
    switch (pattern.type) {
        case 'bool':
            report.types[pattern.form.loc.idx] = {
                type: 'builtin',
                name: 'bool',
                form: pattern.form,
            };
            return;
        case 'number':
            report.types[pattern.form.loc.idx] = pattern;
            return;
        case 'local':
            report.types[pattern.form.loc.idx] =
                ctx.localMap.terms[pattern.sym].type;
            return;
        case 'record':
            pattern.entries.forEach((entry) => {
                walkPattern(entry.value, ctx, report);
            });
            return;
        case 'tag':
            pattern.args.forEach((arg) => {
                walkPattern(arg, ctx, report);
            });
            return;
    }
};

export const getPatternTypes = (
    pattern: Pattern,
    type: Type,
    types: { [key: string]: Type },
) => {
    switch (pattern.type) {
        case 'record': {
            const map: { [name: string]: Type } = {};
            if (type.type === 'record') {
                type.entries.forEach((entry) => {
                    map[entry.name] = entry.value;
                });
            }
            pattern.entries.forEach((entry) => {
                types[entry.form.loc.idx] = map[entry.name];
            });
            return;
        }
    }
};
