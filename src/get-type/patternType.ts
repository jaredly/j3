import { blank, none } from '../to-ast/builtins';
import { Ctx } from '../to-ast/library';
import { err } from '../to-ast/nodeToPattern';
import { Pattern, Type } from '../types/ast';
import { _unifyTypes, unifyTypes } from './unifyTypes';

export const arrayType = (item: Type): Type => ({
    type: 'apply',
    target: { type: 'builtin', form: item.form, name: 'array' },
    args: [item],
    form: item.form,
});

export const unifyManyTypes = (types: Type[], ctx: Ctx): Type => {
    if (!types.length) {
        return none;
    }
    let res = types[0];
    for (let i = 1; i < types.length; i++) {
        const un = _unifyTypes(res, types[i], ctx, []);
        if (un.type === 'error') {
            err(ctx.results.errors, types[i].form, un.error);
        } else {
            res = un;
        }
    }
    return res;
};

export const patternType = (pattern: Pattern, ctx: Ctx): Type => {
    switch (pattern.type) {
        case 'number':
        case 'bool':
            return pattern;
        case 'array':
            return unifyManyTypes(
                [
                    ...pattern.left.map((i) => patternType(i, ctx)),
                    ...(pattern.right
                        ? pattern.right.items.map((p) => patternType(p, ctx))
                        : []),
                ],
                ctx,
            );
        case 'local':
            return { type: 'any', form: pattern.form };
        case 'tag':
            return {
                type: 'tag',
                name: pattern.name,
                args: pattern.args.map((p) => patternType(p, ctx)),
                form: pattern.form,
            };
        case 'unresolved':
            return pattern;
        case 'record':
            return {
                type: 'record',
                form: pattern.form,
                open: true,
                spreads: [],
                entries: pattern.entries.map((entry) => ({
                    name: entry.name,
                    value: patternType(entry.value, ctx),
                })),
            };
    }
};
