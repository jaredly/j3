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
import { showError } from '../store/processTypeInference';
import { LocedName } from '../store/sortTops';
import { unique } from '../store/unique';
import { nodeToSortable } from './calculateInitialState';
import { AsyncResults, Sortable, State } from './types';

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

    const namesTaken: Record<'value' | 'type', Record<string, number>> = {
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
                    for (let name of node.parsed.names) {
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
            item.names.forEach((name) => {
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
                g.deps.some((ln) => {
                    const got = topsForName[ln.name];
                    if (!got) return false;
                    return state.results!.groups[got.group].changed;
                }),
            );

        if (sourceUpdate || depsUpdate) {
            state.results.groups[groupKey] = {
                changed: true,
                typeFailed: false,
                tenv: null,
                tops: group.map((g) => g.id),
                traces: {},
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
    /**
     * BIG QUESTION:
     * - If I'm going to be ... caching ...
     *   and something is changed ...
     *   ok, I can reset the tops, I guess.
     */
    if (state.evaluator.inference) {
        // TODO
        let tenv = state.evaluator.inference.initType();
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
                        state.evaluator!.inference!.typeToString(type),
                    );
                });
                state.results.tops[group[0].id].usages = usages;
                if (result.type === 'err') {
                    state.results.groups[groupKey].typeFailed = true;
                    const err = result.err;
                    const text = showError(err);
                    group.forEach((item) => {
                        state.results!.tops[item.id].produce.push({
                            type: 'error',
                            message: 'Type Inference: ' + text,
                        });
                        err.items.forEach(({ loc, name }) => {
                            add(
                                state.results!.tops[topForLoc[loc]].errors,
                                loc,
                                text,
                            );
                        });
                    });
                }

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
            // debugger;
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

                    one.names.forEach(({ name, kind }) => {
                        if (kind !== 'value') return;
                        try {
                            const type =
                                state.evaluator!.inference!.typeForName(
                                    tenv,
                                    name,
                                );
                            const text =
                                state.evaluator!.inference!.typeToString(type);
                            state.results!.tops[one.id].produce.push({
                                type: 'type',
                                text: `${name}: ${text}`,
                            });
                        } catch (err) {
                            state.results!.tops[one.id].produce.push({
                                type: 'error',
                                message: `Cant get type for ${name}: ${
                                    (err as Error).message
                                }`,
                            });
                        }
                    });
                });
            } else {
                state.results.groups[groupKey].typeFailed = true;
                const err = res.result.err;
                const text = showError(err);
                group.forEach((item) => {
                    state.results!.tops[item.id].produce.push({
                        type: 'error',
                        message: 'Type Inference: ' + text,
                    });
                    err.items.forEach(({ loc, name }) => {
                        add(
                            state.results!.tops[topForLoc[loc]]?.errors ?? {},
                            loc,
                            text,
                        );
                    });
                });
            }
            res.typesAndLocs.forEach(({ loc, type }) => {
                add(
                    state.results!.tops[topForLoc[loc]].hover,
                    loc,
                    state.evaluator!.inference!.typeToString(type),
                );
            });
            Object.entries(res.usages).forEach(([key, locs]) => {
                if (!locs.length) {
                    state.results!.tops[topForLoc[+key]].usages[+key] = [];
                }
                locs.forEach((loc) => {
                    add(state.results!.tops[topForLoc[loc]].usages, +key, loc);
                });
            });
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
            state.results.tops[group[0].id].pluginResults = plugin.process(
                (node.parsed as PluginParsed).parsed,
                node.meta,
                state.evaluator,
                state.results.groups[groupKey].traces,
                env,
                node.ns.plugin!.options,
            );
            continue;
        }

        if (state.results.groups[groupKey].typeFailed) {
            if (state.debugExecOrder) {
                group.forEach((one) => {
                    showExecOrder(state.results!.tops, one, i);
                });
            }

            continue;
        }

        const stmts = group.reduce(
            (map, g) => (
                (map[g.id] = (nodes[g.id].parsed as SuccessParsed<any>).stmt),
                map
            ),
            {} as Record<string, any>,
        );
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
            renderValue,
        );

        group.forEach((one) => {
            one.names.forEach((name) => {
                if (name.kind === 'value') {
                    state.results!.tops[one.id].values[name.name] =
                        added.values[name.name];
                }
            });
            Object.assign(env.values, state.results!.tops[one.id].values);

            if (state.debugExecOrder) {
                showExecOrder(state.results!.tops, one, i);
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

function showExecOrder(tops: AsyncResults['tops'], one: Sortable, i: number) {
    tops[one.id].produce.push(
        `Exec order ${i}\nDeps: ${unique(one.deps.map((n) => n.name)).join(
            ', ',
        )}\nProduce: ${unique(one.names.map((n) => n.name)).join(', ')}`,
    );
}

export const add = <K extends string | number, T>(
    obj: Record<K, T[]>,
    k: K,
    item: T,
) => {
    if (!obj[k]) obj[k] = [item];
    else obj[k].push(item);
};
