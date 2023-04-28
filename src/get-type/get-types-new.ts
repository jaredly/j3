import { blank, nilt } from '../to-ast/Ctx';
import { any, fileLazy, imageFileLazy, none } from '../to-ast/builtins';
import { Expr, Node, Pattern, TRecord, Type } from '../types/ast';
import {
    applyAndResolve,
    applyTypeVariables,
    expandEnumItems,
    matchesType,
} from './matchesType';
import type { Error, MatchError } from '../types/types';
import { _unifyTypes, unifyTypes } from './unifyTypes';
import { transformType } from '../types/walk-ast';
import { Ctx, Env } from '../to-ast/library';
import { asTaskType } from './asTaskType';
import { ensure } from '../to-ast/nodeToExpr';
import { tryToInferTypeArgs } from './tryToInferTypeArgs';

export type RecordMap = { [key: string]: TRecord['entries'][0] };
// TODO: do we want to error report here?
export const recordMap = (record: TRecord, ctx: Ctx): RecordMap => {
    const map: RecordMap = {};
    record.spreads.forEach((spread) => {
        const t = applyAndResolve(spread, ctx, []);
        if (t.type === 'record') {
            Object.assign(map, recordMap(t, ctx));
        }
    });
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
    if (!report.errors[expr.form.loc]) {
        report.errors[expr.form.loc] = [];
    }
    report.errors[expr.form.loc].push(error);
};

export const errf = (report: Report, form: Node, error: Error) => {
    if (!report.errors[form.loc]) {
        report.errors[form.loc] = [];
    }
    report.errors[form.loc].push(error);
};

// So, IF we have a localized error, we will *not*
// propagate it up.
export const getType = (
    expr: Expr,
    ctx: Ctx,
    report?: Report,
    effects?: TaskType['effects'],
): Type | void => {
    const type = _getType(expr, ctx, report, effects);
    if (type && report) {
        report.types[expr.form.loc] = type;
    }
    return type;
};

const _getType = (
    expr: Expr,
    ctx: Ctx,
    report?: Report,
    effects?: TaskType['effects'],
): Type | void => {
    switch (expr.type) {
        case 'builtin': {
            const bin = ctx.global.builtins[expr.name];
            return bin?.type === 'term' ? bin.ann : void 0;
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
                        reason: expr.reason,
                    });
                }
            }
            return;
        case 'blank':
            if (report) {
                err(report, expr, {
                    type: 'unparsed',
                    form: expr.form,
                });
            }
            return;
        case 'string':
            if (report) {
                // Populate the map
                expr.templates.forEach(({ expr }) => {
                    const t = getType(expr, ctx, report, effects);
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
            if (report && !ctx.results.localMap.terms[expr.sym]) {
                err(report, expr, {
                    type: 'misc',
                    message: `local not found ${expr.sym}`,
                });
            }
            return ctx.results.localMap.terms[expr.sym]?.type;
        case 'global': {
            const defn = ctx.global.library.definitions[expr.hash];
            return defn?.type === 'term' ? defn.ann : void 0;
        }
        case 'toplevel': {
            const defn = ctx.results.toplevel[expr.hash];
            return defn?.type === 'def' ? defn.ann : void 0;
        }
        case 'type-apply': {
            const target = getType(expr.target, ctx, report, effects);
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
                    // console.log('the arg', expr.args[i]);
                    // console.log('the bound', target.args[i].bound);
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
                map[target.args[i].form.loc] = expr.args[i];
            }
            return applyTypeVariables(target.body, map);
        }
        case 'if': {
            const cond = getType(expr.cond, ctx, report, effects);
            const yes = getType(expr.yes, ctx, report, effects);
            const no = getType(expr.no, ctx, report, effects);
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
                const res = getType(arg, ctx, report, effects);
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
                    report.types[expr.target.form.loc] = res;
                }
                ensure(ctx.results.display, expr.target.form.loc, {}).style = {
                    type: 'tag',
                    ann: res,
                };
                return res;
            }
            let target = getType(expr.target, ctx, report, effects);
            if (!target) {
                return;
            }
            if (args.length < expr.args.length) {
                return;
            }
            if (target.type === 'tfn') {
                const inferred = tryToInferTypeArgs(target, args, ctx, report);
                if (!inferred) {
                    if (report) {
                        err(report, expr, {
                            type: 'misc',
                            message: 'unable to infer type arguments',
                        });
                    }
                    return;
                }
                target = inferred;
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
                        target.args[i].type,
                        ctx,
                        expr.args[i].form,
                        report,
                    );
                }
                if (report && args.length < target.args.length) {
                    err(report, expr, {
                        type: 'too few arguments',
                        expected: target,
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
        case 'tfn': {
            const body = getType(expr.body, ctx, report);
            return body
                ? {
                      type: 'tfn',
                      body,
                      args: expr.args,
                      form: expr.form,
                  }
                : void 0;
        }
        case 'fn': {
            const args: { type: Type; name?: string; form: Node }[] = [];
            expr.args.forEach((arg) => {
                args.push({
                    name:
                        arg.pattern.type === 'local'
                            ? arg.pattern.name
                            : undefined,
                    type: arg.type,
                    form: arg.type.form,
                });
                if (report) {
                    report.types[arg.type.form.loc] = arg.type;
                    report.types[arg.pattern.form.loc] = arg.type;
                    getPatternTypes(arg.pattern, arg.type, report.types);
                }
            });
            if (args.length < expr.args.length) {
                return;
            }
            if (expr.ret && report) {
                report.types[expr.ret.form.loc] = expr.ret;
            }
            let myEffects: TaskType['effects'] = {};
            const body = expr.body.map((body) =>
                getType(body, ctx, report, myEffects),
            );
            const last =
                expr.ret ?? (body.length ? body[body.length - 1] : nilt);
            if (!last) {
                return;
            }
            return {
                type: 'fn',
                args,
                body: Object.keys(myEffects).length
                    ? {
                          type: 'task',
                          effects: {
                              type: 'union',
                              items: Object.entries(myEffects).map(
                                  ([k, { input, output }]) => ({
                                      type: 'tag',
                                      name: k,
                                      args: output ? [input, output] : [input],
                                      form: input.form,
                                  }),
                              ),
                              open: false,
                              form: last.form,
                          },
                          result: last,
                          form: last.form,
                      }
                    : last,
                form: expr.form,
            };
        }
        case 'def':
            return getType(expr.value, ctx, report, effects);
        case 'deftype':
            if (report) {
                transformType(
                    expr.value,
                    {
                        Type(node) {
                            report.types[node.form.loc] = node;
                            return null;
                        },
                    },
                    null,
                );
                report.types[expr.form.loc] = expr.value;
            }
            return expr.value;
        case 'array': {
            let res = null;
            // hmmmmm I should have a "ground" type ... for the empty array.
            // like, this is a type that unifies with everything.
            let failed = false;
            for (let value of expr.values) {
                const type = getType(value, ctx, report, effects);
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
                getType(binding.value, ctx, report, effects),
            );
            const body = expr.body.map((body) =>
                getType(body, ctx, report, effects),
            );
            return body[body.length - 1] ?? nilt;
        }
        case 'switch': {
            getType(expr.target, ctx, report, effects);
            let res: null | Type = null;
            let bad = false;
            expr.cases.forEach(({ pattern, body }) => {
                if (report) {
                    walkPattern(pattern, ctx, report);
                }
                const type = getType(body, ctx, report, effects);
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
            const spreadMap: RecordMap = {};
            // console.log('a rec', expr);
            if (expr.spreads) {
                for (let sprex of expr.spreads) {
                    const spread = getType(sprex, ctx, report, effects);
                    if (!spread) {
                        console.log('nope sorry');
                        return;
                    }
                    if (spread.type !== 'record') {
                        const res = applyAndResolve(spread, ctx, []);
                        if (res.type === 'error') {
                            return report
                                ? errf(report, spread.form, res.error)
                                : undefined;
                        }
                        // if (res.type === 'local-bound') {
                        //     if (res.bound?.type !== 'record') {
                        //         return report
                        //             ? errf(report, spread.form, {
                        //                   type: 'not a record',
                        //                   form: spread.form,
                        //               })
                        //             : undefined;
                        //     }
                        //     Object.assign(spreadMap, recordMap(res.bound, ctx));
                        // }
                        if (res.type !== 'record') {
                            return report
                                ? errf(report, spread.form, {
                                      type: 'not a record',
                                      form: spread.form,
                                  })
                                : undefined;
                        }
                        Object.assign(spreadMap, recordMap(res, ctx));
                    } else {
                        Object.assign(spreadMap, recordMap(spread, ctx));
                    }
                }
            }
            const seen: { [key: string]: true } = {};
            const entries: { name: string; value: Type }[] = [];
            expr.entries.forEach((entry) => {
                let type = getType(entry.value, ctx, report, effects);
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
                spreads: [],
                entries,
            };
        }
        case 'recordAccess':
            if (expr.target) {
                let inner = getType(expr.target, ctx, report, effects);
                if (!inner) return;
                for (let attr of expr.items) {
                    let resolved = applyAndResolve(inner, ctx, []);
                    if (resolved.type === 'error') {
                        return report
                            ? errf(report, expr.form, resolved.error)
                            : undefined;
                    }
                    // if (resolved.type === 'local-bound') {
                    //     if (!resolved.bound) {
                    //         return report
                    //             ? errf(report, expr.form, {
                    //                   type: 'misc',
                    //                   message:
                    //                       'local has no bound, cannot take attribute',
                    //               })
                    //             : undefined;
                    //     }
                    //     resolved = resolved.bound;
                    // }
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
                    const map = recordMap(resolved, ctx);
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
        case 'rich-text':
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
        case 'loop':
            return getType(expr.inner, ctx, report, effects);
        case 'recur':
            return (
                ctx.results.localMap.terms[expr.sym]?.type ??
                (report
                    ? err(report, expr, {
                          type: 'misc',
                          message: 'missing @loop type',
                      })
                    : void 0)
            );
        // throw new Error('Not recur yet');
        case 'type-fn':
            throw new Error('what the heck');
        case 'let-type':
            throw new Error('ok');
        case 'task': {
            const inner = getType(expr.inner, ctx, report, effects);
            if (!inner) {
                return;
            }
            const taskType = asTaskType(
                inner,
                ctx,
                report ?? { errors: {}, types: {} },
            );
            if (!taskType) {
                return report
                    ? errf(report, expr.form, {
                          type: 'misc',
                          message: 'body of task throw not a valid task type',
                      })
                    : void 0;
            }
            if (effects) {
                let failed = false;
                Object.entries(taskType.effects).forEach(([k, v]) => {
                    if (!effects[k]) {
                        effects[k] = v;
                    } else {
                        const error = mergeInputOutput(
                            effects,
                            k,
                            v.input,
                            v.output,
                            ctx,
                        );
                        if (error) {
                            if (report) {
                                errf(report, v.input.form, error);
                            }
                            failed = true;
                        }
                    }
                });
                if (failed) {
                    return;
                }
            }
            if (expr.maybe) {
                const res = asResult(taskType.result, ctx);
                if (!res) {
                    return report
                        ? errf(report, expr.form, {
                              type: 'misc',
                              message: `Can't !? on a task with a non-result return type`,
                          })
                        : void 0;
                }
                if (effects) {
                    if (!effects['Failure']) {
                        effects['Failure'] = { input: res.err, output: null };
                    } else {
                        const error = mergeInputOutput(
                            effects,
                            'Failure',
                            res.err,
                            null,
                            ctx,
                        );
                        if (error) {
                            if (report) {
                                errf(report, res.err.form, error);
                            }
                            return;
                        }
                    }
                }
                return res.ok;
            }
            return taskType.result;
        }
    }
    let _: never = expr;
    console.error('getType is sorry about', expr);
};

export const asResult = (t: Type, ctx: Ctx) => {
    const res = applyAndResolve(t, ctx, []);
    if (res.type !== 'union' || res.open) {
        return;
    }
    const enu = expandEnumItems(res.items, ctx, []);
    if (enu.type === 'error') {
        return;
    }
    if (Object.keys(enu.map).length !== 2) {
        return;
    }
    if (!enu.map['Ok'] || !enu.map['Err']) {
        return;
    }
    if (enu.map['Ok'].args.length !== 1 || enu.map['Err'].args.length !== 1) {
        return;
    }
    return { ok: enu.map['Ok'].args[0], err: enu.map['Err'].args[0] };
};

export const walkPattern = (pattern: Pattern, ctx: Ctx, report: Report) => {
    switch (pattern.type) {
        case 'bool':
            report.types[pattern.form.loc] = {
                type: 'builtin',
                name: 'bool',
                form: pattern.form,
            };
            return;
        case 'number':
            report.types[pattern.form.loc] = pattern;
            return;
        case 'local':
            report.types[pattern.form.loc] =
                ctx.results.localMap.terms[pattern.sym].type;
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
                types[entry.form.loc] = map[entry.name];
            });
            return;
        }
    }
};

export type TaskType = {
    effects: { [key: string]: { input: Type; output: Type | null } };
    result: Type;
};

export const mergeInputOutput = (
    merged: TaskType['effects'],
    k: string,
    input: Type,
    output: Type | null,
    ctx: Ctx,
): Error | void => {
    if (!merged[k]) {
        merged[k] = { input, output };
        return;
    }
    const inp = _unifyTypes(input, merged[k].input, ctx, []);
    if (inp.type === 'error') {
        return inp.error;
    }
    if ((!output && merged[k].output) || (output && !merged[k].output)) {
        return {
            type: 'misc',
            message: `unable to agree on whether ${k} has a return value`,
            form: input.form,
        };
    }
    if (!output && !merged[k].output) {
        merged[k] = { input: inp, output: null };
        return;
    }
    const out = _unifyTypes(output!, merged[k].output!, ctx, []);
    if (out.type === 'error') {
        return out.error;
    }
    merged[k] = { input: inp, output: out };
};

export const mergeTaskTypes = (
    one: TaskType,
    two: TaskType,
    ctx: Ctx,
    report: Report,
): TaskType | null => {
    const result = unifyTypes(
        one.result,
        two.result,
        ctx,
        one.result.form,
        report,
    );
    if (!result) {
        return null;
    }
    const merged: TaskType['effects'] = { ...two.effects };
    let failed = false;
    Object.entries(one.effects).forEach(([k, { input, output }]) => {
        const error = mergeInputOutput(merged, k, input, output, ctx);
        if (error) {
            errf(report, input.form, error);
            failed = true;
        }
    });

    if (failed) {
        return null;
    }
    return { effects: merged, result };
};

export const isNilT = (t: Type) =>
    t.type === 'record' &&
    t.entries.length === 0 &&
    t.spreads.length === 0 &&
    !t.open;
