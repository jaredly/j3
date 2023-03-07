import { Node } from '../types/cst';
import { Expr, Record, Type } from '../types/ast';
import { specials } from './specials';
import { resolveExpr } from './resolveExpr';
import { AutoCompleteResult, Ctx, nil, nilt } from './Ctx';
import { err } from './nodeToPattern';
import { getType, RecordMap, recordMap } from '../get-type/get-types-new';
import { applyAndResolve } from '../get-type/matchesType';

export const filterComments = (nodes: Node[]) =>
    nodes.filter(
        (node) =>
            node.type !== 'comment' &&
            !(
                node.type === 'identifier' &&
                node.text === '' &&
                (!node.hash || node.hash === '')
            ),
    );

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

export const nodeToExpr = (form: Node, ctx: Ctx): Expr => {
    switch (form.type) {
        case 'recordAccess': {
            const target =
                form.target.type !== 'blank'
                    ? nodeToExpr(form.target, ctx)
                    : null;
            if (target) {
                let ttype = getType(target, ctx);
                if (ttype) {
                    for (let item of form.items) {
                        const options = getRecordMap(ttype, ctx);
                        if (!options) {
                            break;
                        }
                        if (options[item.text]) {
                            ttype = options[item.text].value;
                        } else {
                            ensure(ctx.display, item.loc.idx, {}).autoComplete =
                                Object.entries(options).map(
                                    ([name, { value }]) =>
                                        ({
                                            type: 'replace',
                                            text: name,
                                            node: {
                                                type: 'accessText',
                                                text: name,
                                            },
                                            exact: false,
                                            ann: value,
                                        } satisfies AutoCompleteResult),
                                );
                            ctx.display[item.loc.idx];
                        }
                    }
                }
            }
            return {
                type: 'recordAccess',
                items: form.items.map((item) => item.text),
                form,
                target,
            };
        }
        case 'identifier': {
            if (!form.text && !form.hash) {
                return { type: 'blank', form };
            }
            // if (form.text.includes('.')) {
            //     const [expr, ...rest] = form.text.split('.');
            //     let inner: Expr = resolveExpr(
            //         expr,
            //         form.hash,
            //         ctx,
            //         form,
            //         '.' + rest.join('.'),
            //     );
            //     while (rest.length) {
            //         const next = rest.shift()!;
            //         inner = {
            //             type: 'attribute',
            //             target: inner,
            //             attr: next,
            //             form,
            //         };
            //     }
            //     return inner;
            // }

            return resolveExpr(form.text, form.hash, ctx, form);
        }
        case 'unparsed':
            if (form.raw.startsWith('\\')) {
                let options: AutoCompleteResult[] = [
                    {
                        type: 'replace',
                        exact: false,
                        ann: {
                            type: 'builtin',
                            name: 'string',
                            form: nilt.form,
                        },
                        text: 'Rich Text',
                        node: {
                            type: 'rich-text',
                            lexicalJSON: {
                                root: {
                                    children: [
                                        {
                                            children: [],
                                            direction: null,
                                            format: '',
                                            indent: 0,
                                            type: 'paragraph',
                                            version: 1,
                                        },
                                    ],
                                    direction: null,
                                    format: '',
                                    indent: 0,
                                    type: 'root',
                                    version: 1,
                                },
                            },
                        },
                    },
                    {
                        type: 'replace',
                        exact: false,
                        ann: { type: 'builtin', name: 'file', form: nilt.form },
                        text: 'Attachment',
                        node: { type: 'attachment', name: '', file: null },
                    },
                ];
                if (form.raw.length > 1) {
                    options = options.filter((option) =>
                        option.text
                            .toLowerCase()
                            .startsWith(form.raw.slice(1).toLowerCase()),
                    );
                }
                ensure(ctx.display, form.loc.idx, {}).autoComplete = options;
            }
            return { type: 'unresolved', form };
        case 'tag':
            ctx.display[form.loc.idx] = { style: { type: 'tag' } };
            return { type: 'tag', name: form.text, form };
        case 'string':
            return {
                type: 'string',
                first: { text: form.first.text, form: form.first },
                form,
                templates: form.templates.map((item) => ({
                    suffix: { text: item.suffix.text, form: item.suffix },
                    expr: nodeToExpr(item.expr, ctx),
                })),
            };
        case 'number':
            return {
                type: 'number',
                form,
                value: +form.raw,
                kind: form.raw.includes('.') ? 'float' : 'int',
            };
        case 'record': {
            const entries: Record['entries'] = [];
            const values = filterComments(form.values);
            let spread: Expr | undefined = undefined;
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
                        ctx.display[item.loc.idx] = {
                            style: { type: 'record-attr' },
                        };
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
                if (
                    values.length &&
                    values[0].type === 'identifier' &&
                    values[0].text.startsWith('...')
                ) {
                    // spread = nodeToExpr(
                    //     {
                    //         ...values[0],
                    //         text: values[0].text.slice(3),
                    //     },
                    //     ctx,
                    // );
                    spread = resolveExpr(
                        values[0].text.slice(3),
                        values[0].hash,
                        ctx,
                        values[0],
                        undefined,
                        '...',
                    );
                    values.shift();
                }
                for (let i = 0; i < values.length; i += 2) {
                    const name = values[i];
                    ctx.display[name.loc.idx] = {
                        style: { type: 'record-attr' },
                    };
                    if (name.type !== 'identifier' && name.type !== 'number') {
                        continue;
                    }
                    const namev =
                        name.type === 'identifier' ? name.text : name.raw;
                    const value = values[i + 1];
                    if (!value) {
                        err(ctx.errors, name, {
                            type: 'misc',
                            message: `missing value for field ${namev}`,
                        });
                    }
                    entries.push({
                        name: namev,
                        value: value ? nodeToExpr(value, ctx) : nil,
                    });
                }
            }
            return { type: 'record', entries, spread, form };
        }
        case 'list': {
            const values = filterComments(form.values);
            if (!values.length) {
                return { type: 'record', entries: [], form };
            }
            const first = values[0];
            if (first.type === 'identifier') {
                if (Object.hasOwn(specials, first.text)) {
                    return specials[first.text](form, values.slice(1), ctx);
                }
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
            throw new Error(
                `How did we get here? Comments and blanks should be filtered out`,
            );
        case 'stringText':
        case 'accessText':
            throw new Error(`${form.type} shouldnt be dangling`);
        case 'spread':
            throw new Error('not yet impl');
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
    }
    let _: never = form;
    throw new Error(
        `nodeToExpr is ashamed to admit it can't handle ${JSON.stringify(
            form,
        )}`,
    );
};
