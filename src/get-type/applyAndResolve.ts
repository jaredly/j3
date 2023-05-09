import { any, nil, nilt } from '../to-ast/Ctx';
import { Ctx, globalType } from '../to-ast/library';
import { Local, Node, Type } from '../types/ast';
import { MatchError } from '../types/types';
import { transformType } from '../types/walk-ast';
import { _unifyTypes } from './unifyTypes';
import { TypeArgs, _matchOrExpand } from './matchesType';
import { asTaskType } from './asTaskType';
import { expandTask } from './expandTask';

export const applyAndResolve = (
    type: Type,
    ctx: Ctx,
    path: string[],
    expandLoops?: boolean,
    typeArgs?: TypeArgs,
): Type | { type: 'error'; error: MatchError } => {
    if (type.type === 'task') {
        const tt = asTaskType(type, ctx);
        if (tt.type === 'task') {
            return expandTask(tt, type.form);
        }
    }
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
    if (type.type === 'local') {
        const found = ctx.results.localMap.types[type.sym];
        if (!found) {
            return {
                type: 'error',
                error: {
                    type: 'misc',
                    message: 'unresolved local',
                    path,
                    form: type.form,
                },
            };
        }
        return found.bound ?? any;
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
            typeArgs,
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
                        typeArgs,
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
                console.error('the arg', type.args[i]);
                console.error('the bound', inner.args[i].bound);
                const res = _matchOrExpand(
                    type.args[i],
                    inner.args[i].bound!,
                    ctx,
                    path.concat([i.toString()]),
                    typeArgs,
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
    | {
          type: 'success';
          map: { [key: string]: { args: Type[]; form: Node } };
          locals: Local[];
      }
    | { type: 'error'; error: MatchError } => {
    const map: EnumMap = {};
    const locals: Local[] = [];
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
            // throw new Error(`need something else to expand local types`);
            locals.push(item);
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
    return { type: 'success', map, locals };
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
