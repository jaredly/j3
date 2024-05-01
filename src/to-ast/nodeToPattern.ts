import { Loc, Node } from '../types/cst';
import { LocalPattern, Pattern, Type } from '../types/ast';
import { Ctx, Local, nilt } from './Ctx';
import { applyAndResolve, expandEnumItems } from '../get-type/applyAndResolve';
import { Report, recordMap } from '../get-type/get-types-new';
import type { Error } from '../types/types';
import { filterComments } from './nodeToExpr';
import { addMod } from './specials';
import { CstCtx } from './library';

export const getArrayItemType = (
    t: Type,
): { value: Type; size: null | Type } | null => {
    if (
        t.type === 'apply' &&
        t.target.type === 'builtin' &&
        t.target.name === 'array' &&
        t.args.length > 0
    ) {
        return { value: t.args[0], size: t.args[1] ?? null };
    }
    return null;
};

export const nodeToPattern = (
    form: Node,
    t: Type,
    ctx: CstCtx,
    bindings: Local['terms'],
): Pattern => {
    // console.log('aptterning', form);
    switch (form.type) {
        case 'array': {
            let item = getArrayItemType(t);
            if (!item) {
                err(ctx.results.errors, form, {
                    type: 'misc',
                    message: 'array pattern, but not an array type',
                });
                item = { value: nilt, size: nilt };
            }
            let left: Pattern[] = [];
            let right: { spread?: LocalPattern; items: Pattern[] } | null =
                null;
            filterComments(form.values).forEach((node) => {
                if (right) {
                    right.items.push(
                        nodeToPattern(node, item!.value, ctx, bindings),
                    );
                } else {
                    if (node.type === 'spread') {
                        if (
                            node.contents.type !== 'blank' &&
                            node.contents.type !== 'identifier'
                        ) {
                            err(ctx.results.errors, node.contents, {
                                type: 'misc',
                                message:
                                    'pattern spread must be blank or an identifier',
                            });
                        }
                        right = {
                            spread:
                                node.contents.type === 'identifier'
                                    ? (nodeToPattern(
                                          node.contents,
                                          t,
                                          ctx,
                                          bindings,
                                      ) as LocalPattern)
                                    : undefined,
                            items: [],
                        };
                    } else {
                        left.push(
                            nodeToPattern(node, item!.value, ctx, bindings),
                        );
                    }
                }
            });
            return { type: 'array', left, right, form };
        }
        case 'identifier': {
            if (form.text.startsWith("'")) {
                return {
                    type: 'tag',
                    // TODO: maybe a null args?
                    args: [],
                    form,
                    name: form.text.slice(1),
                };
            }
            ctx.results.display[form.loc] = {
                style: { type: 'id-decl', hash: form.loc, ann: t },
            };
            bindings.push({ name: form.text, sym: form.loc, type: t });
            return { type: 'local', sym: form.loc, name: form.text, form };
        }
        case 'record': {
            const values = filterComments(form.values);
            const entries: { name: string; form: Node; value: Pattern }[] = [];
            const res = applyAndResolve(t, ctx, []);
            if (!res) {
                err(ctx.results.errors, form, {
                    type: 'misc',
                    message: `bad type`,
                });
                return { type: 'unresolved', form, reason: 'bad type' };
            }

            const prm = res.type === 'record' ? recordMap(res, ctx) : null;
            if (!prm) {
                err(ctx.results.errors, form, {
                    type: 'misc',
                    message: `type ${t.type} not a record`,
                });
                return { type: 'unresolved', form, reason: 'bad type' };
            }
            if (values.length === 1 && values[0].type === 'identifier') {
                const name = values[0].text;
                if (!prm || !prm[name]) {
                    err(ctx.results.errors, form, {
                        type: 'misc',
                        message: `attribute ${name} not in type ${JSON.stringify(
                            prm,
                        )}`,
                    });
                }
                entries.push({
                    name,
                    form: values[0],
                    value: nodeToPattern(
                        values[0],
                        prm
                            ? prm[name]?.value ?? {
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
                        err(ctx.results.errors, values[i], {
                            type: 'misc',
                            message: 'expected identifier',
                        });
                        continue;
                    }

                    const namev = name.text;
                    ctx.results.display[name.loc] = {
                        style: { type: 'record-attr' },
                    };
                    if (!prm[namev]) {
                        err(ctx.results.errors, values[i], {
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
                            prm[namev]?.value ?? nilt,
                            ctx,
                            bindings,
                        ),
                    });
                }
            } else {
                for (let i = 0; i < values.length; i += 2) {
                    const name = values[i];
                    const value = values[i + 1];
                    if (name.type !== 'identifier') {
                        err(ctx.results.errors, values[i], {
                            type: 'misc',
                            message: 'expected identifier or integer literal',
                        });
                        continue;
                    }
                    const namev = name.text;
                    ctx.results.display[name.loc] = {
                        style: { type: 'record-attr' },
                    };
                    if (!prm[namev]) {
                        err(ctx.results.errors, values[i], {
                            type: 'misc',
                            message: `attribute not in type ${namev} ${Object.keys(
                                prm,
                            ).join(', ')}`,
                        });
                        continue;
                    }
                    if (!value) {
                        err(ctx.results.errors, values[i], {
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
                            prm[namev]?.value ?? nilt,
                            ctx,
                            bindings,
                        ),
                    });
                }
            }
            return { type: 'record', entries, form };
        }
        case 'list': {
            const values = filterComments(form.values);
            if (!values.length) {
                return { type: 'record', form, entries: [] };
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
            // console.log('list here', first);
            if (first.type === 'identifier' && first.text.startsWith("'")) {
                const text = first.text.slice(1);
                ctx.results.display[first.loc] = { style: { type: 'tag' } };
                const res = applyAndResolve(t, ctx, []);
                if (!res) {
                    // console.log('no t', t);
                    return { type: 'unresolved', form, reason: 'bad type' };
                }
                let args: Type[];
                if (res.type === 'tag') {
                    if (res.name !== text) {
                        // console.log('no name idk', res.name, text);
                        return { type: 'unresolved', form, reason: 'bad type' };
                    }
                    args = res.args;
                } else if (res.type === 'union') {
                    const map = expandEnumItems(res.items, ctx, []);
                    if (map.type === 'error' || !map.map[text]) {
                        // console.log('bad type forls', map, text);
                        return { type: 'unresolved', form, reason: 'bad type' };
                    }
                    args = map.map[text].args;
                } else {
                    // console.log('nothign else', res, t);
                    return { type: 'unresolved', form, reason: 'bad type' };
                }
                // console.log('patterns', rest);
                return {
                    type: 'tag',
                    name: text,
                    form,
                    args: rest.map((p, i) =>
                        nodeToPattern(p, args[i], ctx, bindings),
                    ),
                };
            }
        }
        case 'hash':
        case 'comment':
        case 'comment-node':
        case 'annot':
        case 'string':
        case 'stringText':
        case 'raw-code':
        case 'recordAccess':
        case 'accessText':
        case 'spread':
        case 'rich-text':
        case 'attachment':
        case 'tapply':
        case 'blank':
        case 'unparsed':
            return { type: 'unresolved', form };
    }
    let _: never = form;
    return { type: 'unresolved', form };
};

export const err = (
    errors: Report['errors'],
    form: Node | Loc,
    error: Error,
) => {
    const loc = typeof form === 'number' ? form : form.loc;
    if (!errors[loc]) {
        errors[loc] = [];
    }
    errors[loc].push(error);
};
