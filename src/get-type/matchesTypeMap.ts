import { any } from '../to-ast/builtins';
import { Ctx, globalType } from '../to-ast/library';
import { Node, Type } from '../types/ast';
import { MatchError } from '../types/types';
import { applyAndResolve, expandEnumItems } from './applyAndResolve';
import { asTaskType } from './asTaskType';
import { expandTask } from './expandTask';
import { recordMap } from './get-types-new';
import { inv } from './matchesType';

type T<K> = Extract<Type, { type: K }>;
type R = boolean | MatchError;

type MC = {
    ctx: Ctx;
    can: { path: string[]; loop?: Type };
    exp: { path: string[]; loop?: Type };
    typeArgs?: { [idx: number]: Type[] };
};

export const matchesTypeBetter = (
    candidate: Type,
    expected: Type,
    mc: MC,
    // ctx: Ctx,
    // path: string[] = [],
): true | MatchError => {
    const res = useMatchMap(candidate, expected, mc);
    if (res === false) {
        return inv(candidate, expected, mc.can.path);
    }
    return res;
};

const loopCheckSize = 3;
export const hasMatchLoop = (path: string[]) => {
    const pl = path.length;
    // Conservative
    if (pl < loopCheckSize * 4) {
        return false;
    }
    for (let i = 0; i < pl - loopCheckSize; i++) {
        let bad = false;
        for (let j = 0; j < loopCheckSize; j++) {
            const last = path[pl - 1 - loopCheckSize + j];
            const got = path[i + j];
            if (got !== last) {
                bad = true;
                break;
            }
        }
        if (!bad) {
            return true;
        }
    }
};

export const useMatchMap = (candidate: Type, expected: Type, mc: MC): R => {
    if (hasMatchLoop(mc.can.path) || hasMatchLoop(mc.exp.path)) {
        return {
            type: 'misc',
            message: `type matching looped! Sorry, dunno what to tell you.`,
            path: mc.can.path,
            form: candidate.form,
        };
    }

    const key =
        candidate.type === expected.type
            ? candidate.type
            : candidate.type + '_' + expected.type;
    const mm = matchMap as any as {
        [key: string]: (can: Type, exp: Type, mc: MC) => R;
    };

    // TODO: Should we hang onto the different potential errors here?
    let fn = mm[key];
    let res: R | null = null;
    if (fn) {
        res = fn(candidate, expected, mc);
        if (res === true) {
            return true;
        }
    }

    fn = mm[candidate.type + '_'];
    if (fn) {
        res = fn(candidate, expected, mc);
        if (res === true) {
            return true;
        }
    }

    fn = mm['_' + expected.type];
    if (fn) {
        res = fn(candidate, expected, mc);
        if (res === true) {
            return true;
        }
    }

    if (res === null) {
        return {
            type: 'invalid type',
            expected,
            found: candidate,
            form: candidate.form,
            path: mc.can.path,
            inner: {
                type: 'misc',
                message: `not handled matches "${key}"`,
                form: candidate.form,
                path: mc.can.path,
            },
        };
    }

    return res;
};

const canPath = (mc: MC, item: string) => ({
    ...mc,
    can: { ...mc.can, path: mc.can.path.concat([item]) },
});

const expPath = (mc: MC, item: string) => ({
    ...mc,
    exp: { ...mc.exp, path: mc.exp.path.concat([item]) },
});

const bothPath = (mc: MC, item: string) => ({
    ...mc,
    can: { ...mc.can, path: mc.can.path.concat([item]) },
    exp: { ...mc.exp, path: mc.exp.path.concat([item]) },
});

export const matchMap = {
    toplevel(can: T<'toplevel'>, exp: T<'toplevel'>, mc: MC) {
        return can.hash === exp.hash;
    },
    global(can: T<'global'>, exp: T<'global'>, mc: MC) {
        return can.hash === exp.hash;
    },
    local(can: T<'local'>, exp: T<'local'>, mc: MC) {
        return can.sym === exp.sym;
    },

    toplevel_(can: T<'toplevel'>, exp: Type, mc: MC): R {
        const ref = mc.ctx.results.toplevel[can.hash];
        if (ref?.type !== 'deftype') {
            return {
                type: 'misc',
                message: `Unable to resolve toplevel ${can.hash}`,
                form: can.form,
                path: mc.can.path,
            };
        }
        return matchesTypeBetter(
            ref.value,
            exp,
            canPath(mc, `resolve_${can.hash}`),
        );
    },

    _toplevel(can: Type, exp: T<'toplevel'>, mc: MC): R {
        const ref = mc.ctx.results.toplevel[exp.hash];
        if (ref?.type !== 'deftype') {
            return {
                type: 'misc',
                message: `Unable to resolve toplevel ${exp.hash}`,
                form: exp.form,
                path: mc.exp.path,
            };
        }
        return matchesTypeBetter(
            can,
            ref.value,
            expPath(mc, `resolve_${exp.hash}`),
        );
    },

    global_(can: T<'toplevel'>, exp: Type, mc: MC): R {
        const ref = mc.ctx.global.library.definitions[can.hash];
        if (ref?.type !== 'type') {
            return {
                type: 'misc',
                message: `Unable to resolve toplevel ${can.hash}`,
                form: can.form,
                path: mc.can.path,
            };
        }
        return matchesTypeBetter(
            ref.value,
            exp,
            canPath(mc, `resolve_${can.hash}`),
        );
    },

    _global(can: Type, exp: T<'toplevel'>, mc: MC): R {
        const ref = mc.ctx.global.library.definitions[exp.hash];
        if (ref?.type !== 'type') {
            return {
                type: 'misc',
                message: `Unable to resolve toplevel ${exp.hash}`,
                form: exp.form,
                path: mc.exp.path,
            };
        }
        return matchesTypeBetter(
            can,
            ref.value,
            expPath(mc, `resolve_${exp.hash}`),
        );
    },

    local_(can: T<'local'>, exp: Type, mc: MC): R {
        // Dunno bout this
        // if (mc.typeArgs?.[can.sym] != null) {
        //     mc.typeArgs[can.sym].push(can);
        //     return true;
        // }

        const found = mc.ctx.results.localMap.types[can.sym];
        if (!found) {
            return {
                type: 'misc',
                message: 'unresolved local',
                path: mc.can.path,
                form: can.form,
            };
        }
        return matchesTypeBetter(
            found.bound ?? any,
            exp,
            canPath(mc, `local_${can.sym}`),
        );
    },

    _local(can: Type, exp: T<'local'>, mc: MC): R {
        if (mc.typeArgs?.[exp.sym] != null) {
            mc.typeArgs[exp.sym].push(can);
            return true;
        }

        const found = mc.ctx.results.localMap.types[exp.sym];
        if (!found) {
            return {
                type: 'misc',
                message: 'unresolved local',
                path: mc.exp.path,
                form: exp.form,
            };
        }
        if (!found.bound) {
            return true;
        }
        return matchesTypeBetter(
            can,
            found.bound,
            expPath(mc, `local_${exp.sym}`),
        );
    },

    number_builtin(can: T<'number'>, exp: T<'builtin'>, mc: MC) {
        return can.kind === exp.name;
    },

    bool_builtin(can: T<'bool'>, exp: T<'builtin'>, mc: MC) {
        return exp.name === 'bool';
    },

    string_builtin(can: T<'string'>, exp: T<'builtin'>, mc: MC) {
        return exp.name === 'string';
    },

    number(can: T<'number'>, exp: T<'number'>, mc: MC) {
        return can.kind === exp.kind && can.value === exp.value;
    },
    bool(can: T<'bool'>, exp: T<'bool'>, mc: MC) {
        return can.value === exp.value;
    },
    unresolved: () => false,
    unresolved_: () => false,
    _unresolved: () => false,
    any: () => true,
    any_: () => false,
    _any: () => true,
    none: () => true, // the "empty" type
    none_: () => true,
    _none: () => false,

    recur: () => true, // STOPSHIP: This is probably false?
    // Really, we should do like a `matchesTypeWithRecurAsTrue`
    // on the mc.can.loop & mc.exp.loop, and if that's true then we're good.
    // Right?

    recur_(can: T<'recur'>, exp: Type, mc: MC): R {
        if (!mc.can.loop) {
            return {
                type: 'misc',
                message: `no loop in candidate type, invalid recur`,
                path: mc.can.path,
                form: can.form,
            };
        }
        return useMatchMap(mc.can.loop, exp, canPath(mc, 'recur'));
    },

    _recur(can: Type, exp: T<'recur'>, mc: MC): R {
        if (!mc.exp.loop) {
            return {
                type: 'misc',
                message: `no loop in candidate type, invalid recur`,
                path: mc.exp.path,
                form: exp.form,
            };
        }
        return useMatchMap(can, mc.exp.loop, expPath(mc, 'recur'));
    },

    loop_(can: T<'loop'>, exp: Type, mc: MC): R {
        return useMatchMap(can.inner, exp, {
            ...mc,
            can: { ...mc.can, loop: can.inner },
        });
    },

    _loop(can: Type, exp: T<'loop'>, mc: MC): R {
        return useMatchMap(can, exp.inner, {
            ...mc,
            exp: { ...mc.exp, loop: exp.inner },
        });
    },

    string(can: T<'string'>, exp: T<'string'>, mc: MC): R {
        if (can.first.text !== exp.first.text) {
            return inv(can, exp, mc.can.path.concat(['first']));
        }
        if (can.templates.length !== exp.templates.length) {
            return inv(can, exp, mc.can.path.concat(['templates']));
        }
        for (let i = 0; i < can.templates.length; i++) {
            const ct = can.templates[i];
            const et = exp.templates[i];
            if (ct.suffix.text !== et.suffix.text) {
                return inv(can, exp, mc.can.path.concat([`suffix_${i}`]));
            }
            const res = matchesTypeBetter(
                ct.type,
                et.type,
                bothPath(mc, `suffix_${i}`),
            );
            if (res !== true) {
                return res;
            }
        }
        return true;
    },

    builtin: (can: T<'builtin'>, exp: T<'builtin'>, mc: MC) =>
        can.name === exp.name,

    apply(can: T<'apply'>, exp: T<'apply'>, mc: MC): R {
        const one = matchesTypeBetter(
            can.target,
            exp.target,
            bothPath(mc, 'target'),
        );
        if (one !== true) {
            return one;
        }
        return cmpArgs(can.args, exp.args, mc, can.form);
    },

    apply_(can: T<'apply'>, exp: Type, mc: MC) {
        const app = applyAndResolve(
            can,
            mc.ctx,
            mc.can.path,
            true,
            mc.typeArgs,
        );
        if (app.type === 'error') {
            return app.error;
        }
        return matchesTypeBetter(app, exp, canPath(mc, `<apply>`));
    },

    _apply(can: Type, exp: T<'apply'>, mc: MC) {
        const app = applyAndResolve(
            exp,
            mc.ctx,
            mc.can.path,
            true,
            mc.typeArgs,
        );
        if (app.type === 'error') {
            return app.error;
        }
        return matchesTypeBetter(can, app, expPath(mc, `<apply>`));
    },

    tag(can: T<'tag'>, exp: T<'tag'>, mc: MC): R {
        if (can.name !== exp.name) {
            return false;
        }
        return cmpArgs(can.args, exp.args, mc, can.form);
    },

    fn(can: T<'fn'>, exp: T<'fn'>, mc: MC): R {
        // TODO: Do we switch the order of these?
        const res = cmpArgs(
            can.args.map((a) => a.type),
            exp.args.map((a) => a.type),
            mc,
            can.form,
        );
        if (res !== true) {
            return res;
        }
        return matchesTypeBetter(can.body, exp.body, bothPath(mc, 'body'));
    },

    tfn(can: T<'tfn'>, exp: T<'tfn'>, mc: MC): R {
        // TODO: Do we switch the order of these?
        const res = cmpArgs(
            can.args.map((a) => a.bound ?? any),
            exp.args.map((a) => a.bound ?? any),
            mc,
            can.form,
        );
        if (res !== true) {
            return res;
        }
        return matchesTypeBetter(can.body, exp.body, bothPath(mc, 'body'));
    },

    tag_union(can: T<'tag'>, exp: T<'union'>, mc: MC): R {
        return matchMap.union(
            { type: 'union', items: [can], form: can.form, open: false },
            exp,
            mc,
        );
    },

    union_tag(can: T<'union'>, exp: T<'tag'>, mc: MC): R {
        return matchMap.union(
            can,
            { type: 'union', items: [exp], form: exp.form, open: false },
            mc,
        );
    },

    union(can: T<'union'>, exp: T<'union'>, mc: MC): R {
        const map = expandEnumItems(exp.items, mc.ctx, mc.exp.path);
        const cmap = expandEnumItems(can.items, mc.ctx, mc.can.path);
        if (map.type === 'error') {
            return map.error;
        }
        if (cmap.type === 'error') {
            return cmap.error;
        }
        // All cmap items must match the corresponding map item
        for (let key of Object.keys(cmap.map)) {
            const one = cmap.map[key];
            const two = map.map[key];
            if (!two) {
                if (exp.open) {
                    continue;
                }
                return inv(
                    {
                        type: 'tag',
                        name: key,
                        args: one.args,
                        form: one.form,
                    },
                    exp,
                    mc.exp.path.concat([key]),
                );
            }
            if (one.args.length !== two.args.length) {
                return {
                    type: 'enum args mismatch',
                    form: one.form, // TODO: multiform for errors
                    one: one.args,
                    two: two.args,
                    tag: key,
                    path: mc.can.path,
                };
            }
            for (let i = 0; i < one.args.length; i++) {
                const res = matchesTypeBetter(
                    cmap.map[key].args[i],
                    map.map[key].args[i],
                    bothPath(mc, key),
                    // ctx,
                    // path.concat([key]),
                    // typeArgs,
                );
                if (res !== true) {
                    return res;
                }
            }
        }
        return true;
    },

    record(can: T<'record'>, exp: T<'record'>, mc: MC): R {
        const map = recordMap(exp, mc.ctx);
        const cmap = recordMap(can, mc.ctx);
        for (const entry of exp.entries) {
            if (cmap[entry.name]) {
                const result = matchesTypeBetter(
                    cmap[entry.name].value,
                    entry.value,
                    bothPath(mc, entry.name),
                );
                if (result !== true) {
                    return result;
                }
            } else {
                return inv(can, exp, mc.exp.path.concat([entry.name]));
            }
        }
        if (!exp.open) {
            for (const entry of can.entries) {
                if (!map[entry.name]) {
                    return inv(can, exp, mc.can.path.concat([entry.name]));
                }
            }
        }
        return true;
    },

    task(can: T<'task'>, exp: T<'task'>, mc: MC): R {
        // should we just expand, if needed?

        // const ct = asTaskType(can, mc.ctx);
        // const et = asTaskType(exp, mc.ctx);
        // if (ct.type === 'error') {
        //     return ct.error
        // }
        // if (et.type === 'error') {
        //     return et.error
        // }

        // WAIT we can just
        const effects = matchesTypeBetter(
            can.effects,
            exp.effects,
            bothPath(mc, 'effects'),
        );
        if (effects !== true) {
            return effects;
        }
        const ret = matchesTypeBetter(
            can.result,
            exp.result,
            bothPath(mc, 'result'),
        );
        if (ret !== true) {
            return ret;
        }

        // OKKK but HOW does extra stuff fit in?
        // should add test cases really
        return true;
    },

    task_union(can: T<'task'>, exp: T<'union'>, mc: MC): R {
        const tt = asTaskType(can, mc.ctx);
        if (tt.type === 'error') {
            return tt.error;
        }
        const cex = expandTask(tt, can.form, mc.ctx);
        if (cex.type === 'error') {
            return cex.error;
        }
        return matchMap.union(cex, exp, canPath(mc, '<expand>'));
    },

    union_task(can: T<'union'>, exp: T<'task'>, mc: MC): R {
        const tt = asTaskType(exp, mc.ctx);
        if (tt.type === 'error') {
            return tt.error;
        }
        const cex = expandTask(tt, exp.form, mc.ctx);
        if (cex.type === 'error') {
            return cex.error;
        }
        return matchMap.union(can, cex, expPath(mc, '<expand>'));
    },

    task_tag(can: T<'task'>, exp: T<'tag'>, mc: MC): R {
        return matchMap.task_union(
            can,
            { type: 'union', items: [exp], form: can.form, open: false },
            mc,
        );
    },
    tag_task(can: T<'tag'>, exp: T<'task'>, mc: MC): R {
        return matchMap.union_task(
            { type: 'union', items: [can], form: can.form, open: false },
            exp,
            mc,
        );
    },
};

const cmpArgs = (can: Type[], exp: Type[], mc: MC, form: Node): R => {
    if (can.length !== exp.length) {
        return {
            type: 'misc',
            message: `different number of args, ${can.length} vs ${exp.length}`,
            form: form,
            path: mc.can.path,
        };
    }
    for (let i = 0; i < can.length; i++) {
        const ca = can[i];
        const ea = exp[i];
        const res = matchesTypeBetter(ca, ea, bothPath(mc, `arg_${i}`));
        if (res !== true) {
            return res;
        }
    }
    return true;
};
