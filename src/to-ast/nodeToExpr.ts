import { Node } from '../types/cst';
import { Expr, Record } from '../types/ast';
import { specials } from './specials';
import { Ctx, resolveExpr } from './to-ast';

export const nodeToExpr = (form: Node, ctx: Ctx): Expr => {
    const { contents } = form;
    // todo decorators
    switch (contents.type) {
        case 'identifier': {
            return resolveExpr(contents.text, contents.hash, ctx, form);
        }
        case 'tag':
            return { type: 'tag', name: contents.text, form };
        case 'number':
            return {
                type: 'number',
                form,
                value: +contents.raw,
                kind: contents.raw.includes('.') ? 'float' : 'int',
            };
        case 'record': {
            const entries: Record['entries'] = [];
            if (
                contents.items.length === 1 &&
                contents.items[0].contents.type === 'identifier'
            ) {
                entries.push({
                    name: contents.items[0].contents.text,
                    value: nodeToExpr(contents.items[0], ctx),
                });
            } else if (
                contents.items[0].contents.type === 'identifier' &&
                contents.items[0].contents.text === '$'
            ) {
                contents.items.slice(1).forEach((item) => {
                    if (item.contents.type === 'identifier') {
                        entries.push({
                            name: item.contents.text,
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
                for (let i = 0; i < contents.items.length; i += 2) {
                    const name = contents.items[i];
                    const value = contents.items[i + 1];
                    entries.push({
                        name:
                            name.contents.type === 'identifier'
                                ? name.contents.text
                                : name.contents.type === 'number'
                                ? name.contents.raw
                                : '_ignored_' + name.contents.type,
                        value: nodeToExpr(value, ctx),
                    });
                }
            }
            return { type: 'record', entries, form };
        }
        case 'list': {
            if (!contents.values.length) {
                return { type: 'record', entries: [], form };
            }
            const first = contents.values[0];
            if (first.contents.type === 'identifier') {
                if (specials[first.contents.text]) {
                    return specials[first.contents.text](
                        form,
                        contents.values.slice(1),
                        ctx,
                    );
                }
            }
            const [target, ...args] = contents.values.map((child) =>
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
    return {
        type: 'unresolved',
        form,
        reason: 'not impl ' + contents.type,
    };
};
