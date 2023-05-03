import { nilt } from '../to-ast/Ctx';
import { RecordMap, recordMap } from './get-types-new';
import { Node, Type } from '../types/ast';
import { Error, MatchError } from '../types/types';
import { Report } from './get-types-new';
import {
    applyAndResolve,
    expandEnumItems,
    unifyEnumArgs,
} from './applyAndResolve';
import { Ctx, Env } from '../to-ast/library';

export const unifyTypes = (
    one: Type,
    two: Type,
    ctx: Ctx,
    form: Node,
    report?: Report,
): Type | void => {
    const unified = _unifyTypes(one, two, ctx, []);
    if (unified.type === 'error') {
        if (report) {
            if (!report.errors[form.loc]) {
                report.errors[form.loc] = [];
            }
            report.errors[form.loc].push(unified.error);
        }
        return;
    }
    return { ...unified, form };
};

export const une = (
    path: string[],
    one: Type,
    two: Type,
): { type: 'error'; error: MatchError } => ({
    type: 'error',
    error: { type: 'unification', path, one, two, form: one.form },
});

export const _unifyTypes = (
    one: Type,
    two: Type,
    ctx: Ctx,
    path: string[],
): Type | { type: 'error'; error: MatchError } => {
    if (one.type === 'builtin' && two.type === 'builtin') {
        return one.name === two.name ? one : une(path, one, two);
    }

    // TODO: If the bounds are unions and compatible
    if (one.type === 'local' && two.type === 'local') {
        return one.sym === two.sym ? one : une(path, one, two);
    }

    if (one.type === 'global' && two.type === 'global') {
        if (one.hash === two.hash) {
            return one;
        }
        const oa = applyAndResolve(one, ctx, []);
        const ta = applyAndResolve(two, ctx, []);
        if (oa.type === 'error') {
            return une(path, one, two);
        }
        if (ta.type === 'error') {
            return une(path, one, two);
        }
        if (oa !== one || ta !== two) {
            return _unifyTypes(oa, ta, ctx, path);
        }
        return une(path, one, two);
    }

    if (one.type === 'toplevel') {
        const oa = applyAndResolve(one, ctx, []);
        if (oa.type === 'error') {
            return une(path, one, two);
        }
        one = oa;
    }

    if (two.type === 'toplevel') {
        const ta = applyAndResolve(two, ctx, []);
        if (ta.type === 'error') {
            return une(path, two, two);
        }
        two = ta;
    }

    if (one.type === 'global') {
        const oa = applyAndResolve(one, ctx, []);
        if (oa.type === 'error') {
            return une(path, one, two);
        }
        one = oa;
    }
    if (two.type === 'global') {
        const ta = applyAndResolve(two, ctx, []);
        if (ta.type === 'error') {
            return une(path, one, two);
        }
        two = ta;
    }

    if (one.type === 'none') {
        return two;
    }
    if (two.type === 'none') {
        return one;
    }

    if (one.type === 'bool' && two.type === 'bool') {
        return one.value === two.value
            ? one
            : {
                  type: 'builtin',
                  name: 'bool',
                  form: one.form,
              };
    }

    if (one.type === 'any' && two.type === 'any') {
        return one;
    }

    if (
        (one.type === 'tag' || one.type === 'union') &&
        (two.type === 'tag' || two.type === 'union')
    ) {
        const onex = expandEnumItems(
            one.type === 'tag' ? [one] : one.items,
            ctx,
            path,
        );
        const twox = expandEnumItems(
            two.type === 'tag' ? [two] : two.items,
            ctx,
            path,
        );
        if (onex.type === 'error') {
            return onex;
        }
        if (twox.type === 'error') {
            return twox;
        }
        const result: { [key: string]: { args: Type[]; form: Node } } = {
            ...twox.map,
        };
        for (let [k, v] of Object.entries(onex.map)) {
            if (result[k]) {
                const err = unifyEnumArgs(k, v.args, result, v.form, path, ctx);
                if (err) {
                    return { type: 'error', error: err };
                }
            } else {
                result[k] = v;
            }
        }
        return {
            type: 'union',
            open:
                (one.type === 'union' && one.open) ||
                (two.type === 'union' && two.open),
            form: one.form,
            items: Object.entries(result)
                .sort((a, b) => cmp(a[0], b[0]))
                .map(([k, v]) => ({
                    type: 'tag',
                    name: k,
                    args: v.args,
                    form: v.form,
                })),
        };
    }

    if (one.type === 'string' && two.type === 'string') {
        if (one.first.text === two.first.text) {
            if (one.templates.length === two.templates.length) {
                const twot = two.templates;
                let wrong = false;
                let tpls = one.templates.map((item, i) => {
                    const other = twot[i];
                    if (item.suffix.text !== other.suffix.text) {
                        wrong = true;
                        return item;
                    }
                    const un = unifyTypes(item.type, other.type, ctx, one.form);
                    if (!un) {
                        wrong = true;
                        return item;
                    }
                    return {
                        suffix: item.suffix,
                        type: un,
                    };
                });
                if (wrong) {
                    return { type: 'builtin', name: 'string', form: one.form };
                }
                return { ...one, templates: tpls };
            }
        }
        return {
            type: 'builtin',
            name: 'string',
            form: one.form,
        };
    }

    // - [ ] Constants as builtins
    // Number constants
    if (
        one.type === 'number' &&
        two.type === 'builtin' &&
        two.name === one.kind
    ) {
        return two;
    }
    if (
        two.type === 'number' &&
        one.type === 'builtin' &&
        one.name === two.kind
    ) {
        return one;
    }
    if (one.type === 'number' && two.type === 'number') {
        return one.kind === two.kind
            ? one.value === two.value
                ? one
                : {
                      type: 'builtin',
                      name: one.kind,
                      form: one.form,
                  }
            : une(path, one, two);
    }
    if (one.type === 'record' && two.type === 'record') {
        const onem = recordMap(one, ctx);
        const twom = recordMap(two, ctx);
        const unified = unifyMaps(onem, twom, ctx, path);
        if (unified.type === 'error') {
            return unified;
        }
        return {
            type: 'record',
            entries: Object.values(unified.map),
            open: false,
            spreads: [],
            form: one.form,
        };
    }
    return {
        type: 'error',
        error: {
            type: 'misc',
            message: `unifyTypes not yet handled ${one.type} vs ${two.type}`,
        } as any,
    };
};

export const cmp = (a: any, b: any) => (a < b ? -1 : a > b ? 1 : 0);

export const unifyMaps = (
    one: RecordMap,
    two: RecordMap,
    ctx: Ctx,
    path: string[],
):
    | {
          type: 'error';
          error: MatchError;
      }
    | { type: 'ok'; map: RecordMap } => {
    const res: RecordMap = {};
    for (let key of Object.keys(one)) {
        if (!two[key])
            return {
                type: 'error',
                error: {
                    type: 'unification',
                    path,
                    one: one[key].value,
                    two: nilt,
                    message: `missing ${key}`,
                    form: one[key].value.form,
                },
            };
        const unified = _unifyTypes(one[key].value, two[key].value, ctx, [
            ...path,
            key,
        ]);
        if (unified.type === 'error') {
            return unified;
        }
        // We're dropping defaults here on purpose
        res[key] = { name: key, value: unified };
    }
    for (let key of Object.keys(two)) {
        if (!one[key])
            return {
                type: 'error',
                error: {
                    type: 'unification',
                    path,
                    one: nilt,
                    two: two[key].value,
                    message: `missing ${key}`,
                    form: two[key].value.form,
                },
            };
    }
    return { type: 'ok', map: res };
};
