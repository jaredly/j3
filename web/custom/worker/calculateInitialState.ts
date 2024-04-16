import { AnyEnv } from '../../ide/ground-up/FullEvalator';
import { MetaDataMap } from '../UIState';
import {
    ImmediateResults,
    NodeResults,
    SuccessParsed,
} from '../store/getImmediateResults';
import { depSort } from '../store/depSort';
import { filterNulls } from '../old-stuff/filterNulls';
import { showError } from '../store/processTypeInference';
import { displayFunction } from '../store/displayFunction';
import { AsyncResults, Sortable } from './types';

export const add = <K extends string | number, T>(
    obj: Record<K, T[]>,
    k: K,
    item: T,
) => {
    if (!obj[k]) obj[k] = [item];
    else obj[k].push(item);
};

export const nodeToSortable = (node: NodeResults<any>): Sortable | null => {
    if (node.parsed?.type === 'plugin') {
        return {
            id: node.ns.id,
            deps: node.parsed.deps,
            names: [],
            isPlugin: true,
        };
    } else if (node.parsed?.type === 'success') {
        return {
            id: node.ns.id,
            deps: node.parsed.deps,
            names: node.parsed.names,
            isPlugin: false,
        };
    } else {
        return null;
    }
};

export function calculateInitialState(
    nodes: ImmediateResults<any>['nodes'],
    evaluator: AnyEnv,
) {
    const topForLoc: Record<number, number> = {};
    Object.values(nodes).forEach((node) => {
        node.ids.forEach((id) => (topForLoc[id] = node.ns.id));
    });

    const sorted = depSort(
        Object.values(nodes).map(nodeToSortable).filter(filterNulls),
    );

    const results: AsyncResults = {
        groups: {},
        sorted,
        tops: {},
    };
    Object.keys(nodes).forEach((id) => {
        results.tops[+id] = {
            changes: { results: true },
            errors: {},
            hover: {},
            produce: [],
            values: {},
        };
    });

    for (let group of sorted) {
        const groupKey = group.map((g) => g.id).join(';');
        results.groups[groupKey] = {
            changed: true,
            tenv: null,
            tops: group.map((g) => g.id),
            traces: {},
        };
    }

    if (evaluator.inference) {
        let tenv = evaluator.inference.initType();
        for (let group of sorted) {
            if (group.length === 1 && group[0].isPlugin) {
                // tbh
                continue;
            }
            const { result, typesAndLocs } = evaluator.inference.infer(
                group.map(
                    (g) => (nodes[g.id].parsed as SuccessParsed<any>).stmt,
                ),
                tenv,
            );

            const groupKey = group.map((g) => g.id).join(';');
            typesAndLocs.forEach(({ loc, type }) => {
                add(
                    results.tops[topForLoc[loc]].hover,
                    loc,
                    evaluator.inference!.typeToString(type),
                );
            });
            // hovers[groupKey] = groupHover;
            if (result.type === 'err') {
                const text = showError(result.err);
                result.err.items.forEach(({ loc }) => {
                    add(results.tops[topForLoc[loc]].errors, loc, text);
                });
                group.forEach((g) =>
                    results.tops[g.id].produce.push({
                        type: 'error',
                        message: text,
                    }),
                );
                continue;
            }
            results.groups[groupKey].tenv = result.value;

            tenv = evaluator.inference.addTypes(tenv, result.value);

            for (let one of group) {
                for (let { name, kind } of one.names) {
                    if (kind === 'value') {
                        const t = evaluator.inference!.typeForName(tenv, name);
                        results.tops[one.id].produce.push(
                            t
                                ? evaluator.inference!.typeToString(t)
                                : `No type for ${name}`,
                        );
                    }
                }
            }
        }
    }

    let env = evaluator.init();
    for (let group of sorted) {
        if (group.length === 1 && group[0].isPlugin) {
            // umm gotta plugin please
            continue;
        }
        const groupKey = group.map((g) => g.id).join(';');
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
        const added = evaluator.addStatements(
            stmts,
            env,
            meta,
            results.groups[groupKey].traces,
            renderValue,
        );

        group.forEach((one) => {
            const node = nodes[one.id];
            if (node.parsed?.type === 'success') {
                node.parsed.names.forEach((name) => {
                    if (name.kind === 'value') {
                        results.tops[one.id].values[name.name] =
                            added.values[name.name];
                    }
                });
            }
        });

        Object.entries(added.display).forEach(([key, produce]) => {
            results.tops[+key].produce.push(
                ...(Array.isArray(produce) ? produce : [produce]),
            );
        });
    }

    return { evaluator, nodes: nodes, results };
}
