// import { Node } from '../types/cst';
// import { TVar, Type, TypeArg } from '../types/ast';
// import { resolveType } from './resolveType';
// import { Ctx, any, nilt } from './Ctx';
// import { filterComments, maybeParseNumber } from './nodeToExpr';
// import { err } from './nodeToPattern';
// import { CstCtx } from './library';

// export const nodeToType = (form: Node, ctx: CstCtx): Type => {
//     switch (form.type) {
//         case 'unparsed':
//             return nilt;
//         case 'identifier': {
//             return (
//                 maybeParseNumber(form, ctx) ??
//                 resolveType(form.text, undefined, ctx, form)
//             );
//         }
//         case 'hash':
//             return resolveType('', form.hash, ctx, form);
//         case 'recordAccess': {
//             err(ctx.results.errors, form, {
//                 type: 'misc',
//                 message: 'recordAccess, why are you doing this',
//                 form,
//             });
//             return nilt;
//         }
//         case 'blank':
//             return nilt;
//         case 'string':
//             return {
//                 type: 'string',
//                 first: { text: form.first.text, form: form.first },
//                 templates: form.templates.map(({ expr, suffix }) => ({
//                     type: nodeToType(expr, ctx),
//                     suffix: { text: suffix.text, form: suffix },
//                 })),
//                 form,
//             };
//         case 'array': {
//             let open = false;
//             const items = filterComments(form.values)
//                 .filter((t) => {
//                     if (t.type === 'spread' && t.contents.type === 'blank') {
//                         open = true;
//                         return false;
//                     }
//                     return true;
//                 })
//                 .map((value) => nodeToType(value, ctx));

//             return {
//                 type: 'union',
//                 form,
//                 open,
//                 items,
//             };
//         }
//         case 'record': {
//             const values = filterComments(form.values);
//             const entries: { name: string; value: Type }[] = [];
//             const spreads: Type[] = [];
//             let open = false;

//             for (let i = 0; i < values.length; ) {
//                 const name = values[i];
//                 if (name.type === 'spread') {
//                     if (name.contents.type === 'blank') {
//                         i++;
//                         open = true;
//                         continue;
//                     }
//                     spreads.push(nodeToType(name.contents, ctx));
//                     i++;
//                     continue;
//                 }

//                 const value = values[i + 1];
//                 i += 2;

//                 if (name.type !== 'identifier') {
//                     err(ctx.results.errors, name, {
//                         type: 'misc',
//                         message: `record entry name must be an identifier`,
//                     });
//                     continue;
//                 }
//                 ctx.results.display[name.loc] = {
//                     style: { type: 'record-attr' },
//                 };
//                 entries.push({
//                     name: name.text,
//                     value: value ? nodeToType(value, ctx) : nilt,
//                 });
//             }
//             return { type: 'record', form, entries, spreads, open };
//         }
//         case 'list': {
//             const values = filterComments(form.values);
//             if (!values.length) {
//                 return { ...nilt, form };
//             }
//             const first = values[0];
//             const args = values.slice(1);
//             if (first.type === 'identifier' && first.text.startsWith("'")) {
//                 ctx.results.display[first.loc] = { style: { type: 'tag' } };
//                 return {
//                     type: 'tag',
//                     form,
//                     name: first.text.slice(1),
//                     args: args.map((arg) => nodeToType(arg, ctx)),
//                 };
//             }

//             if (first.type === 'identifier' && first.text === '@task') {
//                 // (@task [] res)
//                 // We'll require that things actually be expandable
//                 // right?
//                 // well, so there's trickyness around ...
//                 // type variables. Right?
//                 //
//                 // (@task [('log string ()) ('read () string) ('fail string)])
//                 // becomes
//                 // (@loop [
//                 // ('Return ())
//                 // ('log string (fn [()] @recur))
//                 // ('read () (fn [string] @recur))
//                 // ('fail string ())
//                 // ])
//                 //
//                 return {
//                     type: 'task',
//                     form,
//                     effects: args.length ? nodeToType(args[0], ctx) : nilt,
//                     result: args.length > 1 ? nodeToType(args[1], ctx) : nilt,
//                     extraReturnEffects:
//                         args.length > 2 ? nodeToType(args[2], ctx) : void 0,
//                 };
//             }

//             if (first.type === 'identifier' && first.text === '@loop') {
//                 if (!args.length || args.length !== 1) {
//                     err(ctx.results.errors, first, {
//                         type: 'misc',
//                         message: '@loop requires exactly one argument',
//                         form,
//                     });
//                     return {
//                         type: 'unresolved',
//                         reason: 'bad @loop',
//                         form,
//                     };
//                 }
//                 return {
//                     type: 'loop',
//                     form,
//                     inner: nodeToType(args[0], {
//                         ...ctx,
//                         local: {
//                             ...ctx.local,
//                             loopType: { sym: form.loc },
//                         },
//                     }),
//                 };
//             }

//             if (first.type === 'identifier' && first.text === 'fn') {
//                 const targs = args.shift()!;
//                 if (!targs || targs.type !== 'array') {
//                     // return {
//                     //     // type: 'unresolved',
//                     //     // form,
//                     //     // reason: `fn needs array as second item`,
//                     //     type: 'any',
//                     //     form,
//                     // };
//                     return {
//                         type: 'fn',
//                         args: [],
//                         body: any,
//                         form,
//                     };
//                 }
//                 const tvalues = filterComments(targs.values);
//                 const parsed = tvalues.map((arg) => {
//                     if (arg.type === 'annot') {
//                         if (arg.target.type === 'identifier') {
//                             return {
//                                 type: nodeToType(arg.annot, ctx),
//                                 name: arg.target.text,
//                                 form: arg,
//                             };
//                         } else {
//                             err(ctx.results.errors, arg.target, {
//                                 type: 'misc',
//                                 message: 'nope',
//                                 form: arg.target,
//                                 path: [],
//                             });
//                             return {
//                                 type: nodeToType(arg.annot, ctx),
//                                 form: arg,
//                             };
//                         }
//                     }
//                     return { type: nodeToType(arg, ctx), form: arg };
//                 });
//                 return {
//                     type: 'fn',
//                     args: parsed,
//                     body: args.length ? nodeToType(args[0], ctx) : any,
//                     form,
//                 };
//             }

//             if (first.type === 'identifier' && first.text === 'tfn') {
//                 const targs = args.shift()!;
//                 if (!targs || targs.type !== 'array') {
//                     return {
//                         type: 'unresolved',
//                         form,
//                         reason: `tfn needs array as second item`,
//                     };
//                 }
//                 const tvalues = filterComments(targs.values);
//                 const parsed = parseTypeArgs(tvalues, ctx);
//                 return {
//                     type: 'tfn',
//                     args: parsed,
//                     body: args.length
//                         ? nodeToType(args[0], {
//                               ...ctx,
//                               local: {
//                                   ...ctx.local,
//                                   types: [...parsed, ...ctx.local.types],
//                               },
//                           })
//                         : nilt,
//                     form,
//                 };
//             }
//             return {
//                 type: 'apply',
//                 target: nodeToType(first, ctx),
//                 args: args.map((arg) => nodeToType(arg, ctx)),
//                 form,
//             };
//         }
//     }
//     throw new Error(`nodeToType can't handle ${form.type}`);
// };

// export function parseTypeArgs(tvalues: Node[], ctx: CstCtx) {
//     const parsed = tvalues
//         .map((arg) => {
//             if (arg.type === 'annot') {
//                 if (arg.target.type !== 'identifier') {
//                     err(ctx.results.errors, arg, {
//                         type: 'misc',
//                         message: `tfn arg must be an identifier`,
//                     });
//                     return null;
//                 }
//                 return {
//                     name: arg.target.text,
//                     bound: nodeToType(arg.annot, ctx),
//                     sym: arg.loc,
//                     form: arg,
//                 };
//             }
//             if (arg.type !== 'identifier') {
//                 err(ctx.results.errors, arg, {
//                     type: 'misc',
//                     message: `tfn arg must be an identifier`,
//                 });
//                 return null;
//             }
//             return {
//                 name: arg.text,
//                 sym: arg.loc,
//                 form: arg,
//             };
//         })
//         .filter(Boolean) as TypeArg[];
//     parsed.forEach((targ) => (ctx.results.localMap.types[targ.sym] = targ));
//     return parsed;
// }
