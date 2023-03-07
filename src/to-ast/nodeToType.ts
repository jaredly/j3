import { Node } from '../types/cst';
import { Type } from '../types/ast';
import { resolveType, nextSym } from './to-ast';
import { Ctx, nilt } from './Ctx';
import { filterComments } from './nodeToExpr';
import { err } from './nodeToPattern';

export const nodeToType = (form: Node, ctx: Ctx): Type => {
    switch (form.type) {
        case 'unparsed':
            return nilt;
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
            ctx.display[form.loc.idx] = { style: { type: 'tag' } };
            return {
                type: 'tag',
                form,
                name: form.text,
                args: [],
            };
        case 'record': {
            const values = filterComments(form.values);
            const entries: { name: string; value: Type }[] = [];
            const spreads: Type[] = [];

            for (let i = 0; i < values.length; ) {
                const name = values[i];
                if (name.type === 'spread') {
                    spreads.push(nodeToType(name.contents, ctx));
                    i++;
                    continue;
                }

                const value = values[i + 1];
                i += 2;

                if (name.type !== 'identifier' && name.type !== 'number') {
                    err(ctx.errors, name, {
                        type: 'misc',
                        message: `record entry name must be an identifier`,
                    });
                    continue;
                }
                ctx.display[name.loc.idx] = { style: { type: 'record-attr' } };
                entries.push({
                    name: name.type === 'number' ? name.raw : name.text,
                    value: value ? nodeToType(value, ctx) : nilt,
                });
            }
            return {
                type: 'record',
                form,
                entries,
                spreads,
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
                ctx.display[first.loc.idx] = { style: { type: 'tag' } };
                return {
                    type: 'tag',
                    form,
                    name: first.text,
                    args: args.map((arg) => nodeToType(arg, ctx)),
                };
            }

            if (first.type === 'identifier' && first.text === 'fn') {
                const targs = args.shift()!;
                if (targs.type !== 'array') {
                    return {
                        type: 'unresolved',
                        form,
                        reason: `fn needs array as second item`,
                    };
                }
                const tvalues = filterComments(targs.values);
                const parsed = tvalues.map((arg) => {
                    return nodeToType(arg, ctx);
                });
                return {
                    type: 'fn',
                    args: parsed,
                    body: nodeToType(args[0], ctx),
                    form,
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
