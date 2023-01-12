import { Node } from '../types/cst';
import { Expr, Record } from '../types/ast';
import { specials } from './specials';
import { Ctx, resolveExpr } from './to-ast';

export const nodeToExpr = (form: Node, ctx: Ctx): Expr => {
    switch (form.type) {
        case 'identifier': {
            return resolveExpr(form.text, form.hash, ctx, form);
        }
        case 'tag':
            return { type: 'tag', name: form.text, form };
        case 'string':
            return {
                type: 'string',
                first: form.first,
                form,
                templates: form.templates.map((item) => ({
                    suffix: item.suffix,
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
            if (
                form.values.length === 1 &&
                form.values[0].type === 'identifier'
            ) {
                entries.push({
                    name: form.values[0].text,
                    value: nodeToExpr(form.values[0], ctx),
                });
            } else if (
                form.values.length &&
                form.values[0].type === 'identifier' &&
                form.values[0].text === '$'
            ) {
                form.values.slice(1).forEach((item) => {
                    if (item.type === 'identifier') {
                        entries.push({
                            name: item.text,
                            value: nodeToExpr(item, ctx),
                        });
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
                for (let i = 0; i < form.values.length; i += 2) {
                    const name = form.values[i];
                    const value = form.values[i + 1];
                    entries.push({
                        name:
                            name.type === 'identifier'
                                ? name.text
                                : name.type === 'number'
                                ? name.raw
                                : '_ignored_' + name.type,
                        value: nodeToExpr(value, ctx),
                    });
                }
            }
            return { type: 'record', entries, form };
        }
        case 'list': {
            if (!form.values.length) {
                return { type: 'record', entries: [], form };
            }
            const first = form.values[0];
            if (first.type === 'identifier') {
                if (specials[first.text]) {
                    return specials[first.text](
                        form,
                        form.values.slice(1),
                        ctx,
                    );
                }
            }
            const [target, ...args] = form.values.map((child) =>
                nodeToExpr(child, ctx),
            );
            return {
                type: 'apply',
                target,
                args,
                form,
            };
        }
    }
    throw new Error(
        `nodeToExpr is ashamed to admit it can't handle ${form.type}`,
    );
};
