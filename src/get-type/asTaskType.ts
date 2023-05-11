import { none } from '../to-ast/builtins';
import { Local, Node, Type } from '../types/ast';
import { applyAndResolve, expandEnumItems } from './applyAndResolve';
import { Ctx } from '../to-ast/library';
import {
    Report,
    TaskType,
    errf,
    isNilT,
    mergeTaskTypes,
} from './get-types-new';
import { Error, MatchError } from '../types/types';

// (@task some-type res)
// some-type might be one of:
// - ('Return 10)
// - ('Failure lolz)
// - ('Normal input output)
export const expandTaskEffects = (
    t: Type,
    ctx: Ctx,
): { type: 'error'; error: MatchError } | TaskType => {
    switch (t.type) {
        case 'tag': {
            if (t.args.length === 1) {
                if (t.name === 'Return') {
                    return {
                        type: 'task',
                        locals: [],
                        result: t.args[0],
                        effects: {},
                    };
                } else {
                    return {
                        type: 'task',
                        locals: [],
                        result: none,
                        effects: {
                            [t.name]: { input: t.args[0], output: null },
                        },
                    };
                }
            }
            if (t.args.length === 2) {
                return {
                    type: 'task',
                    locals: [],
                    result: none,
                    effects: {
                        [t.name]: { input: t.args[0], output: t.args[1] },
                    },
                };
            }
            return {
                type: 'error',
                error: {
                    type: 'misc',
                    message: `Task effect should have 1 or 2 arguments`,
                    form: t.form,
                    typ: t,
                    path: [],
                },
            };
        }
        case 'union': {
            let res = null;
            for (let item of t.items) {
                const ex = expandTaskEffects(item, ctx);
                if (ex.type === 'error') {
                    return ex;
                }
                if (res) {
                    const merged = mergeTaskTypes(res, ex, ctx);
                    if (merged.type === 'error') {
                        return merged;
                    }
                    res = merged;
                } else {
                    res = ex;
                }
            }
            return (
                res ?? { type: 'task', effects: {}, locals: [], result: none }
            );
        }
        case 'local':
            return { type: 'task', effects: {}, locals: [t], result: none };
        case 'global': {
            const app = applyAndResolve(t, ctx, []);
            if (app !== t && app.type !== 'error') {
                return expandTaskEffects(app, ctx);
            }
        }
        default:
            return {
                type: 'error',
                error: {
                    type: 'not a task',
                    form: t.form,
                    inner: {
                        type: 'misc',
                        message: `Type cannot be used as task effect`,
                    },
                    target: t,
                    path: [],
                },
            };
        // case ''
    }
};

export const asTaskType = (
    t: Type,
    ctx: Ctx,
    // report: Report,
): { type: 'error'; error: MatchError } | TaskType => {
    if (t.type === 'task') {
        const inner = expandTaskEffects(t.effects, ctx);
        if (inner.type === 'error') {
            return inner;
        }
        return mergeTaskTypes(
            {
                type: 'task',
                effects: {},
                locals: [],
                result: t.result,
                extraReturn: t.extraReturnEffects,
            },
            inner,
            ctx,
        );
    }
    let expanded: { [key: string]: { args: Type[]; form: Node } };
    let locals: Local[] = [];
    if (t.type === 'tag') {
        expanded = { [t.name]: { args: t.args, form: t.form } };
    } else if (t.type === 'union') {
        let ex = expandEnumItems(t.items, ctx, []);
        if (ex.type === 'error') {
            // errf(report, t.form, ex.error);
            return ex;
        }
        expanded = ex.map;
    } else if (t.type === 'local') {
        const bound = ctx.results.localMap.types[t.sym].bound;
        if (bound?.type !== 'union') {
            return {
                type: 'error',
                error: {
                    type: 'misc',
                    message: 'local bound must be a union',
                    form: t.form,
                    path: [],
                },
            };
        }
        locals.push(t);
        expanded = {};
    } else {
        return {
            type: 'error',
            error: {
                type: 'misc',
                message: 'Task type must be a union',
                typ: t,
                form: t.form,
                path: [],
            },
        };
    }

    let tt: TaskType | null = null;

    let failed: null | Error = null;

    Object.entries(expanded).forEach(([k, v]) => {
        // TODO: Ok, so ... locals get added from (@task T ()) right?
        // Let's ...

        if (failed) {
            return;
        }
        let ot: TaskType;
        if (k === 'Return') {
            if (v.args.length !== 1) {
                failed = {
                    type: 'misc',
                    message: 'return must have 1 arg',
                    form: v.form,
                };
                return;
            }
            ot = { effects: {}, result: v.args[0], locals, type: 'task' };
        } else {
            if (v.args.length !== 2) {
                failed = {
                    type: 'misc',
                    message: 'non-return task tags must have 2 args',
                    form: v.form,
                };
                return;
            }
            const [input, output] = v.args;

            if (isNilT(output)) {
                ot = {
                    type: 'task',
                    effects: { [k]: { input, output: null } },
                    result: none,
                    locals,
                };
            } else {
                if (output.type !== 'fn') {
                    failed = {
                        type: 'misc',
                        message: 'task arg 2 must be fn or nil',
                        form: v.form,
                    };
                    return;
                }
                if (output.args.length !== 1) {
                    failed = {
                        type: 'misc',
                        message: 'task arg 2 must be fn with one argument',
                        form: v.form,
                    };
                    return;
                }

                ot = {
                    type: 'task',
                    effects: { [k]: { input, output: output.args[0].type } },
                    result: none,
                    locals,
                };

                // output.body is the @recur here??? Should we evaluate it too? Or do we run the risk of an infinite loop?
                if (output.body.type !== 'recur') {
                    const body = asTaskType(output.body, ctx);
                    if (body.type === 'error') {
                        failed = {
                            type: 'not a task',
                            inner: body.error,
                            target: output.body,
                            // message: 'task arg 2 fn response not taskable',
                            form: v.form,
                            path: [],
                        };
                        return;
                    }
                    const merged = mergeTaskTypes(ot, body, ctx);
                    if (merged.type === 'error') {
                        failed = {
                            type: 'misc',
                            message:
                                'unable to merge task types from task arg 2',
                            form: v.form,
                        };
                        return;
                    }
                    ot = merged;
                }
            }
        }

        if (!tt) {
            tt = ot;
            return;
        }

        const merged = mergeTaskTypes(tt, ot, ctx);
        if (merged.type === 'error') {
            failed = merged.error;
            return;
        }
        tt = merged;
    });

    if (failed) {
        return { type: 'error', error: failed };
    }
    if (!tt && locals.length) {
        return { effects: {}, locals, result: none, type: 'task' };
    }
    if (!tt) {
        return {
            type: 'error',
            error: {
                type: 'misc',
                message: 'nothing?',
                path: [],
                form: t.form,
            },
        };
    }
    return tt;
};
