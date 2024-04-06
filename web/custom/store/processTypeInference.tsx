import equal from 'fast-deep-equal';
import { MyEvalError } from '../../ide/ground-up/Evaluators';
import { DepsOrNoDeps } from './ResultsCache';
import { ResultsEnv } from './getResults';

export function processTypeInference<
    Env extends { values: { [key: string]: any } },
    Stmt,
    Expr,
>(
    stmts: { [key: number]: Stmt },
    group: DepsOrNoDeps[],
    groupKey: string,
    ids: number[],
    env: ResultsEnv<Stmt, Env, Expr>,
) {
    try {
        const tenv = env.evaluator.infer!(
            Object.values(stmts),
            env.results.tenv,
        );
        const types = group.flatMap((node) =>
            node.names
                ?.filter((n) => n.kind === 'value')
                .map((n) => env.evaluator.typeForName!(tenv, n.name)),
        );
        const gCache = env.cache.types[groupKey];
        const changed = !equal(gCache?.types, types);
        if (changed) {
            ids.forEach((id) => (env.changes[id].type = true));
        }
        env.cache.types[groupKey] = {
            env: tenv,
            ts: Date.now(),
            types: types,
            tops: ids,
        };
    } catch (err) {
        delete env.cache.types[groupKey];
        console.error(err);
        group.forEach(
            (node) =>
                (env.results.produce[node.id] = [
                    new MyEvalError('Tyoe Checker', err as Error),
                ]),
        );
        return true;
    }
}
