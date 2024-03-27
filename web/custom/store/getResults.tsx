import { MetaData, NUIState, RealizedNamespace } from '../UIState';
import { findTops } from '../../ide/ground-up/findTops';
import {
    Errors,
    FullEvalator,
    ProduceItem,
} from '../../ide/ground-up/Evaluators';
import { layout } from '../../../src/layout';
import { plugins } from '../plugins';
import { NUIResults } from './Store';
import { LocedName, SortedInfo, sortTops } from './sortTops';
import { Node } from '../../../src/types/cst';
import { fromMCST } from '../../../src/types/mcst';
import equal from 'fast-deep-equal';
import { depSort } from './depSort';
import { filterNulls } from '../reduce';

type SuccessfulTypeResult = {
    type: 'success';
    env: any;
    types: any[];
    ts: number;
};

export type ResultsCache<Stmt> = {
    lastState: null | NUIState;
    // the result of `fromMCST`
    // and the IDs of all included nodes. We can do a quick
    // check of each of the `ids` to see if we need to recalculate
    nodes: {
        [top: number]: {
            node: Node;
            ids: number[];
            parsed: void | {
                stmt: Stmt;
                names: LocedName[];
                deps: LocedName[];
            };
            parseErrors: Errors | null;
        };
    };

    types: {
        [group: string]: {
            tops: number[];
            env: any;
            types: any[];
            ts: number;
            // TODO represent error condition?
            error?: Error;
        };
    };

    results: {
        [top: number]: {
            pluginResult?: any;
            // the things to display
            produce: ProduceItem[];
            // any exportable values
            values: { [name: string]: any };
            ts: number;
        };
    };
};

export const getResults = <Env, Stmt, Expr>(
    state: NUIState,
    evaluator: FullEvalator<Env, Stmt, Expr> | null,
    debugExecOrder: boolean,
    cache: ResultsCache<Stmt>,
) => {
    const lastState = cache.lastState;
    cache.lastState = state;

    const results: NUIResults = {
        jumpToName: {},
        display: {},
        errors: {},
        hashNames: {},
        produce: {},
        env: null,
        traces: [],
        pluginResults: {},
        tenv: null,
    };
    const tops = findTops(state);
    if (!evaluator) {
        tops.forEach(({ top }) => {
            results.produce[top] = ['No evaluator'];
            layout(top, 0, state.map, results.display, results.hashNames, true);
        });
        return results;
    }

    const changes: {
        [top: number]: {
            source?: boolean;
            stmt?: boolean;
            type?: boolean;
            value?: boolean;
        };
    } = {};

    const idForName: { [name: string]: number } = {};

    // By the end of this, `cache.nodes` will be populated for
    // each `top.top`
    tops.forEach((top) => {
        if (cache.nodes[top.top] && lastState) {
            if (
                !cache.nodes[top.top].ids.some(
                    (id) => state.map[+id] !== lastState.map[+id],
                )
            ) {
                changes[top.top] = {};
                return;
            }
        }
        const ids: number[] = [];
        const node = fromMCST(top.top, state.map, ids);
        if (cache.nodes[top.top] && equal(cache.nodes[top.top].node, node)) {
            changes[top.top] = {};
            return;
        }

        layout(top.top, 0, state.map, results.display, results.hashNames, true);

        changes[top.top] = { source: true };
        const errors: Errors = {};
        const stmt = evaluator.parse(node, errors);
        changes[top.top].stmt = cache.nodes[top.top]?.parsed
            ? !equal(cache.nodes[top.top].parsed!.stmt, stmt)
            : true;
        const names = stmt ? evaluator.stmtNames(stmt) : null;
        if (names) {
            names.forEach((name) => {
                results.jumpToName[name.name] = name.loc;
                idForName[name.name] = top.top;
            });
        }
        cache.nodes[top.top] = {
            ids,
            node,
            parsed: stmt
                ? {
                      stmt,
                      // TODO could work harder to cache these, but it's fine
                      names: names!,
                      deps: evaluator.dependencies(stmt),
                  }
                : undefined,
            parseErrors: Object.keys(errors).length ? errors : null,
        };
    });

    // const sorted = sortTops(tops, state, results, evaluator);
    const sortedTops = depSort(
        tops
            .map(({ top }) =>
                cache.nodes[top].parsed
                    ? {
                          id: top,
                          names: cache.nodes[top].parsed!.names,
                          deps: cache.nodes[top].parsed!.deps,
                      }
                    : null,
            )
            .filter(filterNulls),
    );

    const topsById: Record<number, ReturnType<typeof findTops>[0]> = {};
    tops.forEach((top) => (topsById[top.top] = top));

    // OK SO. we want ... to .... make a deep deps map, as well as identifying cycles?

    // PROCESS:
    // we do dependency analysis on everything
    // with an algorithm that will hopefully leave things in place as much as possible.
    // OOOH we could do a sort! Right? hrm. Yeah, if we had a deep dependency map.

    results.env = evaluator.init();
    results.tenv = evaluator.initType?.();
    sortedTops.forEach((group, i) => {
        // const plugin = topsById[group[0].id].plugin;
        // if (group.length === 1 && plugin) {
        //     processPlugin(
        //         results,
        //         cache.nodes[group[0].id].node,
        //         plugin,
        //         state,
        //         evaluator,
        //     );
        //     return;
        // }

        const stmts: { [key: number]: Stmt } = {};
        for (let node of group) {
            const parsed = cache.nodes[node.id].parsed;
            if (!parsed) {
                group.forEach(
                    (node) =>
                        (results.produce[node.id] = [
                            'Parse error, or no stmt idk',
                        ]),
                );
                return;
            }
            stmts[node.id] = parsed.stmt;
        }

        const allDeps = unique(
            group.flatMap((node) => node.deps).map((n) => idForName[n.name]),
        );
        const ids = group.map((g) => g.id).sort();
        const groupKey = ids.join(':');
        const retype =
            !cache.types[groupKey] ||
            group.some((node) => changes[node.id].stmt) ||
            allDeps.some((id) => changes[id].type);

        if (retype && evaluator.infer && results.tenv) {
            const tenv = evaluator.infer(Object.values(stmts), results.tenv);
            const types = group.flatMap((node) =>
                node.names.map((n) => evaluator.typeForName!(n.name, tenv)),
            );
            const gCache = cache.types[groupKey];
            const changed = !equal(gCache.types, types);
            if (changed) {
                ids.forEach((id) => (changes[id].type = true));
                cache.types[groupKey] = {
                    env: tenv,
                    ts: Date.now(),
                    types: types,
                    tops: ids,
                };
            }
        }
        results.tenv = evaluator.addTypes!(
            results.tenv,
            cache.types[groupKey].env,
        );

        const reEval =
            group.some(
                (node) => changes[node.id].stmt || !cache.results[node.id],
            ) || allDeps.some((id) => changes[id].value);

        if (reEval) {
            const { env, display, values } = evaluator.addStatements(
                stmts,
                results.env!,
                state.meta,
                results.traces,
            );
            group.forEach((node) => {
                results.produce[node.id] = Array.isArray(display[node.id])
                    ? (display[node.id] as any)
                    : [display[node.id]];
                node.names.forEach(({ name }) => {
                    results.env[name] = values[name];
                });

                let pluginResult;
                if (topsById[node.id].plugin) {
                    pluginResult = processPlugin(
                        results,
                        cache.nodes[node.id].node,
                        topsById[node.id].plugin!,
                        state,
                        evaluator,
                    );
                }

                cache.results[node.id] = {
                    produce: results.produce[node.id],
                    ts: Date.now(),
                    values,
                    pluginResult,
                };
                // ToDO: actually check if things changed
                changes[node.id].value = true;
            });
        } else {
            group.forEach((node) => {
                results.produce[node.id] = cache.results[node.id].produce;
                node.names.forEach(({ name }) => {
                    results.env[name] = cache.results[node.id].values[name];
                });
            });
        }

        // const { env, display } = evaluator.addStatements(
        //     stmts,
        //     results.env!,
        //     state.meta,
        //     results.traces,
        // );
        // results.env = env;
        // group.forEach((node) => {
        //     if (!Array.isArray(display[node.id])) {
        //         display[node.id] = [display[node.id] as any];
        //     }
        // });
        // Object.assign(results.produce, display);
        // if (debugExecOrder) {
        //     showExecOrder(group, results, i);
        // }
    });

    return results;
};

export const unique = <T extends string | number>(names: T[]) => {
    const seen: Partial<Record<T, true>> = {};
    return names.filter((k) => (seen[k] ? false : (seen[k] = true)));
};

export type AnyEnv = FullEvalator<any, any, any>;

export const processPlugin = (
    results: NUIResults,
    node: Node,
    plugin: NonNullable<RealizedNamespace['plugin']>,
    state: NUIState,
    evaluator: AnyEnv,
) => {
    results.produce[node.loc] = ['evaluated by plugin'];
    const pid = typeof plugin === 'string' ? plugin : plugin.id;
    const options = typeof plugin === 'string' ? null : plugin.options;
    const pl = plugins.find((p) => p.id === pid);
    if (!pl) {
        results.produce[node.loc] = [`plugin ${pid} not found`];
        return;
    }
    return (results.pluginResults[node.loc] = pl.process(
        node,
        state,
        evaluator,
        results,
        options,
    ));
};

export function showExecOrder<Stmt>(
    group: SortedInfo<Stmt>[],
    results: NUIResults,
    i: number,
) {
    const names = group.flatMap((group) => group.names).map((n) => n.name);

    group.forEach((node) => {
        results.produce[node.id].push('Cycle: ' + names.join(', '));
        results.produce[node.id].push(
            'Deps: ' + node.deps.map((d) => d.name).join(', '),
        );
        results.produce[node.id].push('Execution Order: ' + i);
    });
}
