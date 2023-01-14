import { Node } from '../types/cst';
import { Type } from '../types/ast';
import { Ctx, resolveType, nilt, nextSym } from './to-ast';
import { filterComments } from './nodeToExpr';
import { err } from './nodeToPattern';

export const nodeToType = (form: Node, ctx: Ctx): Type => {
    switch (form.type) {
        case 'identifier': {
            return resolveType(form.text, form.hash, ctx, form);
        }
        case 'number':
            return {
                type: 'number',
                form,
                kind: form.raw.includes('.') ? 'float' : 'int',
                value: +form.raw,
            };
        case 'array':
            return {
                type: 'union',
                form,
                open: false,
                items: filterComments(form.values).map((value) =>
                    nodeToType(value, ctx),
                ),
            };
        case 'tag':
            return {
                type: 'tag',
                form,
                name: form.text,
                args: [],
            };
        case 'record': {
            const values = filterComments(form.values);
            const entries = [];
            for (let i = 0; i < values.length; i += 2) {
                const name = values[i];
                const value = values[i + 1];
                if (name.type !== 'identifier') {
                    err(ctx.errors, name, {
                        type: 'misc',
                        message: `record entry name must be an identifier`,
                    });
                    continue;
                }
                ctx.styles[name.loc.idx] = 'italic';
                entries.push({
                    name: name.text,
                    value: value ? nodeToType(value, ctx) : nilt,
                });
            }
            return {
                type: 'record',
                form,
                entries,
                open: false,
            };
        }
        case 'list': {
            if (!form.values.length) {
                return { ...nilt, form };
            }
            const values = filterComments(form.values);
            const first = values[0];
            const args = values.slice(1);
            if (first.type === 'tag') {
                return {
                    type: 'tag',
                    form,
                    name: first.text,
                    args: args.map((arg) => nodeToType(arg, ctx)),
                };
            }
            if (first.type === 'identifier' && first.text === 'tfn') {
                const targs = args.shift()!;
                if (targs.type !== 'array') {
                    return {
                        type: 'unresolved',
                        form,
                        reason: `tfn needs array as second item`,
                    };
                }
                const tvalues = filterComments(targs.values);
                const parsed = tvalues.map((arg) => {
                    // const type = nodeToType(arg, ctx)
                    return {
                        name: arg.type === 'identifier' ? arg.text : 'NOPE',
                        sym: nextSym(ctx),
                        form: arg,
                    };
                });
                parsed.forEach((targ) => (ctx.localMap.types[targ.sym] = targ));
                return {
                    type: 'tfn',
                    args: parsed,
                    body: nodeToType(args[0], {
                        ...ctx,
                        local: {
                            ...ctx.local,
                            types: [...parsed, ...ctx.local.types],
                        },
                    }),
                    form,
                };
            }
            return {
                type: 'apply',
                target: nodeToType(first, ctx),
                args: args.map((arg) => nodeToType(arg, ctx)),
                form,
            };
        }
    }
    throw new Error(`nodeToType can't handle ${form.type}`);
};
