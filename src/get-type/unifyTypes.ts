import { Ctx, nilt } from '../to-ast/to-ast';
import { RecordMap, recordMap } from '../to-ast/typeForExpr';
import { Node, Type } from '../types/ast';
import { Error, MatchError } from '../types/types';
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
            if (!report.errors[form.loc.idx]) {
                report.errors[form.loc.idx] = [];
            }
            report.errors[form.loc.idx].push(unified.error);
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

    if (one.type === 'bool' && two.type === 'bool') {
        return one.value === two.value
            ? one
            : {
                  type: 'builtin',
                  name: 'bool',
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
            message: `unifyTypes not yet handled ${one.type} vs ${two.type}`,
        } as any,
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
