import { none } from '../to-ast/builtins';
import { Local, Node, Type } from '../types/ast';
import { expandEnumItems } from './applyAndResolve';
import { Ctx } from '../to-ast/library';
import {
    Report,
    TaskType,
    errf,
    isNilT,
    mergeTaskTypes,
} from './get-types-new';

export const asTaskType = (
    t: Type,
    ctx: Ctx,
    report: Report,
): null | TaskType => {
    if (t.type === 'task') {
        const inner = asTaskType(t.effects, ctx, report);
        if (!inner) {
            errf(report, t.form, {
                type: 'misc',
                message: 'cannot interpret task type',
                typ: t.effects,
            });
            return null;
        }
        return mergeTaskTypes(
            {
                effects: {},
                locals: [],
                result: t.result,
            },
            inner,
            ctx,
            report,
        );
    }
    let expanded: { [key: string]: { args: Type[]; form: Node } };
    let locals: Local[] = [];
    if (t.type === 'tag') {
        expanded = { [t.name]: { args: t.args, form: t.form } };
    } else if (t.type === 'union') {
        let ex = expandEnumItems(t.items, ctx, []);
        if (ex.type === 'error') {
            errf(report, t.form, ex.error);
            return null;
        }
        expanded = ex.map;
    } else if (t.type === 'local') {
        const bound = ctx.results.localMap.types[t.sym].bound;
        if (bound?.type !== 'union') {
            errf(report, t.form, {
                type: 'misc',
                message: 'local bound must be a union',
                form: t.form,
            });
            return null;
        }
        locals.push(t);
        expanded = {};
    } else {
        errf(report, t.form, {
            type: 'misc',
            message: 'Task type must be a union',
            typ: t,
            form: t.form,
        });
        return null;
    }

    let tt: TaskType | null = null;

    let failed = false;

    Object.entries(expanded).forEach(([k, v]) => {
        let ot: TaskType;
        if (k === 'Return') {
            if (v.args.length !== 1) {
                errf(report, v.form, {
                    type: 'misc',
                    message: 'return must have 1 arg',
                    form: v.form,
                });
                failed = true;
                return;
            }
            ot = { effects: {}, result: v.args[0], locals };
        } else {
            if (v.args.length !== 2) {
                errf(report, v.form, {
                    type: 'misc',
                    message: 'non-return task tags must have 2 args',
                    form: v.form,
                });
                failed = true;
                return;
            }
            const [input, output] = v.args;

            if (isNilT(output)) {
                ot = {
                    effects: { [k]: { input, output: null } },
                    result: none,
                    locals,
                };
            } else {
                if (output.type !== 'fn') {
                    errf(report, v.form, {
                        type: 'misc',
                        message: 'task arg 2 must be fn or nil',
                        form: v.form,
                    });
                    failed = true;
                    return;
                }
                if (output.args.length !== 1) {
                    errf(report, v.form, {
                        type: 'misc',
                        message: 'task arg 2 must be fn with one argument',
                        form: v.form,
                    });
                    failed = true;
                    return;
                }

                ot = {
                    effects: { [k]: { input, output: output.args[0].type } },
                    result: none,
                    locals,
                };

                // output.body is the @recur here??? Should we evaluate it too? Or do we run the risk of an infinite loop?
                if (output.body.type !== 'recur') {
                    const body = asTaskType(output.body, ctx, report);
                    if (!body) {
                        errf(report, v.form, {
                            type: 'misc',
                            message: 'task arg 2 fn response not taskable',
                            form: v.form,
                        });
                        failed = true;
                        return;
                    }
                    const merged = mergeTaskTypes(ot, body, ctx, report);
                    if (!merged) {
                        errf(report, v.form, {
                            type: 'misc',
                            message:
                                'unable to merge task types from task arg 2',
                            form: v.form,
                        });
                        failed = true;
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

        const merged = mergeTaskTypes(tt, ot, ctx, report);
        if (!merged) {
            failed = true;
            return;
        }
        tt = merged;
    });

    if (failed) {
        return null;
    }
    if (!tt && locals.length) {
        return { effects: {}, locals, result: none };
    }
    return tt;
};
