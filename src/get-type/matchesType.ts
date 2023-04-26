import { blank, nil, nilt } from '../to-ast/Ctx';
import { Node, Type } from '../types/ast';
import { MatchError } from '../types/types';
import { errf, recordMap, Report } from './get-types-new';
import { transformType } from '../types/walk-ast';
import { unifyTypes, _unifyTypes } from './unifyTypes';
import { CompilationResults, Env, Ctx, globalType } from '../to-ast/library';

export const matchesType = (
    candidate: Type,
    expected: Type,
    ctx: Ctx,
    form: Node,
    report?: Report,
): boolean => {
    const result = _matchOrExpand(candidate, expected, ctx, []);
    if (result !== true) {
        if (report) {
            errf(report, form, result);
        }
        return false;
    }
    return true;
};

export const inv = (
    candidate: Type,
    expected: Type,
    path: string[],
): MatchError => ({
    type: 'invalid type',
    expected,
    found: candidate,
    form: blank,
    path,
});

export const isLoopy = (t: Type): boolean => {
    return (
        t.type === 'loop' ||
        t.type === 'recur' ||
        (t.type === 'apply' && isLoopy(t.target))
    );
};

export const _matchOrExpand = (
    candidate: Type,
    expected: Type,
    ctx: Ctx,
    path: string[],
): MatchError | true => {
    const first = _matchesType(candidate, expected, ctx, path);
    if (first === true) {
        return true;
    }
    const isLoopRelated =
        first.type === 'invalid type' &&
        (isLoopy(first.expected) || isLoopy(first.found));
    let ca = applyAndResolve(candidate, ctx, path, isLoopRelated);
    let ce = applyAndResolve(expected, ctx, path, isLoopRelated);
    if (ca === candidate && ce === expected) {
        return first;
    }
    if (ca.type === 'error') {
        return ca.error;
    }
    if (ce.type === 'error') {
        return ce.error;
    }
    // if (ca.type === 'local-bound') {
    //     ca = candidate;
    // }
    // if (ce.type === 'local-bound') {
    //     ce = expected;
    // }
    // if (ca.type === 'local-bound' || ce.type === 'local-bound') {
    //     return { type: 'cannot apply local', path, form: candidate.form };
    // }
    return _matchesType(ca, ce, ctx, path);
};

export const _matchesType = (
    candidate: Type,
    expected: Type,
    ctx: Ctx,
    path: string[],
): MatchError | true => {
    if (path.length > 100) {
        throw new Error(`Deep recursion? Path length over 100`);
    }
    switch (candidate.type) {
        case 'string':
            if (expected.type === 'builtin' && expected.name === 'string') {
                return true;
            }
            if (expected.type === 'string') {
                if (expected.templates.length === candidate.templates.length) {
                    if (
                        expected.first.text === candidate.first.text &&
                        expected.templates.every(
                            (ex, i) =>
                                ex.suffix.text ===
                                    candidate.templates[i].suffix.text &&
                                _matchesType(
                                    candidate.templates[i].type,
                                    ex.type,
                                    ctx,
                                    path.concat([i + '']),
                                ) === true,
                        )
                    ) {
                        return true;
                    }
                }
            }
            return inv(candidate, expected, path);
        case 'local':
            if (expected.type === 'local') {
                return expected.sym === candidate.sym
                    ? true
                    : inv(candidate, expected, path);
            }
            return inv(candidate, expected, path);
        case 'recur':
            return expected.type === 'recur' || inv(candidate, expected, path);
        case 'loop':
            // TODO:
            // So ... we could get into the infinite propagation issue
            // any time we have a looped type
            // right? because I always blindly re-expand
            // if we can.
            // when instead, I should probably only expand if we get to
            // a loop. Right?
            return expected.type === 'loop'
                ? _matchOrExpand(
                      candidate.inner,
                      expected.inner,
                      ctx,
                      path.concat(['loop']),
                  )
                : inv(candidate, expected, path);
        case 'record': {
            if (expected.type === 'record') {
                const map = recordMap(expected, ctx);
                const cmap = recordMap(candidate, ctx);
                for (const entry of expected.entries) {
                    if (cmap[entry.name]) {
                        const result = _matchOrExpand(
                            cmap[entry.name].value,
                            entry.value,
                            ctx,
                            path,
                        );
                        if (result !== true) {
                            return result;
                        }
                    } else {
                        return inv(
                            candidate,
                            expected,
                            path.concat([entry.name]),
                        );
                    }
                }
                if (!expected.open) {
                    for (const entry of candidate.entries) {
                        if (!map[entry.name]) {
                            return inv(
                                candidate,
                                expected,
                                path.concat([entry.name]),
                            );
                        }
                    }
                }
                return true;
            }
            return inv(candidate, expected, path);
        }
        case 'toplevel': {
            if (
                expected.type === 'toplevel' &&
                candidate.hash === expected.hash
            ) {
                return true;
            }
            return inv(candidate, expected, path);
        }
        case 'global': {
            if (
                expected.type === 'global' &&
                candidate.hash === expected.hash
            ) {
                return true;
            }
            return inv(candidate, expected, path);
        }
        case 'number': {
            if (expected.type === 'number') {
                return candidate.type === expected.type &&
                    candidate.value === expected.value
                    ? true
                    : inv(candidate, expected, path);
            } else if (expected.type === 'builtin') {
                return (
                    expected.name === candidate.kind ||
                    inv(candidate, expected, path)
                );
            }
            return inv(candidate, expected, path);
        }
        case 'bool': {
            if (expected.type === 'bool') {
                return (
                    candidate.value === expected.value ||
                    inv(candidate, expected, path)
                );
            } else if (expected.type === 'builtin') {
                return (
                    expected.name === 'bool' || inv(candidate, expected, path)
                );
            }
            return inv(candidate, expected, path);
        }
        case 'apply':
            if (expected.type === 'apply') {
                const target = _matchOrExpand(
                    candidate.target,
                    expected.target,
                    ctx,
                    path.concat('target'),
                );
                if (target !== true) {
                    return target;
                }
                if (candidate.args.length !== expected.args.length) {
                    return {
                        type: 'wrong number of arguments',
                        expected: expected.args.length,
                        received: candidate.args.length,
                        form: candidate.form,
                        path,
                    };
                }
                for (let i = 0; i < candidate.args.length; i++) {
                    const can = candidate.args[i];
                    const exp = expected.args[i];
                    const res = _matchOrExpand(
                        can,
                        exp,
                        ctx,
                        path.concat([i + '']),
                    );
                    if (res !== true) {
                        return res;
                    }
                }
                return true;
            } else {
                return inv(candidate, expected, path);
            }
        case 'builtin':
            return (
                (expected.type === 'builtin' &&
                    candidate.name === expected.name) ||
                inv(candidate, expected, path)
            );
        case 'tag':
            if (expected.type === 'tag') {
                if (
                    expected.name !== candidate.name ||
                    expected.args.length !== candidate.args.length
                ) {
                    return inv(candidate, expected, path);
                }
                for (let i = 0; i < expected.args.length; i++) {
                    const res = _matchOrExpand(
                        candidate.args[i],
                        expected.args[i],
                        ctx,
                        path.concat([i.toString()]),
                    );
                    if (res !== true) {
                        return res;
                    }
                }
                return true;
            }
            if (expected.type === 'union') {
                const whats = expandEnumItems(expected.items, ctx, path);
                if (whats.type === 'error') {
                    return whats.error;
                }
                if (!whats.map[candidate.name]) {
                    // TODO: report that its missing
                    return inv(candidate, expected, path);
                }
                const args = whats.map[candidate.name].args;
                for (let i = 0; i < args.length; i++) {
                    if (i >= candidate.args.length) {
                        return inv(candidate, expected, path);
                    }
                    const res = _matchOrExpand(
                        candidate.args[i],
                        args[i],
                        ctx,
                        path.concat([i.toString()]),
                    );
                    if (res !== true) {
                        return res;
                    }
                }

                return true;
            }
            return inv(candidate, expected, path);
        case 'union': {
            if (expected.type === 'tag') {
                for (let i = 0; i < candidate.items.length; i++) {
                    const res = _matchOrExpand(
                        candidate.items[i],
                        expected,
                        ctx,
                        path.concat([i.toString()]),
                    );
                    if (res !== true) {
                        return res;
                    }
                }
                return true;
            }
            if (expected.type === 'union') {
                const map = expandEnumItems(expected.items, ctx, path);
                const cmap = expandEnumItems(candidate.items, ctx, path);
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
                        return inv(
                            {
                                type: 'tag',
                                name: key,
                                args: one.args,
                                form: one.form,
                            },
                            expected,
                            path.concat([key]),
                        );
                    }
                    if (one.args.length !== two.args.length) {
                        return {
                            type: 'enum args mismatch',
                            form: one.form, // TODO: multiform for errors
                            one: one.args,
                            two: two.args,
                            tag: key,
                            path,
                        };
                    }
                    for (let i = 0; i < one.args.length; i++) {
                        const res = _matchOrExpand(
                            cmap.map[key].args[i],
                            map.map[key].args[i],
                            ctx,
                            path.concat([key]),
                        );
                        if (res !== true) {
                            return res;
                        }
                    }
                }
                return true;
            }
            return inv(candidate, expected, path);
        }
        case 'fn': {
            if (expected.type !== 'fn') {
                return inv(candidate, expected, path);
            }
            if (candidate.args.length !== expected.args.length) {
                return inv(candidate, expected, path);
            }
            for (let i = 0; i < candidate.args.length; i++) {
                const can = candidate.args[i];
                const exp = expected.args[i];
                // TODO: I think this needs to be reversed?
                const res = _matchOrExpand(
                    can.type,
                    exp.type,
                    ctx,
                    path.concat([i.toString()]),
                );
                if (res !== true) {
                    return res;
                }
            }
            return _matchOrExpand(
                candidate.body,
                expected.body,
                ctx,
                path.concat(['body']),
            );
        }
    }
    return inv(candidate, expected, path);
    // return {
    //     type: 'unification',
    //     one: expected,
    //     two: candidate,
    //     form: blank,
    //     path,
    // };
};

export const applyAndResolve = (
    type: Type,
    ctx: Ctx,
    path: string[],
    expandLoops?: boolean,
): Type | { type: 'error'; error: MatchError } => {
    if (type.type === 'loop' && expandLoops) {
        return transformType(
            type.inner,
            {
                Type(node, ctx) {
                    if (ctx.inside) {
                        return false;
                    }
                    if (node.type === 'loop') {
                        return false;
                    }
                    if (node.type === 'recur') {
                        if (node.sym === type.form.loc) {
                            return [type, { inside: true }];
                        } else {
                            console.log('BAD RECUR?');
                        }
                    }
                    return null;
                },
            },
            { inside: false },
        );
    }
    if (type.type === 'global') {
        const defn = ctx.global.library.definitions[type.hash];
        return defn?.type === 'type'
            ? defn.value
            : {
                  type: 'error',
                  error: {
                      type: 'misc',
                      message: 'missing global',
                      form: type.form,
                      path,
                  },
              };
    }
    if (type.type === 'toplevel') {
        const defn = ctx.results.toplevel[type.hash];
        return defn?.type === 'deftype'
            ? defn.value
            : {
                  type: 'error',
                  error: {
                      type: 'misc',
                      message: 'missing toplevel',
                      form: type.form,
                      path,
                  },
              };
    }
    // if (type.type === 'local') {
    //     return { type: 'local-bound' }; // todo track bounds
    // }
    if (type.type === 'apply') {
        const inner = applyAndResolve(
            type.target,
            ctx,
            path.concat(['target']),
            expandLoops,
        );
        if (inner.type === 'error') {
            return inner;
        }
        if (inner.type === 'local') {
            return {
                type: 'error',
                error: {
                    type: 'cannot apply local',
                    path,
                    form: type.target.form,
                },
            };
        }
        if (inner.type === 'builtin') {
            // TODO: Check to see if the number of arguments is correct
            // ALSO here's where we can fill in default arguments.
            const bin = ctx.global.builtins[inner.name];
            if (bin?.type !== 'type') {
                return {
                    type: 'error',
                    error: {
                        type: 'misc',
                        message: 'unknown builtin',
                        form: type.target.form,
                        path,
                    },
                };
            }
            const args = bin.args;
            if (type.args.length > args.length) {
                return {
                    type: 'error',
                    error: {
                        type: 'wrong number of arguments',
                        expected: args.length,
                        received: type.args.length,
                        form: type.form,
                        path,
                    },
                };
            }
            let error: MatchError | null = null;
            const result = args.map((arg, i) => {
                if (i >= type.args.length) {
                    if (arg.default_) {
                        return arg.default_;
                    }
                    error = {
                        type: 'wrong number of arguments',
                        expected: args.length,
                        received: type.args.length,
                        form: type.form,
                        path,
                    };
                    return nilt;
                }
                if (arg.bound) {
                    const res = _matchOrExpand(
                        type.args[i],
                        arg.bound!,
                        ctx,
                        path.concat([i.toString()]),
                    );
                    if (res !== true) {
                        error = res;
                    }
                }
                return type.args[i];
            });
            if (error) {
                return { type: 'error', error };
            }
            return {
                ...type,
                target: inner,
                args: result,
            };
        }
        if (inner.type !== 'tfn') {
            return {
                type: 'error',
                error: {
                    type: 'not a function',
                    args: type.args,
                    kind: inner.type,
                    form: inner.form,
                    path,
                },
            };
        }
        if (inner.args.length !== type.args.length) {
            return {
                type: 'error',
                error: {
                    type: 'wrong number of arguments',
                    expected: inner.args.length,
                    received: type.args.length,
                    form: type.form,
                    path,
                },
            };
        }
        const map: { [key: number]: Type } = {};
        for (let i = 0; i < inner.args.length; i++) {
            if (inner.args[i].bound) {
                const res = _matchOrExpand(
                    type.args[i],
                    inner.args[i].bound!,
                    ctx,
                    path.concat([i.toString()]),
                );
                if (res !== true) {
                    return { type: 'error', error: res };
                }
            }
            map[inner.args[i].form.loc] = type.args[i];
        }
        return applyTypeVariables(inner.body, map);
    }
    return type;
};

export const applyTypeVariables = (
    type: Type,
    map: { [key: number]: Type },
): Type => {
    return transformType(
        type,
        {
            Type(node, map) {
                if (node.type === 'local') {
                    return map[node.sym] || node;
                }
                return null;
            },
        },
        map,
    );
};
export type EnumMap = {
    [key: string]: {
        args: Type[];
        form: Node;
    };
};

/**
 * Expand the items of an enum into a map.
 * TODO: indicate whether it's open???
 */
export const expandEnumItems = (
    items: Type[],
    ctx: Ctx,
    path: string[],
):
    | { type: 'success'; map: { [key: string]: { args: Type[]; form: Node } } }
    | { type: 'error'; error: MatchError } => {
    const map: EnumMap = {};
    for (let i = 0; i < items.length; i++) {
        let item = items[i];

        if (item.type === 'global') {
            const defn = globalType(ctx.global.library, item.hash);
            if (!defn) {
                return {
                    type: 'error',
                    error: {
                        type: 'misc',
                        message: 'unknown global',
                        path,
                        form: nil.form,
                    },
                };
            }
            item = defn.value;
        }
        if (item.type === 'local') {
            throw new Error(`need something else to expand local types`);
        }

        if (item.type === 'tag') {
            if (map[item.name]) {
                const err = unifyEnumArgs(
                    item.name,
                    item.args,
                    map,
                    item.form,
                    path,
                    ctx,
                );
                if (err) {
                    return { type: 'error', error: err };
                }
            } else {
                map[item.name] = { args: item.args, form: item.form };
            }
        }
        if (item.type === 'union') {
            const inner = expandEnumItems(
                item.items,
                ctx,
                path.concat([i.toString()]),
            );
            if (inner.type === 'error') {
                return inner;
            }
            for (let [tag, { args, form }] of Object.entries(inner.map)) {
                if (map[tag]) {
                    const err = unifyEnumArgs(tag, args, map, form, path, ctx);
                    if (err) {
                        return { type: 'error', error: err };
                    }
                } else {
                    map[tag] = { args, form };
                }
            }
        }
    }
    return { type: 'success', map };
};

export const unifyEnumArgs = (
    tag: string,
    args: Type[],
    map: EnumMap,
    form: Node,
    path: string[],
    ctx: Ctx,
): void | MatchError => {
    if (map[tag].args.length !== args.length) {
        return {
            type: 'enum args mismatch',
            form,
            one: map[tag].args,
            two: args,
            tag,
            path: path.concat([tag]),
        };
    }

    const unified: Type[] = [];
    for (let i = 0; i < args.length; i++) {
        const un = _unifyTypes(map[tag].args[i], args[i], ctx, path);
        if (un.type === 'error') {
            return un.error;
        }
        unified.push(un);
    }

    map[tag] = { args: unified, form: map[tag].form };
};
