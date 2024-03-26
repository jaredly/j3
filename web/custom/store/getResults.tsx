import { MetaData, NUIState, RealizedNamespace } from '../UIState';
import { findTops } from '../../ide/ground-up/findTops';
import { FullEvalator, ProduceItem } from '../../ide/ground-up/Evaluators';
import { layout } from '../../../src/layout';
import { plugins } from '../plugins';
import { NUIResults } from './Store';
import { SortedInfo, sortTops } from './sortTops';
import { Node } from '../../../src/types/cst';

export type ResultsCache = {
    lastState: null | NUIState;
    // the result of `fromMCST`
    // and the IDs of all included nodes. We can do a quick
    // check of each of the `ids` to see if we need to recalculate
    nodes: { [top: number]: { node: Node; ids: string[] } };
    // the result of "infer_stmt"
    // recalculated if (contents) or (types of dependencies) change
    types: {
        [top: number]:
            | { type: 'success'; env: any; ts: number }
            | { type: 'error'; error: any; previous: any };
    };
    // results! recalculated if (contents) or (dependencies) change
    results: {
        [top: number]:
            | { type: 'error'; error: any } // ToDO should I hang on to previous data?
            | {
                  type: 'success';
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
    cache: ResultsCache,
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
    };
    const tops = findTops(state);

    if (!evaluator) {
        tops.forEach(({ top }) => {
            results.produce[top] = ['No evaluator'];
            layout(top, 0, state.map, results.display, results.hashNames, true);
        });
        return results;
    }

    const sorted = sortTops(tops, state, results, evaluator);

    // OK SO. we want ... to .... make a deep deps map, as well as identifying cycles?

    const changes: {
        [top: number]: {
            source: boolean;
            type: boolean;
            value: boolean;
        };
    } = {};

    // PROCESS:
    // we do dependency analysis on everything
    // with an algorithm that will hopefully leave things in place as much as possible.
    // OOOH we could do a sort! Right? hrm. Yeah, if we had a deep dependency map.

    results.env = evaluator.init();
    sorted.forEach((group, i) => {
        group.forEach((item) => {
            item.names.forEach((name) => {
                results.jumpToName[name.name] = name.loc;
            });
        });

        if (group.length === 1 && group[0].top.plugin) {
            const {
                top: { plugin },
                node,
            } = group[0];
            processPlugin(results, node, plugin, state, evaluator);
            return;
        }

        const stmts: { [key: number]: Stmt } = {};
        group.forEach((node) => {
            if (node.stmt) {
                stmts[node.id] = node.stmt;
            }
        });
        const { env, display } = evaluator.addStatements(
            stmts,
            results.env!,
            state.meta,
            results.traces,
        );
        results.env = env;
        group.forEach((node) => {
            if (!Array.isArray(display[node.id])) {
                display[node.id] = [display[node.id] as any];
            }
        });
        Object.assign(results.produce, display);
        if (debugExecOrder) {
            showExecOrder(group, results, i);
        }
    });

    return results;
};

export const unique = (names: number[]) => {
    const seen: Record<number, true> = {};
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
    results.pluginResults[node.loc] = pl.process(
        node,
        state,
        evaluator,
        results,
        options,
    );
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
