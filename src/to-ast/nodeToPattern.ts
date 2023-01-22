import { Node } from '../types/cst';
import { Pattern, Type } from '../types/ast';
import { Ctx, Local, nextSym, nilt } from './to-ast';
import { applyAndResolve, expandEnumItems } from '../get-type/matchesType';
import { Report } from '../get-type/get-types-new';
import type { Error } from '../types/types';

export const nodeToPattern = (
    form: Node,
    t: Type,
    ctx: Ctx,
    bindings: Local['terms'],
): Pattern => {
    switch (form.type) {
        case 'identifier': {
            const sym = nextSym(ctx);
            bindings.push({
                name: form.text,
                sym,
                type: t,
            });
            return {
                type: 'local',
                form,
                sym,
            };
        }
        case 'number':
            return {
                type: 'number',
                value: Number(form.raw),
                kind: form.raw.includes('.') ? 'float' : 'int',
                form,
            };
        case 'record': {
            const entries: { name: string; value: Pattern }[] = [];
            const res = applyAndResolve(t, ctx, []);
            if (!res) {
                console.log('no t', t);
                return { type: 'unresolved', form, reason: 'bad type' };
            }

            const prm =
                res.type === 'record'
                    ? res.entries.reduce((map, item) => {
                          map[item.name] = item.value;
                          return map;
                      }, {} as { [key: string]: Type })
                    : null;
            if (!prm) {
                return { type: 'unresolved', form, reason: 'bad type' };
            }
            console.log(prm, res);
            if (
                form.values.length === 1 &&
                form.values[0].type === 'identifier'
            ) {
                const name = form.values[0].text;
                entries.push({
                    name,
                    value: nodeToPattern(
                        form.values[0],
                        prm
                            ? prm[name] ?? {
                                  type: 'unresolved',
                                  form: t.form,
                                  reason: `attribute not in type ${name}`,
                              }
                            : {
                                  type: 'unresolved',
                                  form: t.form,
                                  reason: `type ${t.type} not a record`,
                              },
                        ctx,
                        bindings,
                    ),
                });
            } else {
                for (let i = 0; i < form.values.length; i += 2) {
                    const name = form.values[i];
                    const value = form.values[i + 1];
                    if (name.type !== 'identifier' && name.type !== 'number') {
                        err(ctx.errors, form.values[i], {
                            type: 'misc',
                            message: 'expected identifier or integer literal',
                        });
                        continue;
                    }
                    const namev =
                        name.type === 'identifier' ? name.text : name.raw;
                    ctx.styles[name.loc.idx] = 'italic';
                    if (!prm[namev]) {
                        err(ctx.errors, form.values[i], {
                            type: 'misc',
                            message: `attribute not in type ${namev} ${Object.keys(
                                prm,
                            ).join(', ')}`,
                        });
                        continue;
                    }
                    if (!value) {
                        err(ctx.errors, form.values[i], {
                            type: 'misc',
                            message: 'expected value',
                        });
                        continue;
                    }
                    entries.push({
                        name: namev,
                        value: nodeToPattern(
                            value,
                            prm[namev] ?? nilt,
                            ctx,
                            bindings,
                        ),
                    });
                }
            }
            return {
                type: 'record',
                entries,
                form,
            };
        }
        case 'list': {
            if (!form.values.length) {
                return {
                    type: 'record',
                    form,
                    entries: [],
                };
            }
            const [first, ...rest] = form.values;
            if (first.type === 'identifier' && first.text === ',') {
                const prm =
                    t.type === 'record'
                        ? t.entries.reduce((map, item) => {
                              map[item.name] = item.value;
                              return map;
                          }, {} as { [key: string]: Type })
                        : null;
                return {
                    type: 'record',
                    form,
                    entries: rest.map((item, i) => ({
                        name: i.toString(),
                        value: nodeToPattern(
                            item,
                            prm
                                ? prm[i.toString()]
                                : {
                                      type: 'unresolved',
                                      form: t.form,
                                      reason: `type isnt a record (${t.type} ${
                                          t.type === 'unresolved'
                                              ? t.reason
                                              : ''
                                      })`,
                                  },
                            ctx,
                            bindings,
                        ),
                    })),
                };
            }
            if (first.type === 'tag') {
                ctx.styles[first.loc.idx] = 'bold';
                const res = applyAndResolve(t, ctx, []);
                if (!res) {
                    console.log('no t', t);
                    return { type: 'unresolved', form, reason: 'bad type' };
                }
                let args: Type[];
                if (res.type === 'tag') {
                    if (res.name !== first.text) {
                        console.log('mismatch', res, first.text);
                        return { type: 'unresolved', form, reason: 'bad type' };
                    }
                    args = res.args;
                } else if (res.type === 'union') {
                    const map = expandEnumItems(res.items, ctx, []);
                    if (map.type === 'error' || !map.map[first.text]) {
                        console.log('nomap', map, first.text);
                        return { type: 'unresolved', form, reason: 'bad type' };
                    }
                    args = map.map[first.text].args;
                } else {
                    console.log('badres', res);
                    return { type: 'unresolved', form, reason: 'bad type' };
                }
                // const argt = t.type === 'tag' ? t.args : null;
                // if (!argt) {
                //     console.log('no switch bad', t);
                // }
                console.log('yay', first.text, args);
                return {
                    type: 'tag',
                    name: first.text,
                    form,
                    args: rest.map((p, i) =>
                        nodeToPattern(p, args[i], ctx, bindings),
                    ),
                };
            }
        }
    }
    throw new Error(`nodeToPattern can't handle ${form.type}`);
};

export const err = (errors: Report['errors'], form: Node, error: Error) => {
    if (!errors[form.loc.idx]) {
        errors[form.loc.idx] = [];
    }
    errors[form.loc.idx].push(error);
};
