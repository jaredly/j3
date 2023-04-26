import { Ctx } from '../to-ast/Ctx';
import { CstCtx } from '../to-ast/library';
import { Type } from '../types/ast';
import { Error } from '../types/types';
import { applyAndResolve, inv } from './matchesType';

export const subtractType = (
    outerR: Type,
    inner: Type,
    ctx: CstCtx,
): Type | { type: 'error'; error: Error } => {
    const applied = applyAndResolve(outerR, ctx, []);
    if (applied.type === 'error') {
        return applied;
    }
    // if (applied.type === 'local-bound') {
    //     return {
    //         type: 'error',
    //         error: { type: 'cannot apply local', form: outerR.form, path: [] },
    //     };
    // }
    const outer = applied;
    if (inner.type === 'any' || outer.type === 'none') {
        return { type: 'none', form: outer.form };
    }
    if (inner.type === 'bool') {
        return outer.type === 'bool'
            ? { type: 'none', form: outer.form }
            : { type: 'error', error: inv(inner, outer, []) };
    }
    if (inner.type === 'number') {
        return outer.type === 'number' && inner.kind === outer.kind
            ? { type: 'none', form: outer.form }
            : {
                  type: 'error',
                  error: inv(inner, outer, []),
              };
    }
    if (inner.type === 'tag' && outer.type === 'tag') {
        if (
            inner.name !== outer.name ||
            inner.args.length !== outer.args.length
        ) {
            return { type: 'error', error: inv(inner, outer, []) };
        }
        const args = inner.args.map((arg, i) =>
            subtractType(outer.args[i], arg, ctx),
        );
        if (args.some((arg) => arg.type === 'error')) {
            return { type: 'error', error: inv(inner, outer, []) };
        }
        if (args.every((arg) => arg!.type === 'none')) {
            return { type: 'none', form: outer.form };
        }
        return {
            type: 'tag',
            name: inner.name,
            args: args as Type[],
            form: outer.form,
        };
    }
    if (inner.type === 'tag' && outer.type === 'union') {
        const items = outer.items
            .map((item) =>
                item.type === 'tag' && item.name === inner.name
                    ? subtractType(item, inner, ctx)
                    : item,
            )
            .filter((item) => item?.type !== 'none');
        if (items.some((item) => item.type === 'error')) {
            return { type: 'error', error: inv(inner, outer, []) };
        }
        if (!items.length) {
            return { type: 'none', form: outer.form };
        }
        return {
            type: 'union',
            items: items as Type[],
            open: outer.open,
            form: outer.form,
        };
    }
    return { type: 'error', error: inv(inner, outer, []) };
};
