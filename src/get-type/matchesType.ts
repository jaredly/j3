import { blank } from '../to-ast/Ctx';
import { CompilationResults, Ctx } from '../to-ast/library';
import { nodeForType } from '../to-cst/nodeForType';
import { nodeToString } from '../to-cst/nodeToString';
import { Node, Type } from '../types/ast';
import { MatchError } from '../types/types';
import { applyAndResolve, expandEnumItems } from './applyAndResolve';
import { Report, errf, recordMap } from './get-types-new';

export type TypeArgs = { [idx: number]: Type[] };

export const matchesType = (
    candidate: Type,
    expected: Type,
    ctx: Ctx,
    form: Node,
    report?: Report,
    typeArgs?: TypeArgs,
): boolean => {
    const result = _matchOrExpand(candidate, expected, ctx, [], typeArgs);
    if (result !== true) {
        if (report) {
            let err = result;
            if (
                err.type !== 'invalid type' ||
                err.found !== candidate ||
                err.expected !== expected
            ) {
                err = {
                    type: 'invalid type',
                    form,
                    found: candidate,
                    expected,
                    path: [],
                    inner: err,
                };
            }
            errf(report, form, err);
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
    typeArgs?: TypeArgs,
): MatchError | true => {
    const first = _matchesType(candidate, expected, ctx, path, typeArgs);
    if (first === true) {
        return true;
    }
    const isLoopRelated =
        first.type === 'invalid type' &&
        (isLoopy(first.expected) || isLoopy(first.found));
    let ca = applyAndResolve(candidate, ctx, path, isLoopRelated, typeArgs);
    let ce = applyAndResolve(expected, ctx, path, isLoopRelated, typeArgs);
    if (ca === candidate && ce === expected) {
        return first;
    }
    if (ca.type === 'error') {
        return ca.error;
    }
    if (ce.type === 'error') {
        return ce.error;
    }
    return _matchesType(ca, ce, ctx, path, typeArgs);
};

export const typeToString = (
    type: Type,
    hashNames: CompilationResults['hashNames'],
) => nodeToString(nodeForType(type, hashNames), hashNames);

export const _matchesType = (
    candidate: Type,
    expected: Type,
    ctx: Ctx,
    path: string[],
    typeArgs?: TypeArgs,
): MatchError | true => {
    // console.log(
    //     `Matches`,
    //     typeToString(candidate, ctx.results.hashNames),
    //     typeToString(expected, ctx.results.hashNames),
    // );
    if (path.length > 100) {
        throw new Error(`Deep recursion? Path length over 100`);
    }
    if (expected.type === 'local' && typeArgs) {
        if (typeArgs[expected.sym] != null) {
            typeArgs[expected.sym].push(candidate);
            return true;
        }
    }
    if (candidate.type === 'none') {
        return true;
    }
    if (expected.type === 'none') {
        return inv(candidate, expected, path);
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
                                    typeArgs,
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
        case 'task': {
            // So here we do like type matches stuff
            if (expected.type === 'task') {
                const effmatch = _matchOrExpand(
                    candidate.effects,
                    expected.effects,
                    ctx,
                    path.concat(['effects']),
                );
                if (effmatch !== true) {
                    return effmatch;
                }
                const retmatch = _matchOrExpand(
                    candidate.result,
                    expected.result,
                    ctx,
                    path.concat(['result']),
                );
                if (retmatch !== true) {
                    return retmatch;
                }
                // candidate.extra
                // if (candidate.)
                return true;
            }
            return inv(candidate, expected, path);
        }
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
                      typeArgs,
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
                            typeArgs,
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
                return candidate.kind === expected.kind &&
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
                    typeArgs,
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
                        typeArgs,
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
                        typeArgs,
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
                        typeArgs,
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
                        typeArgs,
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
                        if (expected.open) {
                            continue;
                        }
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
                            typeArgs,
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
                    typeArgs,
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
                typeArgs,
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
