import { Ctx } from '../to-ast/Ctx';
import { CstCtx } from '../to-ast/library';
import { Type } from '../types/ast';
import { applyAndResolve } from './matchesType';

export const subtractType = (
    outerR: Type,
    inner: Type,
    ctx: CstCtx,
): Type | null => {
    const applied = applyAndResolve(outerR, ctx.global, []);
    if (applied.type === 'error' || applied.type === 'local-bound') {
        return null;
    }
    const outer = applied;
    if (inner.type === 'any' || outer.type === 'none') {
        return { type: 'none', form: outer.form };
    }
    if (inner.type === 'bool') {
        return outer.type === 'bool'
            ? { type: 'none', form: outer.form }
            : null;
    }
    if (inner.type === 'number') {
        return outer.type === 'number' && inner.kind === outer.kind
            ? { type: 'none', form: outer.form }
            : null;
    }
    if (inner.type === 'tag' && outer.type === 'tag') {
        if (
            inner.name !== outer.name ||
            inner.args.length !== outer.args.length
        ) {
            return null;
        }
        const args = inner.args.map((arg, i) =>
            subtractType(outer.args[i], arg, ctx),
        );
        if (args.some((arg) => arg === null)) {
            return null;
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
        if (items.some((item) => item === null)) {
            return null;
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
    return null;
};
