import { Ctx, noloc } from '../to-ast/Ctx';
import { Node, Type } from '../types/ast';
import { asTuple, id, loc } from './nodeForExpr';

export const nodeForType = (type: Type, hashNames: Ctx['hashNames']): Node => {
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
                    ...type.args.map((arg) => nodeForType(arg, hashNames)),
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
                    expr: nodeForType(type, hashNames),
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
                                  ...tuple.map((t) =>
                                      nodeForType(t, hashNames),
                                  ),
                              ],
                };
            }
            return loc(type.form.loc, {
                type: 'record',
                values: [
                    ...type.spreads.map(
                        (spread): Node => ({
                            type: 'spread',
                            contents: nodeForType(spread, hashNames),
                            loc: spread.form.loc,
                        }),
                    ),
                    ...type.entries.flatMap(({ name, value }) => [
                        id(name, noloc),
                        nodeForType(value, hashNames),
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
                            hashNames[arg.form.loc.idx] = arg.name;
                            const name = id(arg.name, noloc);
                            return [
                                arg.bound
                                    ? {
                                          type: 'annot',
                                          target: name,
                                          annot: nodeForType(
                                              arg.bound,
                                              hashNames,
                                          ),
                                          loc: noloc,
                                      }
                                    : name,
                            ];
                        }),
                    }),
                    nodeForType(type.body, hashNames),
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
                        values: type.args.map((arg) =>
                            arg.name
                                ? {
                                      type: 'annot',
                                      annot: nodeForType(arg.type, hashNames),
                                      loc: arg.form.loc,
                                      target: id(arg.name, arg.form.loc),
                                  }
                                : nodeForType(arg.type, hashNames),
                        ),
                    }),
                    nodeForType(type.body, hashNames),
                ],
            });
        }
        case 'unresolved':
            // return type.form;
            return {
                type: 'identifier',
                text: 'unresolved ' + JSON.stringify(type.form),
                loc: type.form.loc,
            };
        case 'union':
            return loc(type.form.loc, {
                type: 'array',
                values: type.items
                    .map((item) => nodeForType(item, hashNames))
                    .concat(type.open ? [id('...', noloc)] : []),
            });
        case 'apply':
            return loc(type.form.loc, {
                type: 'list',
                values: [
                    nodeForType(type.target, hashNames),
                    ...type.args.map((arg) => nodeForType(arg, hashNames)),
                ],
            });
        case 'toplevel':
            return {
                type: 'hash',
                hash: type.hash,
                loc: type.form.loc,
            };
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
