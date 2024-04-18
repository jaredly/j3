// import equal from 'fast-deep-equal';
// import { MyEvalError } from '../../ide/ground-up/Evaluators';
// import { DepsOrNoDeps } from './ResultsCache';
// import { ResultsEnv } from './getResults';

export const showError = (err: {
    message: string;
    items: { name: string; loc: number }[];
}) => {
    return `${err.message}${err.items
        .map((item) => `\n - ${item.name} (${item.loc})`)
        .join('')}`;
};

// export function processTypeInference<
//     Env extends { values: { [key: string]: any } },
//     Stmt,
//     Expr,
// >(
//     stmts: { [key: number]: Stmt },
//     group: DepsOrNoDeps[],
//     groupKey: string,
//     ids: number[],
//     env: ResultsEnv<Stmt, Env, Expr>,
// ) {
//     if (!env.evaluator.inference) return;
//     let result;
//     let typesAndLocs;
//     try {
//         ({ result, typesAndLocs } = env.evaluator.inference.infer(
//             Object.values(stmts),
//             env.results.tenv,
//         ));
//     } catch (err) {
//         group.forEach(
//             (node) =>
//                 (env.results.produce[node.id] = [
//                     {
//                         type: 'eval',
//                         message: 'Ugh something died',
//                         inner: (err as Error).message,
//                     },
//                 ]),
//         );
//         return true;
//     }

//     env.cache.hover[groupKey] = {};
//     typesAndLocs.forEach(({ loc, type }) => {
//         if (!env.cache.hover[groupKey][loc]) {
//             env.cache.hover[groupKey][loc] = [];
//         }
//         // Sooo it would be really nice to be able to
//         // do some "click to jump" on the type. ...
//         // not totally sure how quite to do it.
//         env.cache.hover[groupKey][loc].push(
//             env.evaluator.inference!.typeToString(type),
//         );
//     });

//     Object.assign(env.results.hover, env.cache.hover[groupKey]);

//     if (result.type !== 'ok') {
//         delete env.cache.types[groupKey];

//         const text = showError(result.err);

//         result.err.items.forEach((item) => {
//             if (!env.results.errors[item.loc]) {
//                 env.results.errors[item.loc] = [];
//             }
//             env.results.errors[item.loc].push(text);
//         });

//         group.forEach(
//             (node) =>
//                 (env.results.produce[node.id] = [
//                     { type: 'error', message: 'Type Checker: ' + text },
//                 ]),
//         );
//         return true;
//     }
//     const tenv = result.value;
//     const types = group.flatMap((node) =>
//         node.names
//             ?.filter((n) => n.kind === 'value')
//             .map((n) => env.evaluator.inference!.typeForName(tenv, n.name)),
//     );
//     const gCache = env.cache.types[groupKey];
//     const changed = !equal(gCache?.types, types);
//     if (changed) {
//         ids.forEach((id) => (env.changes[id].type = true));
//     }
//     env.cache.types[groupKey] = {
//         env: tenv,
//         ts: Date.now(),
//         types: types,
//         tops: ids,
//     };
// }
