import { MetaData, NUIState, RealizedNamespace } from '../UIState';
import { findTops } from '../../ide/ground-up/findTops';
import {
    Errors,
    FullEvalator,
    MyEvalError,
    ProduceItem,
} from '../../ide/ground-up/Evaluators';
import { layout } from '../../../src/layout';
import { plugins } from '../plugins';
import { NUIResults } from './Store';
import { LocedName } from './sortTops';
import { Node } from '../../../src/types/cst';
import { fromMCST } from '../../../src/types/mcst';
import equal from 'fast-deep-equal';
import { depSort } from './depSort';
import { filterNulls } from '../reduce';
import { Display } from '../../../src/to-ast/library';
import React from 'react';
import { valueToString } from '../../ide/ground-up/reduce';

type SuccessfulTypeResult = {
    type: 'success';
    env: any;
    types: any[];
    ts: number;
};

export type ResultsCache<Stmt> = {
    lastEvaluator: AnyEnv | null;
    lastState: null | NUIState;
    settings: { debugExecOrder: boolean };
    // the result of `fromMCST`
    // and the IDs of all included nodes. We can do a quick
    // check of each of the `ids` to see if we need to recalculate
    nodes: {
        [top: number]: {
            ns: RealizedNamespace;
            node: Node;
            ids: number[];
            parsed: void | {
                stmt: Stmt;
            };
            parseErrors: Errors | null;
            display: NUIResults['display'];
        };
    };
    deps?: {
        [top: number]: {
            names: LocedName[];
            deps: LocedName[];
            duplicate?: boolean;
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

const displayFunction = (config?: {
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

type DepsOrNoDeps =
    | {
          type: 'nodeps';
          id: number;
          names?: null;
          deps?: null;
      }
    | {
          type: 'deps';
          id: number;
          names: LocedName[];
          deps: LocedName[];
      };

export const getResults = <
    Env extends { values: { [key: string]: any } },
    Stmt,
    Expr,
>(
    state: NUIState,
    evaluator: FullEvalator<Env, Stmt, Expr> | null,
    debugExecOrder: boolean,
    cache: ResultsCache<Stmt>,
) => {
    if (
        cache.lastEvaluator !== evaluator ||
        cache.settings.debugExecOrder !== debugExecOrder
    ) {
        cache.results = {};
        cache.types = {};
        cache.nodes = {};
        cache.deps = evaluator?.analysis ? {} : undefined;
        cache.lastState = null;
        cache.lastEvaluator = evaluator;
        cache.settings.debugExecOrder = debugExecOrder;
    }
    const lastState = cache.lastState;
    cache.lastState = state;

    const results: NUIResults = {
        jumpToName: {},
        display: {},
        errors: {},
        hashNames: {},
        produce: {},
        env: { values: {} },
        traces: [],
        pluginResults: {},
        tenv: null,
    };
    const tops = findTops(state);
    if (!evaluator) {
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

    const changes: {
        [top: number]: {
            ns?: boolean;
            source?: boolean;
            stmt?: boolean;
            type?: boolean;
            value?: boolean;
        };
    } = {};
    tops.forEach((top) => (changes[top.top] = {}));

    const idForName: { [name: string]: number } = {};

    // By the end of this, `cache.nodes` will be populated for
    // each `top.top`
    tops.forEach((top) => {
        const nsChange = cache.nodes[top.top]
            ? cache.nodes[top.top].ns.plugin !== top.ns.plugin ||
              cache.nodes[top.top].ns.display !== top.ns.display
            : false;
        if (nsChange) {
            changes[top.top].ns = true;
        }

        // console.log('top', top.top);
        if (cache.nodes[top.top] && lastState && !nsChange) {
            if (
                !cache.nodes[top.top].ids.some(
                    (id) =>
                        state.map[+id] !== lastState.map[+id] ||
                        state.meta[+id] !== lastState.meta[+id],
                )
            ) {
                Object.assign(results.display, cache.nodes[top.top].display);

                if (cache.deps?.[top.top]?.names) {
                    registerNames(cache, top.top, results, idForName);
                }

                return;
            }
        }
        const ids: number[] = [];
        const node = fromMCST(top.top, state.map, ids);
        if (
            cache.nodes[top.top] &&
            equal(cache.nodes[top.top].node, node) &&
            lastState &&
            !cache.nodes[top.top].ids.some(
                (id) => state.meta[+id] !== lastState.meta[+id],
            )
        ) {
            Object.assign(results.display, cache.nodes[top.top].display);
            if (cache.deps?.[top.top]?.names) {
                registerNames(cache, top.top, results, idForName);
            }

            return;
        }

        const display: Display = {};
        // console.log('PARSE & LAYOUT', top);
        layout(top.top, 0, state.map, display, results.hashNames, true);
        Object.assign(results.display, display);

        changes[top.top].source = true;
        const errors: Errors = {};
        const stmt = evaluator.parse(node, errors);
        changes[top.top].stmt = cache.nodes[top.top]?.parsed
            ? !equal(cache.nodes[top.top].parsed!.stmt, stmt) ||
              cache.nodes[top.top].ids.some(
                  (id) => state.meta[+id] !== lastState!.meta[+id],
              )
            : true;
        if (!stmt) {
            // console.log('no stmt', node, errors);
            if (Object.keys(errors).length) {
                results.produce[top.top] = [new Error(JSON.stringify(errors))];
            }
        }
        cache.nodes[top.top] = {
            ns: top.ns,
            ids,
            node,
            display,
            parsed: stmt ? { stmt } : undefined,
            parseErrors: Object.keys(errors).length ? errors : null,
        };

        if (stmt && evaluator.analysis) {
            if (changes[top.top].stmt) {
                const names = evaluator.analysis.stmtNames(stmt);
                const deps = evaluator.analysis.dependencies(stmt);
                cache.deps![top.top] = { names, deps };
                registerNames(cache, top.top, results, idForName);
            }
        }
    });

    const sortedTops: DepsOrNoDeps[][] = !cache.deps
        ? tops
              .filter((top) => cache.nodes[top.top].parsed)
              .map(({ top }) => [{ type: 'nodeps', id: top } as const])
        : depSort(
              tops
                  .map(({ top }) => {
                      return cache.deps?.[top] && !cache.deps[top].duplicate
                          ? {
                                type: 'deps' as const,
                                id: top,
                                names: cache.deps[top].names,
                                deps: cache.deps[top].deps,
                            }
                          : null;
                  })
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
        const isPlugin = group.every((node) => topsById[node.id].ns.plugin);
        if (isPlugin) {
            for (let node of group) {
                const reRun =
                    changes[node.id].ns ||
                    changes[node.id].source ||
                    !cache.results[node.id] ||
                    !node.deps ||
                    node.deps.some((id) => changes[idForName[id.name]]?.value);

                if (reRun) {
                    let pluginResult;
                    if (topsById[node.id].ns.plugin) {
                        // console.log('Doing a plugin', topsById[node.id].plugin);
                        pluginResult = processPlugin(
                            results,
                            cache.nodes[node.id].node,
                            topsById[node.id].ns.plugin!,
                            state,
                            evaluator,
                        );
                        results.pluginResults[node.id] = pluginResult;
                    }

                    cache.results[node.id] = {
                        produce: results.produce[node.id],
                        ts: Date.now(),
                        values: {},
                        pluginResult,
                    };
                    changes[node.id].value = true;
                } else {
                    results.pluginResults[node.id] =
                        cache.results[node.id].pluginResult;
                }
            }
            return;
        }

        const stmts: { [key: number]: Stmt } = {};
        for (let node of group) {
            const parsed = cache.nodes[node.id].parsed;
            if (!parsed) {
                console.log('not parsed', node.id);
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
            group
                .flatMap((node) => node.deps ?? [])
                .map((n) => idForName[n.name])
                .filter(filterNulls),
        );
        const ids = group.map((g) => g.id).sort();
        const groupKey = ids.join(':');
        const retype =
            !evaluator.analysis ||
            !cache.types[groupKey] ||
            group.some((node) => changes[node.id].stmt) ||
            allDeps.some((id) => changes[id].type);

        // if (isPlugin) {
        //     console.log(
        //         'we have a plugin',
        //         group.map((node) => topsById[node.id].ns.plugin),
        //     );
        // }

        if (retype && evaluator.infer && results.tenv && !isPlugin) {
            // console.log('Do types', groupKey);
            try {
                const tenv = evaluator.infer(
                    Object.values(stmts),
                    results.tenv,
                );
                const types = group.flatMap((node) =>
                    node.names
                        ?.filter((n) => n.kind === 'value')
                        .map((n) => evaluator.typeForName!(tenv, n.name)),
                );
                const gCache = cache.types[groupKey];
                const changed = !equal(gCache?.types, types);
                if (changed) {
                    ids.forEach((id) => (changes[id].type = true));
                }
                cache.types[groupKey] = {
                    env: tenv,
                    ts: Date.now(),
                    types: types,
                    tops: ids,
                };
            } catch (err) {
                delete cache.types[groupKey];
                group.forEach(
                    (node) =>
                        (results.produce[node.id] = [
                            new MyEvalError('Tyoe Checker', err as Error),
                        ]),
                );
                return;
            }
        }

        if (cache.types[groupKey] && evaluator.addTypes) {
            results.tenv = evaluator.addTypes!(
                results.tenv,
                cache.types[groupKey].env,
            );
        }

        const reEval =
            retype ||
            group.some(
                (node) =>
                    changes[node.id].ns ||
                    changes[node.id].stmt ||
                    !cache.results[node.id],
            ) ||
            allDeps.some((id) => changes[id].value);

        if (reEval) {
            const displayConfig =
                group.length === 1
                    ? topsById[group[0].id].ns.display
                    : undefined;
            const renderValue = displayFunction(displayConfig);

            const { env, display, values } = evaluator.addStatements(
                stmts,
                results.env as any,
                results.tenv,
                state.meta,
                results.traces,
                renderValue,
            );
            group.forEach((node) => {
                results.produce[node.id] = Array.isArray(display[node.id])
                    ? (display[node.id] as any)
                    : [display[node.id]];
                if (!node.names) {
                    Object.assign(results.env.values, values);
                } else {
                    node.names?.forEach(({ name, kind }) => {
                        if (kind === 'value') {
                            results.env.values[name] = values[name];
                        }
                    });
                }

                let pluginResult;
                if (topsById[node.id].ns.plugin) {
                    pluginResult = processPlugin(
                        results,
                        cache.nodes[node.id].node,
                        topsById[node.id].ns.plugin!,
                        state,
                        evaluator,
                    );
                    results.pluginResults[node.id] = pluginResult;
                }

                cache.results[node.id] = {
                    produce: results.produce[node.id],
                    ts: Date.now(),
                    values,
                    pluginResult,
                };
                changes[node.id].value = true;
            });
        } else {
            group.forEach((node) => {
                results.produce[node.id] = cache.results[node.id].produce;
                if (cache.results[node.id].pluginResult) {
                    results.pluginResults[node.id] =
                        cache.results[node.id].pluginResult;
                }
                if (!node.names) {
                    Object.assign(
                        results.env.values,
                        cache.results[node.id].values,
                    );
                } else {
                    node.names.forEach(({ name, kind }) => {
                        if (kind === 'value') {
                            results.env.values[name] =
                                cache.results[node.id].values[name];
                        }
                    });
                }
            });
        }
    });

    if (debugExecOrder) {
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
    results.produce[node.loc] = ['evaluated by plugin'];
    const pid = typeof plugin === 'string' ? plugin : plugin.id;
    const options = typeof plugin === 'string' ? null : plugin.options;
    const pl = plugins.find((p) => p.id === pid);
    if (!pl) {
        results.produce[node.loc] = [`plugin ${pid} not found`];
        return;
    }
    return pl.process(node, state, evaluator, results, options);
};

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
