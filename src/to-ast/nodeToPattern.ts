import { Node } from '../types/cst';
import { Pattern, Type } from '../types/ast';
import { nextSym } from './to-ast';
import { Ctx, Local, nilt } from './Ctx';
import { applyAndResolve, expandEnumItems } from '../get-type/matchesType';
import { Report } from '../get-type/get-types-new';
import type { Error } from '../types/types';
import { filterComments } from './nodeToExpr';
import { addMod } from './specials';

export const nodeToPattern = (
    form: Node,
    t: Type,
    ctx: Ctx,
    bindings: Local['terms'],
): Pattern => {
    switch (form.type) {
        // case 'list': {
        //     err(ctx.errors, form, {
        //         type: 'misc',
        //         message: 'list patterns not yet sorry',
        //     });
        //     return {
        //         type: 'unresolved',
        //         form,
        //         reason: 'pattern list not yet sorry',
        //     };
        // }
        case 'tag': {
            return {
                type: 'tag',
                name: form.text,
                args: [],
                form,
            };
        }
        case 'identifier': {
            let sym;
            if (!form.hash) {
                sym = nextSym(ctx);
                addMod(ctx, form.loc.idx, { type: 'hash', hash: `:${sym}` });
            } else {
                sym = +form.hash.slice(1);
                if (isNaN(sym)) {
                    throw new Error(`non-number sym? ${form.hash}`);
                }
            }
            // ctx.
            ctx.display[form.loc.idx] = {
                style: {
                    type: 'id-decl',
                    hash: ':' + sym,
                },
            };
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
            const values = filterComments(form.values);
            const entries: { name: string; form: Node; value: Pattern }[] = [];
            const res = applyAndResolve(t, ctx, []);
            if (!res) {
                err(ctx.errors, form, {
                    type: 'misc',
                    message: `bad type`,
                });
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
                err(ctx.errors, form, {
                    type: 'misc',
                    message: `type ${t.type} not a record`,
                });
                return { type: 'unresolved', form, reason: 'bad type' };
            }
            if (values.length === 1 && values[0].type === 'identifier') {
                const name = values[0].text;
                if (!prm || !prm[name]) {
                    err(ctx.errors, form, {
                        type: 'misc',
                        message: `attribute not in type`,
                    });
                }
                entries.push({
                    name,
                    form: values[0],
                    value: nodeToPattern(
                        values[0],
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
            } else if (
                values.length >= 1 &&
                values[0].type === 'identifier' &&
                values[0].text === '$'
            ) {
                for (let i = 1; i < values.length; i++) {
                    const name = values[i];
                    if (name.type !== 'identifier') {
                        err(ctx.errors, values[i], {
                            type: 'misc',
                            message: 'expected identifier',
                        });
                        continue;
                    }

                    const namev = name.text;
                    ctx.display[name.loc.idx] = {
                        style: { type: 'record-attr' },
                    };
                    if (!prm[namev]) {
                        err(ctx.errors, values[i], {
                            type: 'misc',
                            message: `attribute not in type ${namev} ${Object.keys(
                                prm,
                            ).join(', ')}`,
                        });
                        continue;
                    }
                    entries.push({
                        name: namev,
                        form: name,
                        value: nodeToPattern(
                            name,
                            prm[namev] ?? nilt,
                            ctx,
                            bindings,
                        ),
                    });
                }
            } else {
                for (let i = 0; i < values.length; i += 2) {
                    const name = values[i];
                    const value = values[i + 1];
                    if (name.type !== 'identifier' && name.type !== 'number') {
                        err(ctx.errors, values[i], {
                            type: 'misc',
                            message: 'expected identifier or integer literal',
                        });
                        continue;
                    }
                    const namev =
                        name.type === 'identifier' ? name.text : name.raw;
                    ctx.display[name.loc.idx] = {
                        style: { type: 'record-attr' },
                    };
                    if (!prm[namev]) {
                        err(ctx.errors, values[i], {
                            type: 'misc',
                            message: `attribute not in type ${namev} ${Object.keys(
                                prm,
                            ).join(', ')}`,
                        });
                        continue;
                    }
                    if (!value) {
                        err(ctx.errors, values[i], {
                            type: 'misc',
                            message: 'expected value',
                        });
                        continue;
                    }
                    entries.push({
                        name: namev,
                        form: name,
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
            const values = filterComments(form.values);
            if (!values.length) {
                return {
                    type: 'record',
                    form,
                    entries: [],
                };
            }
            const [first, ...rest] = values;
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
                        form: item,
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
                ctx.display[first.loc.idx] = { style: { type: 'tag' } };
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
