import { Ctx, noloc } from '../to-ast/Ctx';
import { Node, Type } from '../types/ast';
import { asTuple, id, loc } from './nodeForExpr';

export const nodeForType = (type: Type, ctx: Ctx): Node => {
    switch (type.type) {
        case 'none':
            return { type: 'identifier', text: '⍉', loc: type.form.loc };
        case 'any':
            return { type: 'identifier', text: '𝕌', loc: type.form.loc };
        case 'builtin':
            return {
                loc: type.form.loc,
                type: 'hash',
                hash: `:builtin:${type.name}`,
            };
        case 'bool':
            return {
                loc: type.form.loc,
                type: 'identifier',
                text: type.value ? 'true' : 'false',
            };
        case 'number':
            return {
                loc: type.form.loc,
                type: 'identifier',
                text:
                    type.value.toString() +
                    (type.kind === 'float' &&
                    !type.value.toString().includes('.')
                        ? '.'
                        : '') +
                    (type.kind === 'uint' ? 'u' : ''),
            };
        case 'tag':
            if (type.args.length === 0) {
                return {
                    type: 'identifier',
                    text: "'" + type.name,
                    loc: type.form.loc,
                };
            }
            return {
                loc: type.form.loc,
                type: 'list',
                values: [
                    {
                        loc: noloc,
                        type: 'identifier',
                        text: "'" + type.name,
                    },
                    ...type.args.map((arg) => nodeForType(arg, ctx)),
                ],
            };
        case 'string': {
            return {
                type: 'string',
                first: {
                    text: type.first.text,
                    loc: type.first.form.loc,
                    type: 'stringText',
                },
                templates: type.templates.map(({ type, suffix }) => ({
                    expr: nodeForType(type, ctx),
                    suffix: {
                        type: 'stringText',
                        text: suffix.text,
                        loc: suffix.form.loc,
                    },
                })),
                loc: type.form.loc,
            };
        }
        case 'record':
            const tuple = asTuple(type, ctx);
            if (tuple) {
                return {
                    loc: type.form.loc,
                    type: 'list',
                    values:
                        tuple.length === 0
                            ? []
                            : [
                                  id(',', noloc),
                                  ...tuple.map((t) => nodeForType(t, ctx)),
                              ],
                };
            }
            return loc(type.form.loc, {
                type: 'record',
                values: [
                    ...type.spreads.map(
                        (spread): Node => ({
                            type: 'spread',
                            contents: nodeForType(spread, ctx),
                            loc: spread.form.loc,
                        }),
                    ),
                    ...type.entries.flatMap(({ name, value }) => [
                        id(name, noloc),
                        nodeForType(value, ctx),
                    ]),
                ],
            });
        case 'tfn': {
            const map: { [key: number]: string } = {};
            return loc(type.form.loc, {
                type: 'list',
                values: [
                    id('tfn', noloc),
                    loc(noloc, {
                        type: 'array',
                        values: type.args.flatMap((arg): Node[] => {
                            map[arg.form.loc.idx] = arg.name;
                            ctx.hashNames[arg.form.loc.idx] = arg.name;
                            const name = id(arg.name, noloc);
                            return [
                                arg.bound
                                    ? {
                                          type: 'annot',
                                          target: name,
                                          annot: nodeForType(arg.bound, ctx),
                                          loc: noloc,
                                      }
                                    : name,
                            ];
                        }),
                    }),
                    nodeForType(type.body, {
                        ...ctx,
                        // reverseNames: { ...ctx.reverseNames, ...map },
                    }),
                ],
            });
        }
        case 'fn': {
            return loc(type.form.loc, {
                type: 'list',
                values: [
                    id('fn', noloc),
                    loc(noloc, {
                        type: 'array',
                        values: type.args.map((arg) => nodeForType(arg, ctx)),
                    }),
                    nodeForType(type.body, ctx),
                ],
            });
        }
        case 'unresolved':
            // return type.form;
            return {
                type: 'identifier',
                text: JSON.stringify(type.form),
                loc: type.form.loc,
            };
        case 'union':
            return loc(type.form.loc, {
                type: 'array',
                values: type.items
                    .map((item) => nodeForType(item, ctx))
                    .concat(type.open ? [id('...', noloc)] : []),
            });
        case 'apply':
            return loc(type.form.loc, {
                type: 'list',
                values: [
                    nodeForType(type.target, ctx),
                    ...type.args.map((arg) => nodeForType(arg, ctx)),
                ],
            });
        case 'global':
            return {
                type: 'hash',
                hash: type.hash,
                loc: type.form.loc,
            };
        case 'local':
            return {
                type: 'hash',
                hash: type.sym,
                // type: 'identifier',
                // // hmmm ok can't count on localMap
                // // if the type variable is from
                // // something I didn't just evaluate
                // // 🤔
                // // Does that apply to local values?
                // // no just types I think.
                // // ctx.reverseNames[type.sym] ??
                // text:
                // ctx.hashNames
                // `tvar${type.sym}`,
                loc: type.form.loc,
            };
    }
    throw new Error(`cannot nodeForType ${(type as any).type}`);
};
