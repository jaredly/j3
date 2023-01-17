import { noloc } from '../to-ast/to-ast';
import { Node, Type } from '../types/ast';
import { RCtx, asTuple, id, loc } from './nodeForExpr';

export const nodeForType = (type: Type, ctx: RCtx): Node => {
    switch (type.type) {
        case 'builtin':
            return {
                loc: type.form.loc,
                type: 'identifier',
                text: type.name,
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
                type: 'number',
                raw: type.value.toString(),
            };
        case 'tag':
            if (type.args.length === 0) {
                return { type: 'tag', text: type.name, loc: type.form.loc };
            }
            return {
                loc: type.form.loc,
                type: 'list',
                values: [
                    {
                        loc: noloc,
                        type: 'tag',
                        text: type.name,
                    },
                    ...type.args.map((arg) => nodeForType(arg, ctx)),
                ],
            };
        case 'record':
            const tuple = asTuple(type);
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
                values: type.entries.flatMap(({ name, value }) => [
                    id(name, noloc),
                    nodeForType(value, ctx),
                ]),
            });
        case 'tfn': {
            const map: { [key: number]: string } = {};
            return loc(type.form.loc, {
                type: 'list',
                values: [
                    id('tfn', noloc),
                    loc(noloc, {
                        type: 'array',
                        values: type.args.flatMap((arg) => {
                            map[arg.sym] = arg.name;
                            return [
                                id(
                                    ctx.reverseNames[arg.sym] ?? arg.name,
                                    noloc,
                                ),
                                ...(arg.bound
                                    ? [nodeForType(arg.bound, ctx)]
                                    : []),
                            ];
                        }),
                    }),
                    nodeForType(type.body, {
                        ...ctx,
                        reverseNames: { ...ctx.reverseNames, ...map },
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
            return type.form;
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
                type: 'identifier',
                text: ctx.reverseNames[type.hash],
                loc: type.form.loc,
            };
        case 'local':
            return {
                type: 'identifier',
                // hmmm ok can't count on localMap
                // if the type variable is from
                // something I didn't just evaluate
                // 🤔
                // Does that apply to local values?
                // no just types I think.
                text: ctx.reverseNames[type.sym] ?? `tvar${type.sym}`,
                loc: type.form.loc,
            };
    }
    throw new Error(`cannot nodeForType ${(type as any).type}`);
};
