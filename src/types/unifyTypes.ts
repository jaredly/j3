import { Ctx, nilt } from '../to-ast/to-ast';
import { RecordMap, recordMap } from '../to-ast/typeForExpr';
import { Node, Type } from './ast';
import { Error } from './types';
import { Report } from './get-types-new';

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
            report.errors[form.loc.idx] = unified.error;
        }
        return;
    }
    return { ...unified, form };
};

export const une = (
    path: string[],
    one: Type,
    two: Type,
): { type: 'error'; error: Error } => ({
    type: 'error',
    error: { type: 'unification', path, one, two },
});

export const _unifyTypes = (
    one: Type,
    two: Type,
    ctx: Ctx,
    path: string[],
): Type | { type: 'error'; error: Error } => {
    if (one.type === 'builtin' && two.type === 'builtin') {
        return one.name === two.name ? one : une(path, one, two);
    }

    // - [ ] Constants as builtins
    // Number constants
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
        const onem = recordMap(one);
        const twom = recordMap(two);
        const unified = unifyMaps(onem, twom, ctx, path);
        if (unified.type === 'error') {
            return unified;
        }
        return {
            type: 'record',
            entries: Object.values(unified.map),
            open: false,
            form: one.form,
        };
    }
    return {
        type: 'error',
        error: {
            type: 'misc',
            message: `not yet handled ${one.type} vs ${two.type}`,
        },
    };
};

export const unifyMaps = (
    one: RecordMap,
    two: RecordMap,
    ctx: Ctx,
    path: string[],
):
    | {
          type: 'error';
          error: Error;
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
                },
            };
    }
    return { type: 'ok', map: res };
};
