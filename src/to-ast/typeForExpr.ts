import { Node } from '../types/cst';
import { Expr, TRecord, Type } from '../types/ast';
import { Ctx, blank, nilt } from './to-ast';
import { Report } from '../get-type/get-types-new';
import { Error } from '../types/types';
import { applyAndResolve } from '../get-type/matchesType';

export const typeForExpr_deprecated = (value: Expr, ctx: Ctx): Type => {
    switch (value.type) {
        case 'if': {
            return unifyTypes(
                typeForExpr_deprecated(value.yes, ctx),
                typeForExpr_deprecated(value.no, ctx),
                ctx,
                value.form,
            );
        }
        case 'bool':
            return { type: 'builtin', name: 'bool', form: blank };
        case 'number': {
            return { type: 'builtin', name: value.kind, form: blank };
        }
        case 'builtin':
            return (
                ctx.global.builtins.terms[value.hash] ?? {
                    type: 'unresolved',
                    form: value.form,
                    reason: 'unknown builtin ' + value.hash,
                }
            );
        case 'tag':
            return {
                type: 'tag',
                name: value.name,
                args: [],
                form: value.form,
            };
        case 'apply': {
            if (value.target.type === 'tag') {
                return {
                    type: 'tag',
                    name: value.target.name,
                    args: value.args.map((arg) =>
                        typeForExpr_deprecated(arg, ctx),
                    ),
                    form: value.form,
                };
            }
            const inner = typeForExpr_deprecated(value.target, ctx);
            if (inner.type === 'fn') {
                return inner.body;
            }
            return {
                type: 'unresolved',
                form: value.form,
                reason: 'apply a non-function',
            };
        }
        case 'def': {
            return nilt;
        }
        case 'fn': {
            return {
                type: 'fn',
                args: value.args.map((arg) => arg.type ?? nilt),
                body: value.body.length
                    ? typeForExpr_deprecated(
                          value.body[value.body.length - 1],
                          ctx,
                      )
                    : nilt,
                form: value.form,
            };
        }
        case 'record': {
            return {
                type: 'record',
                entries: value.entries.map((entry) => ({
                    name: entry.name,
                    value: typeForExpr_deprecated(entry.value, ctx),
                })),
                form: value.form,
                open: false,
            };
        }
        case 'attribute': {
            const inner = typeForExpr_deprecated(value.target, ctx);
            const resolved = applyAndResolve(inner, ctx, []);
            if (resolved.type === 'error') {
                return {
                    type: 'unresolved',
                    form: value.form,
                    reason: 'error resolving inner',
                };
            }
            if (resolved.type === 'local-bound') {
                if (resolved.bound) {
                    if (resolved.bound.type !== 'record') {
                        return {
                            type: 'unresolved',
                            form: value.form,
                            reason: 'local bound not a record',
                        };
                    }
                    const map = recordMap(resolved.bound);
                    if (!map[value.attr]) {
                        return {
                            type: 'unresolved',
                            form: value.form,
                            reason:
                                'local bound record has no attr ' + value.attr,
                        };
                    }
                    return map[value.attr].value;
                } else {
                    return {
                        type: 'unresolved',
                        form: value.form,
                        reason: 'local with no type bound',
                    };
                }
            }
            if (resolved.type === 'record') {
                const map = recordMap(resolved);
                if (!map[value.attr]) {
                    return {
                        type: 'unresolved',
                        form: value.form,
                        reason: 'local bound record has no attr ' + value.attr,
                    };
                }
                return map[value.attr].value;
            }
            return {
                type: 'unresolved',
                form: value.form,
                reason: 'type not a record',
            };
        }
    }
    return {
        type: 'unresolved',
        form: value.form,
        reason: 'typeForExpr not impl ' + value.type,
    };
};

export type RecordMap = { [key: string]: TRecord['entries'][0] };
export const recordMap = (record: TRecord) => {
    const map: RecordMap = {};
    record.entries.forEach((entry) => {
        map[entry.name] = entry;
    });
    return map;
};

export const unifyMaps = (one: RecordMap, two: RecordMap, ctx: Ctx) => {
    const res: RecordMap = {};
    for (let key of Object.keys(one)) {
        if (!two[key]) return false;
        const unified = unifyTypes(one[key].value, two[key].value, ctx, blank);
        if (unified.type === 'unresolved') {
            return false;
        }
        // We're dropping defaults here on purpose
        res[key] = { name: key, value: unified };
    }
    for (let key of Object.keys(two)) {
        if (!one[key]) return false;
    }
    return res;
};

export const unifyTypes = (
    one: Type,
    two: Type,
    ctx: Ctx,
    form: Node,
): Type => {
    if (one.type === 'builtin' && two.type === 'builtin') {
        return one.name === two.name
            ? { ...one, form }
            : {
                  type: 'unresolved',
                  reason: 'incompatible builtins',
                  form,
              };
    }
    if (one.type === 'number' && two.type === 'number') {
        return one.kind === two.kind
            ? one.value === two.value
                ? { ...one, form }
                : {
                      type: 'builtin',
                      name: one.kind,
                      form,
                  }
            : {
                  type: 'unresolved',
                  reason: `incompatible number types ${one.kind} vs ${two.kind}`,
                  form,
              };
    }
    if (one.type === 'record' && two.type === 'record') {
        const onem = recordMap(one);
        const twom = recordMap(two);
        const unified = unifyMaps(onem, twom, ctx);
        if (!unified) {
            return {
                type: 'unresolved',
                reason: 'unable to unify records',
                form,
            };
        }
        return {
            type: 'record',
            entries: Object.values(unified),
            open: false,
            form,
        };
    }
    return {
        type: 'unresolved',
        reason: 'incompatible builtins',
        form,
    };
};
