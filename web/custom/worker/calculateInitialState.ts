import { AnyEnv } from '../../ide/ground-up/FullEvalator';
import { ImmediateResults, NodeResults } from '../store/getImmediateResults';
import { Sortable } from './types';
import { updateState } from './updateState';

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
            allNames: node.parsed.allNames,
            isPlugin: true,
        };
    } else if (node.parsed?.type === 'success') {
        return {
            id: node.ns.id,
            allNames: node.parsed.allNames,
            isPlugin: false,
        };
    } else {
        return null;
    }
};

export function calculateInitialState(
    nodes: ImmediateResults<any>['nodes'],
    evaluator: AnyEnv,
    debugExecOrder: boolean,
    debugShowJs: boolean,
) {
    return updateState(
        {
            evaluator,
            nodes: {},
            results: {
                groups: {},
                sorted: [],
                tops: {},
            },
            debugExecOrder,
            debugShowJs,
        },
        nodes,
    );
}
