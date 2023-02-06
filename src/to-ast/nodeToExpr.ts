import { Node } from '../types/cst';
import { Expr, Record } from '../types/ast';
import { specials } from './specials';
import { resolveExpr } from './resolveExpr';
import { Ctx, nil } from './Ctx';
import { err } from './nodeToPattern';

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

export const nodeToExpr = (form: Node, ctx: Ctx): Expr => {
    switch (form.type) {
        case 'identifier': {
            if (!form.text && !form.hash) {
                return { type: 'blank', form };
            }
            if (form.text.includes('.')) {
                const [expr, ...rest] = form.text.split('.');
                let inner: Expr = resolveExpr(
                    expr,
                    form.hash,
                    ctx,
                    form,
                    '.' + rest.join('.'),
                );
                while (rest.length) {
                    const next = rest.shift()!;
                    inner = {
                        type: 'attribute',
                        target: inner,
                        attr: next,
                        form,
                    };
                }
                return inner;
            }

            return resolveExpr(form.text, form.hash, ctx, form);
        }
        case 'unparsed':
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
    }
    throw new Error(
        `nodeToExpr is ashamed to admit it can't handle ${form.type}`,
    );
};
