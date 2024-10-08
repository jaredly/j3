// import { EvalCtx, Store } from './store';
// export const builtins = {
//     toString: (t: number | boolean) => t + '',
//     debugToString: (t: any) => JSON.stringify(t),
//     has_prefix_: (a: string, b: string) => a.startsWith(b),
// };

// export const compile = (store: Store, ectx: EvalCtx) => {
//     throw new Error('nop');
// };
// export const compile = (store: Store, ectx: EvalCtx) => {
//     let { ctx, last, terms, nodes, results } = ectx;
//     const root = store.map[store.root] as ListLikeContents;

//     const prevErrors = ectx.report.errors;
//     const prevResults = { ...results };

//     ectx.report.errors = {};
//     const allStyles: Ctx['display'] = {};
//     const prevStyles = ctx.display;

//     // const usedHashes: { [hash: string]: number[] } = {};
//     // Object.keys(store.map).forEach((ridx) => {
//     //     const idx = +ridx;
//     //     const node = store.map[idx];
//     //     if (node.type === 'identifier' && node.hash) {
//     //         if (!usedHashes[node.hash]) {
//     //             usedHashes[node.hash] = [];
//     //         }
//     //         usedHashes[node.hash].push(idx);
//     //     }
//     // });

//     const updateMap: UpdateMap = {};
//     const tmpMap: Map = { ...store.map };

//     root.values.forEach((idx) => {
//         if (tmpMap[idx].type === 'comment' || tmpMap[idx].type === 'blank') {
//             results[idx] = {
//                 status: 'success',
//                 value: undefined,
//                 code: '// a comment',
//                 type: undefined,
//                 expr: nil,
//                 display: {},
//             };
//             return;
//         }

//         const node = fromMCST(idx, tmpMap);

//         const report: Report = { errors: {}, types: {} };
//         ctx.errors = report.errors;
//         ctx.display = {};
//         ctx.mods = {};

//         const res = any; // nodeToExpr(node, ctx);
//         const hash = objectHash(noForm(res));

//         layout(idx, 0, tmpMap, ctx.display, true);

//         if (last[idx] === hash) {
//             console.log('no hash change');
//             const prev = results[idx];
//             if (prev.status === 'errors') {
//                 Object.assign(ectx.report.errors, prev.errors);
//             }
//             Object.assign(ectx.report.errors, report.errors);
//             prev.display = ctx.display;
//             Object.assign(allStyles, prev.display);
//             return;
//         }
//         // console.log('recomputing and such');

//         const prevHashes = getHashes(nodes[idx]);

//         ctx = rmPrevious(ctx, nodes[idx]);

//         const resType = getType(res, ctx, report);
//         validateExpr(res, ctx, report.errors);

//         const hasErrors = Object.keys(report.errors).length > 0;

//         Object.assign(ectx.report.errors, report.errors);
//         Object.assign(ectx.report.types, report.types);
//         Object.assign(allStyles, ctx.display);

//         if (hasErrors) {
//             console.log('has errors', report.errors);
//             results[idx] = {
//                 status: 'errors',
//                 expr: res,
//                 errors: report.errors,
//                 display: ctx.display,
//             };
//             last[idx] = hash;
//             return;
//         }

//         let code = 'failed to generate';
//         // try {
//         const ts = stmtToTs(res, ctx, 'top');
//         code = generate(t.file(t.program([ts]))).code;
//         // } catch (err) {
//         //     code = `Generation fail ${err.message}`;
//         //     //
//         // }
//         // ok, so the increasing idx's are really coming to haunt me.
//         // can I reset them?
//         try {
//             const fn = new Function(
//                 '$terms',
//                 `{${Object.keys(builtins).join(',')}}`,
//                 'fail',
//                 code,
//             );
//             results[idx] = {
//                 status: 'success',
//                 value: fn(terms, builtins, (message: string) => {
//                     // console.log(`Encountered a compilation failure: `, message);
//                     throw new Error(message);
//                 }),
//                 type: resType,
//                 code,
//                 expr: res,
//                 display: ctx.display,
//             };
//             last[idx] = hash;
//         } catch (err) {
//             console.error(err);
//             results[idx] = {
//                 status: 'failure',
//                 error: (err as Error).message,
//                 code,
//                 expr: res,
//                 display: ctx.display,
//             };
//             last[idx] = hash;
//             return;
//         }

//         const newHashes = exprHashes(res);
//         // if (prevHashes) {
//         //     const newNames: { [key: string]: string } = {};
//         //     if (newHashes) {
//         //         Object.keys(newHashes).forEach(
//         //             (name) => (newNames[newHashes[name]] = name),
//         //         );
//         //     }
//         //     Object.entries(prevHashes).forEach(([name, hash]) => {
//         //         const newHash = newHashes?.[name];
//         //         if (newHash === hash || newNames[hash]) {
//         //             return;
//         //         }
//         //         // These are the idx's of identifiers
//         //         // that use the hash.
//         //         const idxs = usedHashes[hash];
//         //         if (idxs) {
//         //             idxs.forEach((idx) => {
//         //                 const node = tmpMap[idx] as Identifier & {
//         //                     loc: Loc;
//         //                 };
//         //                 updateMap[idx] = tmpMap[idx] = {
//         //                     ...node,
//         //                     hash: newHash,
//         //                 };
//         //             });
//         //         }
//         //     });
//         // }

//         ctx = addDef(res, ctx);
//         if (res.type === 'def') {
//             nodes[idx] = {
//                 type: 'Def',
//                 node: res.value,
//                 names: { [res.name]: res.hash },
//             };
//         }
//     });

//     const hashUpdates = Object.keys(updateMap);
//     if (hashUpdates.length) {
//         const last =
//             store.history.items[
//                 store.history.items.length - 1 - store.history.idx
//             ];
//         if (!last) {
//             throw new Error(
//                 `compile is changing things, but there's no history`,
//             );
//         }
//         hashUpdates.forEach((idx) => {
//             last.post[idx] = updateMap[idx];
//             if (!last.pre[idx]) {
//                 last.pre[idx] = store.map[+idx];
//             }
//             if (updateMap[idx] == null) {
//                 delete store.map[+idx];
//             } else {
//                 store.map[+idx] = updateMap[idx]!;
//             }
//         });
//         // console.log('changed', last, hashUpdates);
//     }

//     // Now figure out what's changed
//     const changed: { [key: number]: true } = {};
//     Object.keys(prevErrors).forEach((key) => {
//         if (!ectx.report.errors[+key]) {
//             changed[+key] = true;
//         }
//     });
//     Object.keys(ectx.report.errors).forEach((key) => {
//         if (!prevErrors[+key]) {
//             changed[+key] = true;
//         }
//     });

//     Object.keys(prevStyles).forEach((key) => {
//         if (allStyles[+key]?.style !== prevStyles[+key]?.style) {
//             changed[+key] = true;
//         }
//     });
//     Object.keys(allStyles).forEach((key) => {
//         if (allStyles[+key]?.style !== prevStyles[+key]?.style) {
//             changed[+key] = true;
//         }
//     });
//     Object.keys(results).forEach((key) => {
//         if (results[key] !== prevResults[key]) {
//             changed[+key] = true;
//         }
//     });
//     ctx.display = allStyles;

//     const keys = Object.keys(changed);
//     if (keys.length) {
//         notify(
//             store,
//             keys.map((k) => +k),
//         );
//     }

//     ectx.ctx = ctx;

//     // SSTART HERE: Log the HASHES of each toplevel thing
//     // console.log(root.values.map((idx) => ectx.results[idx]));
// };

// const getHashes = (node?: Toplevel): { [name: string]: string } | null => {
//     if (node?.type === 'Def') {
//         return node.names;
//     }
//     if (node?.type === 'Deftype') {
//         return node.names;
//     }
//     return null;
// };

// const exprHashes = (res: Expr): null | { [name: string]: string } => {
//     if (res.type === 'def') {
//         return { [res.name]: res.hash };
//     }
//     return null;
// };

// const rmPrevious = (ctx: Ctx, node?: EvalCtx['nodes'][0]): Ctx => {
//     if (!node) {
//         return ctx;
//     }
//     if (node.type === 'Def') {
//         const names = { ...ctx.global.names };
//         Object.keys(node.names).forEach((key) => {
//             names[key] = names[key].filter((h) => h !== node.names[key]);
//         });
//         return { ...ctx, global: { ...ctx.global, names } };
//     }
//     return ctx;
// };

// // const tryIt = <T,>(v: () => T, mod: (err: unknown) => void) => {
// //     try {
// //         return v();
// //     } catch (err) {
// //         console.eorr
// //         mod(err);
// //         throw err;
// //     }
// // };
