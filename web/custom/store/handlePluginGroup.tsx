import { NUIState, RealizedNamespace } from '../UIState';
import { FullEvalator } from '../../ide/ground-up/FullEvalator';
import { NUIResults } from './Store';
import { Path } from '../../store';
// import { ResultsEnv, processPlugin } from './getResults';
import { displayFunction } from './displayFunction';
import { DepsOrNoDeps, ResultsCache, ChangesMap } from './ResultsCache';

// export function cacheEvaluation<Stmt>(
//     group: DepsOrNoDeps[],
//     results: NUIResults,
//     cache: ResultsCache<Stmt>,
// ) {
//     group.forEach((node) => {
//         results.produce[node.id] = cache.results[node.id].produce;
//         if (cache.results[node.id].pluginResult) {
//             results.pluginResults[node.id] =
//                 cache.results[node.id].pluginResult;
//         }
//         if (!node.names) {
//             Object.assign(results.env.values, cache.results[node.id].values);
//         } else {
//             node.names.forEach(({ name, kind }) => {
//                 if (kind === 'value') {
//                     results.env.values[name] =
//                         cache.results[node.id].values[name];
//                 }
//             });
//         }
//     });
// }

// export function evaluateGroup<
//     Env extends { values: { [key: string]: any } },
//     Stmt,
//     Expr,
// >(
//     stuff: ResultsEnv<Stmt, Env, Expr>,
//     group: DepsOrNoDeps[],
//     stmts: { [key: number]: Stmt },
// ) {
//     const displayConfig =
//         group.length === 1 ? stuff.topsById[group[0].id].ns.display : undefined;
//     const renderValue = displayFunction(displayConfig);

//     const { env, display, values } = stuff.evaluator.addStatements(
//         stmts,
//         stuff.results.env as any,
//         stuff.state.meta,
//         stuff.results.traces,
//         renderValue,
//     );
//     group.forEach((node) => {
//         const prev = stuff.results.produce[node.id] ?? [];
//         stuff.results.produce[node.id] = [
//             ...prev,
//             ...(Array.isArray(display[node.id])
//                 ? (display[node.id] as any)
//                 : [display[node.id]]),
//         ];
//         if (!node.names) {
//             Object.assign(stuff.results.env.values, values);
//         } else {
//             node.names?.forEach(({ name, kind }) => {
//                 if (kind === 'value') {
//                     stuff.results.env.values[name] = values[name];
//                 }
//             });
//         }

//         stuff.cache.results[node.id] = {
//             produce: stuff.results.produce[node.id],
//             ts: Date.now(),
//             values,
//         };
//         stuff.changes[node.id].value = true;
//     });
// }

// export function handlePluginGroup<
//     Env extends { values: { [key: string]: any } },
//     Stmt,
//     Expr,
// >(group: DepsOrNoDeps[], env: ResultsEnv<Stmt, Env, Expr>) {
//     for (let node of group) {
//         const reRun =
//             env.changes[node.id].ns ||
//             env.changes[node.id].source ||
//             !env.cache.results[node.id] ||
//             !node.deps ||
//             node.deps.some((id) => env.changes[env.idForName[id.name]]?.value);

//         if (reRun) {
//             let pluginResult;
//             if (env.topsById[node.id].ns.plugin) {
//                 // console.log('Doing a plugin', topsById[node.id].plugin);
//                 pluginResult = processPlugin(
//                     env.results,
//                     env.cache.nodes[node.id].node,
//                     env.topsById[node.id].ns.plugin!,
//                     env.state,
//                     env.evaluator,
//                 );
//                 env.results.pluginResults[node.id] = pluginResult;
//             }

//             env.cache.results[node.id] = {
//                 produce: env.results.produce[node.id],
//                 ts: Date.now(),
//                 values: {},
//                 pluginResult,
//             };
//             env.changes[node.id].value = true;
//         } else {
//             env.results.pluginResults[node.id] =
//                 env.cache.results[node.id].pluginResult;
//         }
//     }
// }
