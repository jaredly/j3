import { blank, Ctx } from '../to-ast/to-ast';
import { Node, Type } from './ast';
import { Error, MatchError } from './types';
import { errf, Report } from './get-types-new';
import { transformType } from './walk-ast';
import { unifyTypes, _unifyTypes } from './unifyTypes';

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
    const ca = applyAndResolve(candidate, ctx, path);
    const ce = applyAndResolve(expected, ctx, path);
    if (ca === candidate && ce === expected) {
        return first;
    }
    if (ca.type === 'error') {
        return ca.error;
    }
    if (ce.type === 'error') {
        return ce.error;
    }
    if (ca.type === 'local-bound' || ce.type === 'local-bound') {
        return { type: 'cannot apply local', path };
    }
    return _matchesType(ca, ce, ctx, path);
};

export const _matchesType = (
    candidate: Type,
    expected: Type,
    ctx: Ctx,
    path: string[],
): MatchError | true => {
    switch (candidate.type) {
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
        case 'builtin':
            return (
                (expected.type === 'builtin' &&
                    candidate.name === expected.name) ||
                inv(candidate, expected, path)
            );
        case 'tag':
            if (expected.type === 'tag') {
                console.error('got here', expected, candidate);
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
                let best: null | MatchError = null;
                for (let i = 0; i < expected.items.length; i++) {
                    const res = _matchOrExpand(
                        candidate,
                        expected.items[i],
                        ctx,
                        path.concat([i.toString()]),
                    );
                    if (res === true) {
                        return true;
                    }
                    if (!best || res.path.length > best.path.length) {
                        best = res;
                    }
                }
                return best || inv(candidate, expected, path);
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
        }
    }
    return inv(candidate, expected, path);
};

export const applyAndResolve = (
    type: Type,
    ctx: Ctx,
    path: string[],
):
    | Type
    | { type: 'error'; error: MatchError }
    | { type: 'local-bound'; bound?: Type } => {
    if (type.type === 'global') {
        return ctx.global.types[type.hash];
    }
    // TODO locals
    if (type.type === 'local') {
        return { type: 'local-bound' }; // todo track bounds
    }
    if (type.type === 'apply') {
        const inner = applyAndResolve(
            type.target,
            ctx,
            path.concat(['target']),
        );
        if (inner.type === 'error') {
            return inner;
        }
        if (inner.type === 'local-bound') {
            return {
                type: 'error',
                error: {
                    type: 'cannot apply local',
                    path,
                },
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
            map[inner.args[i].sym] = type.args[i];
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
    const map: { [key: string]: { args: Type[]; form: Node } } = {};
    items.forEach((item, i) => {
        if (item.type === 'global') {
            item = ctx.global.types[item.hash];
        }
        if (item.type === 'local') {
            throw new Error(`need something else to expand local types`);
        }
        if (item.type === 'tag') {
            if (map[item.name]) {
                throw new Error('not impl unify tag bodies');
            }
            map[item.name] = { args: item.args, form: item.form };
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
                    if (map[tag].args.length !== args.length) {
                        return {
                            type: 'error',
                            error: {
                                type: 'enum args mismatch',
                                form,
                                one: map[tag],
                                two: args,
                                tag,
                                path: path.concat([tag]),
                            },
                        };
                    }

                    const unified: Type[] = [];
                    for (let i = 0; i < args.length; i++) {
                        const un = _unifyTypes(
                            map[tag].args[i],
                            args[i],
                            ctx,
                            path,
                        );
                        if (un.type === 'error') {
                            return un;
                        }
                        unified.push(un);
                    }

                    map[tag] = { args: unified, form: map[tag].form };
                } else {
                    map[tag] = { args, form };
                }
            }
        }
    });
    return { type: 'success', map };
};
