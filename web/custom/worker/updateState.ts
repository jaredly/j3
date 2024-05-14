import { blankAllNames } from '../../ide/ground-up/evaluators/analyze';
import { AllNames } from '../../ide/ground-up/evaluators/interface';
import { MetaDataMap } from '../UIState';
import { filterNulls } from '../old-stuff/filterNulls';
import { workerPlugins } from '../plugins/worker';
import { depSort } from '../store/depSort';
import { displayFunction } from '../store/displayFunction';
import {
    ImmediateResults,
    PluginParsed,
    SuccessParsed,
} from '../store/getImmediateResults';
import { locedErrors, showError } from '../store/processTypeInference';
import { LocedName } from '../store/sortTops';
import { unique } from '../store/unique';
import { add } from './add';
import { nodeToSortable } from './calculateInitialState';
import { AsyncResults, HoverContents, Sortable, State } from './types';

export function updateState(
    state: State,
    update: ImmediateResults<any>['nodes'],
): State {
    if (!state.evaluator) {
        console.log(`No evaluator, ignoring update`);
        return state;
    }
    if (!state.results) {
        console.log(`no previous results??`);
        return state;
    }
    const nodes = { ...state.nodes, ...update };

    const topsForName: Record<string, { top: number; group: string }> = {};

    const namesTaken: Record<LocedName['kind'], Record<string, number>> = {
        tcls: {},
        value: {},
        type: {},
    };

    const duplicates: { id: number; name: LocedName; taken: number }[] = [];

    // TODO: if none of the nodes have names/deps changes
    // STOPSHIP Maybe exclude duplicates here already?? Yeah. Just ditch it. get a better name if you want to be handled.
    const sorted = depSort(
        Object.values(nodes)
            .map((node) => {
                if (node.parsed?.type === 'success') {
                    for (let name of node.parsed.allNames?.global
                        .declarations ?? []) {
                        if (namesTaken[name.kind][name.name] != null) {
                            duplicates.push({
                                id: node.ns.id,
                                name: name,
                                taken: namesTaken[name.kind][name.name],
                            });
                            return null;
                        }
                        namesTaken[name.kind][name.name] = name.loc;
                    }
                }
                return nodeToSortable(node);
            })
            .filter(filterNulls),
    );

    // Reset changedness
    Object.entries(state.results.groups).forEach(([key, res]) => {
        res.changed = false;
        res.tops.forEach((top) => {
            state.results!.tops[top].changes = {};
        });
    });
    Object.entries(state.results.tops).forEach(([key, res]) => {
        res.changes = {};
    });

    duplicates.forEach(({ id, name, taken }) => {
        if (!state.results!.tops[id]) {
            state.results!.tops[id] = {
                changes: { results: true },
                errors: {},
                hover: {},
                produce: [],
                values: {},
                usages: {},
            };
        } else {
            state.results!.tops[id].changes.results = true;
        }
        state.results!.tops[id].produce = [
            {
                type: 'error',
                message: `Duplicate term name: ${name.name}, other location ${taken}`,
            },
        ];
        state.results!.tops[id].errors = {
            [name.loc]: [`Name already used: other location: ${taken}`],
        };
    });

    // So...
    // there's "needs re-type", and then there's "needs re-eval"
    // for now, I'm ignoring "needs re-type". I'm assuming that
    // a source change means 'needs re-eval'
    // Object.keys(update).forEach((key) => {
    //     // if (!state.results!.tops[+key]) {
    //     state.results!.tops[+key] = {
    //         changes: { results: true },
    //         errors: {},
    //         hover: {},
    //         produce: [],
    //         values: {},
    //     };
    //     // } else {
    //     //     state.results!.tops[+key].changes = { source: true };
    //     // }
    // });

    const topForLoc: Record<number, number> = {};
    Object.values(nodes).forEach((node) => {
        node.ids.forEach((id) => (topForLoc[id] = node.ns.id));
    });

    sorted.forEach((group) => {
        const groupKey = group.map((g) => g.id).join(';');
        group.forEach((item) => {
            item.allNames?.global.declarations.forEach((name) => {
                if (topsForName[name.name] == null) {
                    topsForName[name.name] = { top: item.id, group: groupKey };
                }
            });
        });
    });

    // Determine deep changedness
    for (let group of sorted) {
        const groupKey = group.map((g) => g.id).join(';');

        const sourceUpdate =
            !state.results.groups[groupKey] || group.some((g) => update[g.id]);
        const depsUpdate =
            sourceUpdate ||
            group.some((g) =>
                g.allNames?.global.usages.some((ln) => {
                    if (!Object.hasOwn(topsForName, ln.name)) return false;
                    return state.results!.groups[topsForName[ln.name].group]
                        .changed;
                }),
            );

        if (sourceUpdate || depsUpdate) {
            state.results.groups[groupKey] = {
                changed: true,
                typeFailed: false,
                // Hang on to the previous one, in case of failure
                tenv: state.results.groups[groupKey]?.tenv,
                tops: group.map((g) => g.id),
                // ooh traces ... might ... want to stick around?? idk
                traces: state.results.groups[groupKey]?.traces ?? {},
            };
        } else {
            if (!state.results.groups[groupKey]) {
                throw new Error(
                    `a group wasnt in 'update', but ... didnt exist`,
                );
            }
            state.results.groups[groupKey].changed = false;
        }
    }

    for (let group of sorted) {
        const groupKey = group.map((g) => g.id).join(';');
        if (state.results.groups[groupKey].changed) {
            group.forEach((one) => {
                state.results!.tops[one.id] = {
                    changes: { results: true },
                    errors: {},
                    hover: {},
                    produce: [],
                    values: {},
                    usages: {},
                };
            });
        }
    }

    const hoverType = (type: any): HoverContents => {
        if (state.evaluator!.inference!.typeToCst) {
            return {
                type: 'type',
                node: state.evaluator!.inference!.typeToCst(type),
            };
        } else {
            return {
                type: 'text',
                text: state.evaluator!.inference!.typeToString(type),
            };
        }
    };

    /**
     * BIG QUESTION:
     * - If I'm going to be ... caching ...
     *   and something is changed ...
     *   ok, I can reset the tops, I guess.
     */
    if (state.evaluator.inference) {
        // TODO
        let tenv = state.evaluator.inference.init();
        for (let group of sorted) {
            const groupKey = group.map((g) => g.id).join(';');
            // This does "deep" change propagation
            if (!state.results.groups[groupKey].changed) {
                if (state.results.groups[groupKey].tenv) {
                    tenv = state.evaluator.inference.addTypes(
                        tenv,
                        state.results.groups[groupKey].tenv,
                    );
                }

                continue;
            }

            // Pluginssss
            if (group.length === 1 && group[0].isPlugin) {
                const node = nodes[group[0].id];
                const plugin = workerPlugins[node.ns.plugin!.id];
                const { result, typesAndLocs, usages } = plugin.infer(
                    (node.parsed as PluginParsed).parsed,
                    state.evaluator!,
                    tenv,
                );
                typesAndLocs.forEach(({ loc, type }) => {
                    add(
                        state.results!.tops[group[0].id].hover,
                        loc,
                        hoverType(type),
                    );
                });
                state.results.tops[group[0].id].usages = usages;
                if (result.type === 'err') {
                    state.results.groups[groupKey].typeFailed = true;
                    const err = result.err;
                    locedErrors(err).forEach(({ loc, text }) => {
                        add(
                            state.results!.tops[topForLoc[loc]]?.errors ?? {},
                            loc,
                            text,
                        );
                    });
                    group.forEach((item) => {
                        state.results!.tops[item.id].produce.push({
                            type: 'inference-error',
                            err,
                        });
                    });
                }
                processUsages(usages, state, topForLoc);

                continue;
            }
            // const hasDuplicates = group.some((n) => {
            //     const p = state.nodes[n.id].parsed!;
            //     if (p.type === 'success' && p.duplicates?.length) return true;
            // });

            const stmts = group.map(
                (g) => (nodes[g.id].parsed as SuccessParsed<any>).stmt,
            );
            let res;
            try {
                res = state.evaluator.inference.infer(stmts, tenv);
            } catch (err) {
                group.forEach((item) => {
                    state.results!.tops[item.id].produce.push({
                        type: 'error',
                        message:
                            'When doing infer for stmts: ' +
                            (err as Error).message,
                    });
                });
                continue;
            }
            if (res.result.type === 'ok') {
                const types = res.result.value.types;

                state.results.groups[groupKey].tenv = res.result.value.env;
                tenv = state.evaluator.inference.addTypes(
                    tenv,
                    res.result.value.env,
                );

                if (state.evaluator.inference.envToString) {
                    state.results.tops[group[0].id].produce.push({
                        type: 'pre',
                        text: state.evaluator.inference.envToString(
                            res.result.value.env,
                        ),
                    });
                }

                state.results.groups[groupKey].typeFailed = false;
                group.forEach((one) => {
                    types.forEach((type) => {
                        try {
                            const text =
                                state.evaluator!.inference!.typeToString(type);
                            state.results!.tops[one.id].produce.push({
                                type: 'type',
                                text,
                            });
                        } catch (err) {
                            state.results!.tops[one.id].produce.push({
                                type: 'error',
                                message: `Cant stringify type ${JSON.stringify(
                                    type,
                                )}`,
                            });
                        }
                    });

                    one.allNames?.global.declarations.forEach(
                        ({ name, kind }) => {
                            if (kind !== 'value') return;
                            try {
                                const type =
                                    state.evaluator!.inference!.typeForName(
                                        tenv,
                                        name,
                                    );
                                const text =
                                    state.evaluator!.inference!.typeToString(
                                        type,
                                    );
                                state.results!.tops[one.id].produce.push({
                                    type: 'type',
                                    text: text,
                                    cst: state.evaluator!.inference!.typeToCst?.(
                                        type,
                                    ),
                                    name,
                                });
                            } catch (err) {
                                state.results!.tops[one.id].produce.push({
                                    type: 'error',
                                    message: `Cant get type for ${name}: ${
                                        (err as Error).message
                                    }`,
                                });
                            }
                        },
                    );
                });
            } else {
                state.results.groups[groupKey].typeFailed = true;

                // If there's a previously successful run, load that up
                if (state.results.groups[groupKey].tenv) {
                    tenv = state.evaluator.inference.addTypes(
                        tenv,
                        state.results.groups[groupKey].tenv,
                    );
                }

                const err = res.result.err;

                locedErrors(err).forEach(({ loc, text }) => {
                    add(state.results!.tops[topForLoc[loc]]?.errors, loc, text);
                });

                group.forEach((item) => {
                    state.results!.tops[item.id].produce.push({
                        type: 'inference-error',
                        err,
                    });
                });
            }
            res.typesAndLocs.forEach(({ loc, type }) => {
                if (!state.results!.tops[topForLoc[loc]]) {
                    if (loc !== -1) {
                        console.warn('no top', topForLoc[loc], loc);
                    }
                    return;
                }

                add(
                    state.results!.tops[topForLoc[loc]].hover,
                    loc,
                    hoverType(type),
                );
            });
            processUsages(res.usages, state, topForLoc);

            // group.forEach((item) => {
            //     state.results?.tops[item.id].produce.push(
            //         JSON.stringify(res.usages),
            //     );
            // });
        }
    }

    let env = state.evaluator.init();
    let i = -1;
    for (let group of sorted) {
        i++;
        const groupKey = group.map((g) => g.id).join(';');

        // This does "deep" change propagation
        if (!state.results.groups[groupKey].changed) {
            group.forEach((one) => {
                // console.log('reset', one.id);
                state.results!.tops[one.id].changes = {};
                Object.assign(env.values, state.results!.tops[one.id].values);
            });

            continue;
        }

        if (group.length === 1 && group[0].isPlugin) {
            const node = nodes[group[0].id];
            const plugin = workerPlugins[node.ns.plugin!.id];
            const results = plugin.process(
                (node.parsed as PluginParsed).parsed,
                node.meta,
                state.evaluator,
                state.results.groups[groupKey].traces,
                env,
                node.ns.plugin!.options,
            );
            state.results.tops[group[0].id].pluginResults = results;
            const errors = plugin.getErrors(results);
            if (errors.length) {
                state.results.tops[group[0].id].produce.push(
                    // {
                    //     type: 'error',
                    //     message: `Plugin ${node.ns.plugin!.id} had errors (loc ${
                    //         group[0].id
                    //     })`,
                    // },
                    ...errors.map(([name, id]) => ({
                        type: 'error' as const,
                        message: `Plugin(${name}) (${id})`,
                    })),
                );
            }
            continue;
        }

        if (state.results.groups[groupKey].typeFailed) {
            if (state.debugExecOrder) {
                group.forEach((one) => {
                    showExecOrder(state.results!.tops, one, i, group);
                });
            }

            continue;
        }

        const stmts: Record<string, { stmt: any; names: AllNames }> = {};
        for (let item of group) {
            const parsed = nodes[item.id].parsed;
            if (parsed?.type === 'success') {
                stmts[item.id] = {
                    stmt: parsed.stmt,
                    names: parsed.allNames ?? blankAllNames(),
                };
            }
        }
        const meta: MetaDataMap = {};
        group.forEach((one) => {
            const node = nodes[one.id];
            Object.assign(meta, node.meta);
        });

        const renderValue = displayFunction(
            group.length === 1 ? nodes[group[0].id].ns.display : undefined,
        );
        const added = state.evaluator.addStatements(
            stmts,
            env,
            meta,
            state.results.groups[groupKey].traces,
            nodes[group[0].id].ns.top,
            renderValue,
            state.debugShowJs,
        );

        group.forEach((one) => {
            one.allNames?.global.declarations.forEach((name) => {
                if (name.kind === 'value') {
                    state.results!.tops[one.id].values[name.name] =
                        added.values[name.name];
                }
            });
            Object.assign(env.values, state.results!.tops[one.id].values);

            if (state.debugExecOrder) {
                showExecOrder(state.results!.tops, one, i, group);
            }
        });

        Object.entries(added.display).forEach(([key, produce]) => {
            state.results!.tops[+key].produce.push(
                ...(Array.isArray(produce) ? produce : [produce]),
            );
        });
    }

    return { ...state, nodes };
}

function processUsages(
    usages: Record<number, number[]>,
    state: State,
    topForLoc: Record<number, number>,
) {
    Object.entries(usages).forEach(([key, locs]) => {
        if (!locs.length) {
            state.results!.tops[topForLoc[+key]].usages[+key] = [];
        }
        locs.forEach((loc) => {
            if (!state.results!.tops[topForLoc[loc]]) {
                if (loc !== -1) {
                    console.warn('no top', topForLoc[loc], loc);
                }
                return;
            }
            add(state.results!.tops[topForLoc[loc]].usages, +key, loc);
        });
    });
}

function showExecOrder(
    tops: AsyncResults['tops'],
    one: Sortable,
    i: number,
    group: Sortable[],
) {
    const groupNames = unique(
        group.flatMap(
            (s) => s.allNames?.global.declarations.map((n) => n.name) ?? [],
        ),
    );
    tops[one.id].produce.push(
        `Exec order ${i} - ${groupNames.join(', ')}\nDeps: ${unique(
            one.allNames?.global.usages.map((n) => n.name) ?? [],
        ).join(', ')}\nProduce: ${unique(
            one.allNames?.global.declarations.map((n) => n.name) ?? [],
        ).join(', ')}`,
    );
}
