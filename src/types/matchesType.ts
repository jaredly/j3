import { blank, Ctx } from '../to-ast/to-ast';
import { Node, Type } from './ast';
import { Error, MatchError } from './types';
import { errf, Report } from './get-types-new';

export const matchesType = (
    candidate: Type,
    expected: Type,
    ctx: Ctx,
    form: Node,
    report?: Report,
): boolean => {
    const result = _matchesType(candidate, expected, ctx, []);
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

export const _matchesType = (
    candidate: Type,
    expected: Type,
    ctx: Ctx,
    path: string[],
): MatchError | true => {
    // TODO: a @macro type? prolly
    switch (candidate.type) {
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
                    const res = _matchesType(
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
                    const res = _matchesType(
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
            return inv(candidate, expected, path)
        case 'union': {
            if (expected.type === 'tag') {
                for (let i=0; i<candidate.items.length; i++) {
                    const res = _matchesType(
                        candidate.items[i],
                        expected,
                        ctx,
                        path.concat([i.toString()]),
                    );
                    if (res !== true) {
                        return res
                    }
                }
                return true
            }
            if (expected.type === 'union') {
                const map = {}
                expandEnumItems(expected.items, ctx).forEach((item, i) => {
                    map[]
                })
            }
        }
    }
    return inv(candidate, expected, path);
};

export const applyAndResolve = (type: Type, ctx: Ctx, path: string[]): Type | {type: 'error', error: Error} | {type: 'local-bound', bound?: Type} => {
    if (type.type === 'global') {
        return ctx.global.types[type.hash];
    }
    // TODO locals
    if (type.type === 'local') {
        return {type: 'local-bound'} // todo track bounds
    }
    if (type.type === 'apply') {
        const inner = applyAndResolve(type.target, ctx, path.concat(['target']))
        if (inner.type === 'error') {
            return inner
        }
        if (inner.type === 'local-bound') {
            return {type: 'error', error:{
                type: 'misc',
                message: 'local bound, etc.'
            }}
        }
        if (inner.type !== 'fn') {
            return {type: 'error', error: {
                type: 'not a function',
                args: type.args,
                form: type.form,
                path,
            }}
        }
        if (inner.args.length !== type.args.length) {
            return {type: 'error', error: {
                type: 'wrong number of arguments',
                expected: inner.args.length,
                received: type.args.length,
                form: type.form,
                path,
            }}
        }
    }
}

export const expandEnumItems = (
    items: Type[],
    ctx: Ctx,
): {[key: string]: Type[]} => {
    const map: {[key: string]: Type[]} = {}
    items.forEach(item => {
        if (item.type === 'global') {
            item = ctx.global.types[item.hash]
        }
        if (item.type === 'local') {
            throw new Error(`need something else to expand local types`)
        }
        if (item.type === 'tag') {
            if (map[item.name]) {
                throw new Error('not impl unify tag bodies')
            }
            map[item.name] = item.args
        }
        if (item.type === 'union') {
            Object.entries(expandEnumItems(item.items, ctx)).forEach(([key, args]) => {
                if(map[key]) {
                    throw new Error('dupl tag bodies')
                }
                map[key] = args
            })
        }
    })
    return map
}
