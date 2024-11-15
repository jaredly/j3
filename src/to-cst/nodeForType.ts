// import { Ctx, noloc } from '../to-ast/Ctx';
// import { FnType, Node, TfnType, Type } from '../types/ast';
// import { asTuple, id, loc } from './nodeForExpr';

// export const nodeForType = (type: Type, hashNames: Ctx['hashNames']): Node => {
//     switch (type.type) {
//         case 'none':
//             return { type: 'identifier', text: '⍉', loc: type.form.loc };
//         case 'any':
//             return { type: 'identifier', text: '𝕌', loc: type.form.loc };
//         case 'builtin':
//             return {
//                 loc: type.form.loc,
//                 type: 'hash',
//                 hash: `:builtin:${type.name}`,
//             };
//         case 'bool':
//             return {
//                 loc: type.form.loc,
//                 type: 'identifier',
//                 text: type.value ? 'true' : 'false',
//             };
//         case 'number':
//             return {
//                 loc: type.form.loc,
//                 type: 'identifier',
//                 text:
//                     type.value.toString() +
//                     (type.kind === 'float' &&
//                     !type.value.toString().includes('.')
//                         ? '.'
//                         : '') +
//                     (type.kind === 'uint' ? 'u' : ''),
//             };
//         case 'task':
//             return {
//                 type: 'list',
//                 loc: type.form.loc,
//                 values: [
//                     id('@task', type.form.loc),
//                     nodeForType(type.effects, hashNames),
//                     nodeForType(type.result, hashNames),
//                     type.extraReturnEffects
//                         ? nodeForType(type.extraReturnEffects, hashNames)
//                         : null,
//                 ].filter(Boolean) as Node[],
//             };
//         case 'tag':
//             if (type.args.length === 0) {
//                 return {
//                     type: 'identifier',
//                     text: "'" + type.name,
//                     loc: type.form.loc,
//                 };
//             }
//             return {
//                 loc: type.form.loc,
//                 type: 'list',
//                 values: [
//                     {
//                         loc: noloc,
//                         type: 'identifier',
//                         text: "'" + type.name,
//                     },
//                     ...type.args.map((arg) => nodeForType(arg, hashNames)),
//                 ],
//             };
//         case 'string': {
//             return {
//                 type: 'string',
//                 first: {
//                     text: type.first.text,
//                     loc: type.first.form.loc,
//                     type: 'stringText',
//                 },
//                 templates: type.templates.map(({ type, suffix }) => ({
//                     expr: nodeForType(type, hashNames),
//                     suffix: {
//                         type: 'stringText',
//                         text: suffix.text,
//                         loc: suffix.form.loc,
//                     },
//                 })),
//                 loc: type.form.loc,
//             };
//         }
//         case 'record':
//             const tuple = asTuple(type);
//             if (tuple) {
//                 return {
//                     loc: type.form.loc,
//                     type: 'list',
//                     values:
//                         tuple.length === 0
//                             ? []
//                             : [
//                                   id(',', noloc),
//                                   ...tuple.map((t) =>
//                                       nodeForType(t, hashNames),
//                                   ),
//                               ],
//                 };
//             }
//             return loc(type.form.loc, {
//                 type: 'record',
//                 values: [
//                     ...type.spreads.map(
//                         (spread): Node => ({
//                             type: 'spread',
//                             contents: nodeForType(spread, hashNames),
//                             loc: spread.form.loc,
//                         }),
//                     ),
//                     ...type.entries.flatMap(({ name, value }) => [
//                         id(name, noloc),
//                         nodeForType(value, hashNames),
//                     ]),
//                     ...(type.open ? [id('..', -1)] : []),
//                 ],
//             });
//         case 'tfn': {
//             const map: { [key: number]: string } = {};
//             if (type.body.type === 'fn') {
//                 return {
//                     type: 'list',
//                     loc: type.form.loc,
//                     values: [
//                         {
//                             type: 'tapply',
//                             target: id('fn', noloc),
//                             loc: type.form.loc,
//                             values: typeArgs(type.args, map, hashNames),
//                         },
//                         {
//                             type: 'array',
//                             values: fnArgs(type.body.args, hashNames),
//                             loc: -1,
//                         },
//                         nodeForType(type.body.body, hashNames),
//                     ],
//                 };
//             }
//             return loc(type.form.loc, {
//                 type: 'list',
//                 values: [
//                     id('tfn', noloc),
//                     loc(noloc, {
//                         type: 'array',
//                         values: typeArgs(type.args, map, hashNames),
//                     }),
//                     nodeForType(type.body, hashNames),
//                 ],
//             });
//         }
//         case 'fn': {
//             return loc(type.form.loc, {
//                 type: 'list',
//                 values: [
//                     id('fn', noloc),
//                     loc(noloc, {
//                         type: 'array',
//                         values: fnArgs(type.args, hashNames),
//                     }),
//                     nodeForType(type.body, hashNames),
//                 ],
//             });
//         }
//         case 'loop':
//             return {
//                 type: 'list',
//                 loc: type.form.loc,
//                 values: [
//                     id('@loop', type.form.loc),
//                     nodeForType(type.inner, hashNames),
//                 ],
//             };
//         case 'recur':
//             return { type: 'identifier', text: '@recur', loc: type.form.loc };
//         case 'unresolved':
//             // return type.form;
//             return {
//                 type: 'identifier',
//                 text: 'unresolved ' + JSON.stringify(type.form),
//                 loc: type.form.loc,
//             };
//         case 'union':
//             if (type.items.length === 1) {
//                 return nodeForType(type.items[0], hashNames);
//             }
//             return loc(type.form.loc, {
//                 type: 'array',
//                 values: type.items
//                     .map((item) => nodeForType(item, hashNames))
//                     .concat(
//                         type.open
//                             ? [
//                                   {
//                                       type: 'spread',
//                                       contents: { type: 'blank', loc: -1 },
//                                       loc: -1,
//                                   },
//                               ]
//                             : [],
//                     ),
//             });
//         case 'apply':
//             return loc(type.form.loc, {
//                 type: 'list',
//                 values: [
//                     nodeForType(type.target, hashNames),
//                     ...type.args.map((arg) => nodeForType(arg, hashNames)),
//                 ],
//             });
//         case 'toplevel':
//             return {
//                 type: 'hash',
//                 hash: type.hash,
//                 loc: type.form.loc,
//             };
//         case 'global':
//             return {
//                 type: 'hash',
//                 hash: type.hash,
//                 loc: type.form.loc,
//             };
//         case 'local':
//             return {
//                 type: 'hash',
//                 hash: type.sym,
//                 // type: 'identifier',
//                 // // hmmm ok can't count on localMap
//                 // // if the type variable is from
//                 // // something I didn't just evaluate
//                 // // 🤔
//                 // // Does that apply to local values?
//                 // // no just types I think.
//                 // // ctx.reverseNames[type.sym] ??
//                 // text:
//                 // ctx.hashNames
//                 // `tvar${type.sym}`,
//                 loc: type.form.loc,
//             };
//         // case 'error':
//         //     return {
//         //         type: 'identifier',
//         //         text: JSON.stringify(type),
//         //         loc: type.loc,
//         //     };
//     }
//     throw new Error(`cannot nodeForType ${(type as any).type}`);
// };

// function fnArgs(
//     args: FnType['args'],
//     hashNames: { [idx: number]: string },
// ): Node[] {
//     return args.map((arg) =>
//         arg.name
//             ? {
//                   type: 'annot',
//                   annot: nodeForType(arg.type, hashNames),
//                   loc: arg.form.loc,
//                   target: id(arg.name, arg.form.loc),
//               }
//             : nodeForType(arg.type, hashNames),
//     );
// }

// function typeArgs(
//     args: TfnType['args'],
//     map: { [key: number]: string },
//     hashNames: { [idx: number]: string },
// ): Node[] {
//     return args.map((arg): Node => {
//         map[arg.form.loc] = arg.name;
//         hashNames[arg.form.loc] = arg.name;
//         const name = id(arg.name, noloc);
//         return arg.bound
//             ? {
//                   type: 'annot',
//                   target: name,
//                   annot: nodeForType(arg.bound, hashNames),
//                   loc: noloc,
//               }
//             : name;
//     });
// }
