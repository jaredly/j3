import { MetaData, NUIState, RealizedNamespace } from '../UIState';
import { findTops } from '../../ide/ground-up/findTops';
import { FullEvalator, ProduceItem } from '../../ide/ground-up/Evaluators';
import { layout } from '../../../src/layout';
import { plugins } from '../plugins';
import { NUIResults } from './Store';
import { Node } from '../../../src/types/cst';
import { fromMCST } from '../../../src/types/mcst';
import { filterNulls } from '../old-stuff/reduce';
import React from 'react';
import { valueToString } from '../../ide/ground-up/reduce';
import { parseNodesAndDeps, sortTopsWithDeps } from './parseNodesAndDeps';
import { processTypeInference } from './processTypeInference';
import {
    handlePluginGroup,
    evaluateGroup,
    cacheEvaluation,
} from './handlePluginGroup';
import { ResultsCache, DepsOrNoDeps, ChangesMap } from './ResultsCache';
import { Path } from '../../store';

export type ResultsEnv<
    Stmt,
    Env extends {
        values: {
            [key: string]: any;
        };
    },
    Expr,
> = {
    changes: ChangesMap;
    cache: ResultsCache<Stmt>;
    idForName: {
        [name: string]: number;
    };
    topsById: Record<
        number,
        {
            top: number;
            path: Path[];
            ns: RealizedNamespace;
        }
    >;
    results: NUIResults;
    state: NUIState;
    evaluator: FullEvalator<Env, Stmt, Expr>;
};

export const getResults = <
    Env extends { values: { [key: string]: any } },
    Stmt,
    Expr,
>(
    state: NUIState,
    evaluator: FullEvalator<Env, Stmt, Expr> | null,
    debug: { execOrder: boolean; disableEvaluation: boolean },
    cache: ResultsCache<Stmt>,
) => {
    maybeResetCache<Env, Stmt, Expr>(
        cache,
        debug.disableEvaluation ? null : evaluator,
        debug.execOrder,
    );
    const lastState = cache.lastState;
    cache.lastState = state;

    const tops = findTops(state);
    if (!evaluator || debug.disableEvaluation) {
        return resultsWithoutEvaluator<Stmt>(tops, state, cache);
    }

    cache.run += 1;

    const TIME = 1;

    if (TIME) console.time('parse');

    // By the end of this, `cache.nodes` will be populated for
    // each `top.top`
    const { changes, idForName, results } = parseNodesAndDeps(
        tops,
        cache,
        lastState,
        state,
        evaluator,
    );

    if (TIME) console.timeEnd('parse');
    if (TIME) console.time('sort');

    const sortedTops: DepsOrNoDeps[][] = sortTopsWithDeps<Stmt>(cache, tops);

    if (TIME) console.timeEnd('sort');

    const topsById: Record<number, ReturnType<typeof findTops>[0]> = {};
    tops.forEach((top) => (topsById[top.top] = top));

    const stuff: ResultsEnv<Stmt, Env, Expr> = {
        changes,
        cache,
        idForName,
        topsById,
        results,
        state,
        evaluator,
    };

    const meta = sortedTops.map((group) => {
        const ids = group.map((g) => g.id).sort();
        const groupKey = ids.join(':');
        const stmts = collectStatements<Stmt>(group, cache, results);
        const isPlugin = group.some((node) => topsById[node.id].ns.plugin);
        return { ids, groupKey, stmts, isPlugin };
    });

    const groupChanges: {
        [groupKey: string]: { type?: boolean; value?: boolean };
    } = {};

    if (TIME) console.time('type');
    results.tenv = evaluator.initType?.();
    sortedTops.forEach((group, i) => {
        const { isPlugin, stmts, groupKey, ids } = meta[i];
        groupChanges[groupKey] = {};
        if (!stmts) return;

        const allDeps = unique(
            group
                .flatMap((node) => node.deps ?? [])
                .map((n) => idForName[n.name])
                .filter(filterNulls),
        );
        const retype =
            !evaluator.analysis ||
            !cache.types[groupKey] ||
            group.some((node) => changes[node.id].stmt) ||
            allDeps.some((id) => changes[id].type);

        groupChanges[groupKey].type = retype;

        if (retype && evaluator.infer && results.tenv) {
            if (TIME > 1) console.time(`type - ${groupKey}`);
            const failed = processTypeInference<Env, Stmt, Expr>(
                stmts,
                group,
                groupKey,
                ids,
                stuff,
            );
            if (TIME > 1) console.timeEnd(`type - ${groupKey}`);
            if (failed) return;
        }

        if (cache.types[groupKey] && evaluator.addTypes) {
            results.tenv = evaluator.addTypes!(
                results.tenv,
                cache.types[groupKey].env,
            );
        }

        Object.assign(results.hover, cache.hover[groupKey]);
    });
    if (TIME) console.timeEnd('type');

    if (TIME) console.time('eval');
    results.env = evaluator.init();
    sortedTops.forEach((group, i) => {
        const { isPlugin, stmts, groupKey, ids } = meta[i];

        if (isPlugin) {
            handlePluginGroup<Env, Stmt, Expr>(group, stuff);
            return;
        }

        if (!stmts) return;

        const allDeps = unique(
            group
                .flatMap((node) => node.deps ?? [])
                .map((n) => idForName[n.name])
                .filter(filterNulls),
        );

        const reEval =
            groupChanges[groupKey].type ||
            group.some(
                (node) =>
                    changes[node.id].ns ||
                    changes[node.id].stmt ||
                    !cache.results[node.id],
            ) ||
            allDeps.some((id) => changes[id].value);

        if (reEval) {
            evaluateGroup<Env, Stmt, Expr>(stuff, group, stmts);
        } else {
            cacheEvaluation<Stmt>(group, results, cache);
        }
    });
    if (TIME) console.timeEnd('eval');

    if (debug.execOrder) {
        sortedTops.forEach((group, i) => {
            showExecOrder(group, results, i);
        });
    }

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
    if (!results.produce[node.loc]) {
        results.produce[node.loc] = [];
    }
    results.produce[node.loc].push('evaluated by plugin');
    const pid = typeof plugin === 'string' ? plugin : plugin.id;
    const options = typeof plugin === 'string' ? null : plugin.options;
    const pl = plugins.find((p) => p.id === pid);
    if (!pl) {
        results.produce[node.loc] = [`plugin ${pid} not found`];
        return;
    }
    return pl.process(node, state, evaluator, results, options);
};

function collectStatements<Stmt>(
    group: DepsOrNoDeps[],
    cache: ResultsCache<Stmt>,
    results: NUIResults,
) {
    const stmts: { [key: number]: Stmt } = {};
    let missing = false;
    for (let node of group) {
        const parsed = cache.nodes[node.id].parsed;
        if (!parsed) {
            missing = true;
            group.forEach((node) => {
                if (
                    Object.keys(cache.nodes[node.id].parseErrors ?? {}).length
                ) {
                    results.produce[node.id] = [
                        new Error(
                            `Parse error, or no stmt idk ${JSON.stringify(
                                cache.nodes[node.id].parseErrors,
                            )}`,
                        ),
                    ];
                }
            });
        } else {
            stmts[node.id] = parsed.stmt;
        }
    }
    return missing ? null : stmts;
}

export function resultsWithoutEvaluator<Stmt>(
    tops: ReturnType<typeof findTops>,
    state: NUIState,
    cache: ResultsCache<Stmt>,
) {
    const results = emptyResults();
    tops.forEach(({ top, ns }) => {
        const ids: number[] = [];
        const node = fromMCST(top, state.map, ids);
        cache.nodes[top] = {
            ns,
            ids,
            node,
            display: {},
            parsed: undefined,
            parseErrors: null,
        };

        results.produce[top] = ['No evaluator'];
        layout(
            top,
            0,
            state.map,
            cache.nodes[top].display,
            results.hashNames,
            true,
        );
        Object.assign(results.display, cache.nodes[top].display);
    });
    return results;
}

export function emptyResults(): NUIResults {
    return {
        jumpToName: {},
        display: {},
        errors: {},
        hashNames: {},
        produce: {},
        hover: {},
        env: { values: {} },
        traces: [],
        pluginResults: {},
        tenv: null,
    };
}

export function maybeResetCache<
    Env extends { values: { [key: string]: any } },
    Stmt,
    Expr,
>(
    cache: ResultsCache<Stmt>,
    evaluator: FullEvalator<Env, Stmt, Expr> | null,
    debugExecOrder: boolean,
) {
    const eid = evaluator?.id ?? null;
    if (
        cache.lastEvaluator !== eid ||
        cache.settings.debugExecOrder !== debugExecOrder
    ) {
        console.log('resetting cache', cache.lastEvaluator, eid);
        cache.results = {};
        cache.types = {};
        cache.nodes = {};
        cache.deps = evaluator?.analysis ? {} : undefined;
        cache.lastState = null;
        cache.lastEvaluator = eid;
        cache.settings.debugExecOrder = debugExecOrder;
    }
}

export function showExecOrder(
    group: DepsOrNoDeps[],
    results: NUIResults,
    i: number,
) {
    const names = group
        .flatMap((group) => group.names ?? [])
        .filter((n) => n.kind === 'value')
        .map((n) => n.name);

    const prefix = '🍉 ';
    group.forEach((node) => {
        if (!node.deps) {
            return;
        }
        if (!results.produce[node.id]) {
            results.produce[node.id] = [];
        } else {
            results.produce[node.id] = results.produce[node.id].filter(
                (n) => typeof n !== 'string' || !n.startsWith(prefix),
            );
        }
        results.produce[node.id].push(prefix + 'Cycle: ' + names.join(', '));
        results.produce[node.id].push(
            prefix + 'Deps: ' + unique(node.deps.map((d) => d.name)).join(', '),
        );
        results.produce[node.id].push(prefix + 'Execution Order: ' + i);
    });
}

export const registerNames = (
    cache: ResultsCache<any>,
    top: number,
    results: NUIResults,
    idForName: { [name: string]: number },
) => {
    for (let name of cache.deps![top].names) {
        results.jumpToName[name.name] = name.loc;
        if (name.kind === 'value') {
            if (idForName[name.name] != null) {
                cache.deps![top].duplicate = true;
                results.produce[top] = [
                    new Error(`Name already defined: ${name.name}`),
                ];

                return true;
            }
            // console.log('cached ...', name.name, top.top);
            idForName[name.name] = top;
        }
    }
};

export const displayFunction = (config?: {
    id: string;
    options: any;
}): undefined | ((v: any) => ProduceItem[]) => {
    if (!config) return;
    if (config.id === 'pre') {
        return (value) => {
            if (typeof value === 'string') {
                return [<pre>{value}</pre>];
            }
            return [<pre key={0}>{JSON.stringify(value, null, 2)}</pre>];
        };
    }
    if (config.id === 'none') {
        return () => [];
    }
    return (value) => [valueToString(value)];
};
