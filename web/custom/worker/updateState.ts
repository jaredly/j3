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
    // TODO: if none of the nodes have names/deps changes
    const sorted = depSort(
        Object.values(nodes).map(nodeToSortable).filter(filterNulls),
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

    const topsForName: Record<string, { top: number; group: string }> = {};
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

            const stmts = group.map(
                (g) => (nodes[g.id].parsed as SuccessParsed<any>).stmt,
            );
            try {
                const res = state.evaluator.inference.infer(stmts, tenv);
                if (res.result.type === 'ok') {
                    state.results.groups[groupKey].tenv = res.result.value;
                    state.results.groups[groupKey].typeFailed = false;
                } else {
                    state.results.groups[groupKey].typeFailed = true;
                    const err = res.result.err;
                    group.forEach((item) => {
                        state.results!.tops[item.id].produce.push({
                            type: 'error',
                            message: 'ok/err: ' + err.message,
                        });
                    });
                }
                // TODO...
                // res.typesAndLocs.forEach(tal => {
                // })
            } catch (err) {
                group.forEach((item) => {
                    state.results!.tops[item.id].produce.push({
                        type: 'error',
                        message:
                            'When doing infer for stmts: ' +
                            (err as Error).message,
                    });
                });
            }
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
                    showExecOrder(state, one, i);
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
            // state.results!.tops[one.id].changes.results = true;
            // console.log('Group setting results true', one.id);
            // state.results!.tops[one.id] = {
            //     changes: { results: true },
            //     errors: {},
            //     hover: {},
            //     produce: [],
            //     values: {},
            // };

            const node = nodes[one.id];
            if (node.parsed?.type === 'success') {
                node.parsed.names.forEach((name) => {
                    if (name.kind === 'value') {
                        state.results!.tops[one.id].values[name.name] =
                            added.values[name.name];
                    }
                });
            }

            if (state.debugExecOrder) {
                showExecOrder(state, one, i);
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
        )}`,
    );
}
