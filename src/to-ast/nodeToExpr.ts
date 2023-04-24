import { Identifier, Node, NodeExtra, recordAccess } from '../types/cst';
import { Expr, Number, Record, Type } from '../types/ast';
import { specials } from './specials';
import { resolveExpr } from './resolveExpr';
import { AutoCompleteResult, nil, nilt } from './Ctx';
import { err } from './nodeToPattern';
import { getType, RecordMap, recordMap } from '../get-type/get-types-new';
import { applyAndResolve } from '../get-type/matchesType';
import { nodeToType } from './nodeToType';
import { populateAutocomplete } from './populateAutocomplete';
import { CstCtx, Ctx } from './library';

export const filterComments = (nodes: Node[]) =>
    nodes.filter((node) => node.type !== 'comment' && node.type !== 'blank');

export const getRecordMap = (type: Type | null, ctx: Ctx): RecordMap | null => {
    if (!type) {
        return null;
    }
    let res = applyAndResolve(type, ctx, []);
    if (res.type === 'local-bound' && res.bound) {
        res = res.bound;
    }
    if (res.type === 'record') {
        return recordMap(res, ctx);
    }
    return null;
};

export const ensure = <T, K>(
    map: { [key: string]: T },
    key: string | number,
    dv: T,
) => {
    if (!map[key]) {
        map[key] = dv;
    }
    return map[key];
};

export const nodeToExpr = (form: Node, ctx: CstCtx): Expr => {
    switch (form.type) {
        case 'recordAccess':
            return nodeToRecordAccess(form, ctx);
        case 'identifier':
            return (
                maybeParseNumber(form, ctx) ??
                resolveExpr(form.text, undefined, ctx, form)
            );
        case 'hash':
            return resolveExpr('', form.hash, ctx, form);
        case 'record':
            return nodeToRecord(form, ctx);

        case 'unparsed':
            if (form.raw.startsWith('\\')) {
                let options: AutoCompleteResult[] = backslashComplete();
                if (form.raw.length > 1) {
                    options = options.filter((option) =>
                        option.text
                            .toLowerCase()
                            .startsWith(form.raw.slice(1).toLowerCase()),
                    );
                }
                ensure(ctx.results.display, form.loc, {}).autoComplete =
                    options;
            }
            return { type: 'unresolved', form };

        case 'string':
            return {
                type: 'string',
                first: { text: form.first.text, form: form.first },
                form,
                templates: form.templates.map((item) => ({
                    suffix: { text: item.suffix.text, form: item.suffix },
                    expr:
                        item.expr.type === 'blank'
                            ? {
                                  type: 'unresolved',
                                  form: item.expr,
                              }
                            : nodeToExpr(item.expr, ctx),
                })),
            };

        case 'list': {
            const values = filterComments(form.values);
            if (!values.length) {
                return { type: 'record', entries: [], form, spreads: [] };
            }
            const first = values[0];
            if (first.type === 'identifier') {
                if (Object.hasOwn(specials, first.text)) {
                    return specials[first.text](form, values.slice(1), ctx);
                }
            }
            if (first.type === 'array') {
                // ([a b c] hello)
                const args = first.values.map((arg) => nodeToExpr(arg, ctx));
                const rest = values
                    .slice(1)
                    .map((child) => nodeToExpr(child, ctx));
                rest.slice(1).forEach((item) => {
                    err(ctx.results.errors, item.form, {
                        type: 'misc',
                        message: '[] indexing only takes one target',
                    });
                });
                const target: Expr = first.hash
                    ? resolveExpr('', first.hash, ctx, first)
                    : { type: 'unresolved', form: first };
                if (!first.hash) {
                    populateAutocomplete(ctx, '[]', first);
                }
                return {
                    type: 'apply',
                    target,
                    args: [rest[0] ?? nil, ...args],
                    form,
                };
            }
            const [target, ...args] = values.map((child) =>
                nodeToExpr(child, ctx),
            );
            return {
                type: 'apply',
                target,
                args,
                form,
            };
        }

        case 'array': {
            const values = filterComments(form.values);
            return {
                type: 'array',
                values: values.map((child) => nodeToExpr(child, ctx)),
                form,
            };
        }

        case 'comment':
        case 'blank':
            console.log(form);
            throw new Error(
                `How did we get here? Comments and blanks should be filtered out: ${form.type}`,
            );
        case 'stringText':
        case 'accessText':
            throw new Error(`${form.type} shouldnt be dangling`);
        case 'spread':
            err(ctx.results.errors, form, {
                type: 'misc',
                message: 'dangling spread',
            });
            return { type: 'blank', form };
        case 'rich-text':
            return { type: 'rich-text', form, lexicalJSON: form.lexicalJSON };
        case 'attachment':
            if (!form.file) {
                return { type: 'unresolved', form, reason: 'empty attachment' };
            }
            return {
                type: 'attachment',
                form,
                file: form.file,
                name: form.name,
            };
        case 'annot':
            err(ctx.results.errors, form, {
                type: 'misc',
                message: 'unexpected annot',
            });
            return nodeToExpr(form.target, ctx);
        case 'tapply':
            return {
                type: 'type-apply',
                target: nodeToExpr(form.target, ctx),
                args: form.values.map((arg) => nodeToType(arg, ctx)),
                form,
            };
    }

    let _: never = form;
    throw new Error(
        `nodeToExpr is ashamed to admit it can't handle ${JSON.stringify(
            form,
        )}`,
    );
};

export const maybeParseNumber = (
    form: Identifier & NodeExtra,
    ctx: CstCtx,
): null | Number => {
    if (form.text.match(/^[0-9]+u$/)) {
        ensure(ctx.results.display, form.loc, {}).style = {
            type: 'number',
            kind: 'uint',
        };
        return {
            type: 'number',
            kind: 'uint',
            value: parseInt(form.text.replace(/u$/, '')),
            form,
        };
    }
    if (form.text.match(/^-?[0-9]+[if]?$/)) {
        const kind = form.text.endsWith('f') ? 'float' : 'int';
        ensure(ctx.results.display, form.loc, {}).style = {
            type: 'number',
            kind,
        };
        return {
            type: 'number',
            kind,
            value: parseInt(form.text.replace(/[if]$/, '')),
            form,
        };
    }
    if (form.text.match(/^-?[0-9]+\.[0-9]*f?$/)) {
        ensure(ctx.results.display, form.loc, {}).style = {
            type: 'number',
            kind: 'float',
        };
        return {
            type: 'number',
            kind: 'float',
            value: parseFloat(form.text.replace(/f$/, '')),
            form,
        };
    }
    return null;
};

export function backslashComplete(): AutoCompleteResult[] {
    return [
        // {
        //     type: 'update',
        //     exact: false,
        //     ann: {
        //         type: 'builtin',
        //         name: 'string',
        //         form: nilt.form,
        //     },
        //     text: 'Rich Text',
        //     node: {
        //         type: 'rich-text',
        //         lexicalJSON: {
        //             root: {
        //                 children: [
        //                     {
        //                         children: [],
        //                         direction: null,
        //                         format: '',
        //                         indent: 0,
        //                         type: 'paragraph',
        //                         version: 1,
        //                     },
        //                 ],
        //                 direction: null,
        //                 format: '',
        //                 indent: 0,
        //                 type: 'root',
        //                 version: 1,
        //             },
        //         },
        //     },
        // },
        // {
        //     type: 'replace',
        //     exact: false,
        //     ann: { type: 'builtin', name: 'file', form: nilt.form },
        //     text: 'Attachment',
        //     node: { type: 'attachment', name: '', file: null },
        // },
    ];
}

export function nodeToRecord(
    form: { type: 'record'; values: Node[] } & NodeExtra,
    ctx: CstCtx,
): Expr {
    const entries: Record['entries'] = [];
    const values = filterComments(form.values);
    let open = false;
    let spreads: Expr[] = [];

    /*
    if (values.length === 1 && values[0].type === 'identifier') {
        entries.push({
            name: values[0].text,
            value: nodeToExpr(values[0], ctx),
        });
    } else if (
        values.length &&
        values[0].type === 'identifier' &&
        values[0].text === '$'
    ) {
        values.slice(1).forEach((item) => {
            if (item.type === 'identifier') {
                entries.push({
                    name: item.text,
                    value: nodeToExpr(item, ctx),
                });
                if (!ctx.results.display[item.loc]?.style) {
                    ensure(ctx.results.display, item.loc, {}).style = {
                        type: 'record-attr',
                    };
                }
            } else {
                entries.push({
                    name: '_ignored',
                    value: {
                        type: 'unresolved',
                        form: item,
                        reason: `not an identifier, in a punned record`,
                    },
                });
            }
        });
    } else {
    */
    for (let i = 0; i < values.length; ) {
        const name = values[i];
        if (name.type === 'spread') {
            if (name.contents.type === 'blank') {
                err(ctx.results.errors, name, {
                    type: 'misc',
                    message: 'no empty spread in expressions',
                });
                i++;
                continue;
            }
            const spread = nodeToExpr(name.contents, ctx);
            const t = getType(spread, ctx);
            if (t) {
                const tt = applyAndResolve(t, ctx, []);
                if (tt.type === 'record') {
                    spreads.push(spread);
                } else {
                    err(ctx.results.errors, name, {
                        type: 'misc',
                        message: `can only spread records, not ${tt.type}`,
                    });
                }
            } else {
                err(ctx.results.errors, name, {
                    type: 'misc',
                    message: `illegal spread`,
                });
            }
            i++;
            continue;
        }

        if (!ctx.results.display[name.loc]?.style) {
            ensure(ctx.results.display, name.loc, {}).style = {
                type: 'record-attr',
            };
        }
        if (name.type !== 'identifier') {
            err(ctx.results.errors, name, {
                type: 'misc',
                message: `invalid record item ${name.type}`,
            });
            i += 1;
            continue;
        }
        const namev = name.text;
        const value = values[i + 1];
        i += 2;
        if (!value) {
            err(ctx.results.errors, name, {
                type: 'misc',
                message: `missing value for field ${namev}`,
            });
        }
        entries.push({
            name: namev,
            value: value ? nodeToExpr(value, ctx) : nil,
        });
    }
    return { type: 'record', entries, spreads, form };
}

export function nodeToRecordAccess(
    form: recordAccess & NodeExtra,
    ctx: CstCtx,
): Expr {
    const target =
        form.target.type !== 'blank' ? nodeToExpr(form.target, ctx) : null;
    if (target) {
        let ttype = getType(target, ctx);
        if (ttype) {
            for (let item of form.items) {
                const options = getRecordMap(ttype, ctx);
                if (!options) {
                    err(ctx.results.errors, item, {
                        type: 'misc',
                        message: 'not a record',
                    });
                    break;
                }
                if (options[item.text]) {
                    ttype = options[item.text].value;
                } else {
                    ensure(ctx.results.display, item.loc, {}).autoComplete =
                        Object.entries(options).map(
                            ([name, { value }]) =>
                                ({
                                    type: 'update',
                                    text: name,
                                    update: {
                                        type: 'accessText',
                                        text: name,
                                    },
                                    exact: false,
                                    ann: value,
                                } satisfies AutoCompleteResult),
                        );
                    ctx.results.display[item.loc];
                    err(ctx.results.errors, item, {
                        type: 'misc',
                        message: `no "${item.text}" attribute on record`,
                    });
                }
            }
        }
    }
    return {
        type: 'recordAccess',
        items: form.items.map((item) => {
            if (item.text === '') {
                err(ctx.results.errors, item, {
                    type: 'misc',
                    message: 'empty attribute',
                });
            }
            return item.text;
        }),
        form,
        target,
    };
}
