import { MetaDataMap } from '../UIState';
import { filterNulls } from '../old-stuff/filterNulls';
import { depSort } from '../store/depSort';
import { displayFunction } from '../store/displayFunction';
import { ImmediateResults, SuccessParsed } from '../store/getImmediateResults';
import { AnyEnv } from '../store/getResults';
import { nodeToSortable } from './calculateInitialState';
import { State } from './types';

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

    for (let group of sorted) {
        const groupKey = group.map((g) => g.id).join(';');

        const sourceUpdate = group.some((g) => update[g.id]);
        const depsUpdate = group.some((g) =>
            g.deps.some((ln) => {
                const got = topsForName[ln.name];
                if (!got) return false;
                return state.results!.groups[got.group].changed;
                // if (state.results!.tops[got.top].changes.source)
            }),
        );

        if (sourceUpdate || depsUpdate) {
            state.results.groups[groupKey] = {
                changed: true,
                tenv: null,
                tops: group.map((g) => g.id),
                traces: {},
            };
            // console.log('group needs update', groupKey);
        } else {
            if (!state.results.groups[groupKey]) {
                throw new Error(
                    `a group wasnt in 'update', but ... didnt exist`,
                );
            }
            state.results.groups[groupKey].changed = false;
        }
    }

    if (state.evaluator.inference) {
        // TODO
    }

    let env = state.evaluator.init();
    let i = -1;
    for (let group of sorted) {
        i++;
        if (group.length === 1 && group[0].isPlugin) {
            // umm gotta plugin please
            continue;
        }
        const groupKey = group.map((g) => g.id).join(';');
        // This does "deep" change propagation
        if (!state.results.groups[groupKey].changed) {
            group.forEach((one) => {
                // console.log('reset', one.id);
                state.results!.tops[one.id].changes = {};
                Object.assign(env.values, state.results!.tops[one.id].values);
            });

            // env

            continue;
        }

        // console.log('re-evaluate', groupKey);

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
            state.results!.tops[one.id] = {
                changes: { results: true },
                errors: {},
                hover: {},
                produce: [],
                values: {},
            };

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
                state.results!.tops[one.id].produce.push(
                    `Exec order ${i}\nDeps: ${one.deps
                        .map((n) => n.name)
                        .join(', ')}`,
                );
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
