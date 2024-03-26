import { NUIState } from '../UIState';
import { findTops } from '../../ide/ground-up/findTops';
import { Results } from '../../ide/ground-up/GroundUp';
import { FullEvalator } from '../../ide/ground-up/Evaluators';
import { layout } from '../../../src/layout';
import { plugins } from '../plugins';
import { NUIResults } from './Store';
import { Path } from '../../store';
import { sortTops } from './sortTops';
import { Node } from '../../../src/types/cst';

type ResultsCache = {
    nodes: { [top: number]: { node: Node; ids: string[] } };
    types: { [top: number]: any };
};

export const getResults = <Env, Stmt, Expr>(
    state: NUIState,
    evaluator: FullEvalator<Env, Stmt, Expr> | null,
    debugExecOrder: boolean,
) => {
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

        if (group.length === 1) {
            const {
                top: { plugin },
                node,
                stmt,
            } = group[0];
            if (plugin) {
                results.produce[node.loc] = ['evaluated by plugin'];
                const pid = typeof plugin === 'string' ? plugin : plugin.id;
                const options =
                    typeof plugin === 'string' ? null : plugin.options;
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
            } else if (stmt) {
                const res = evaluator.addStatement(
                    stmt,
                    results.env!,
                    state.meta,
                    results.traces,
                );
                results.env = res.env;
                results.produce[node.loc] = Array.isArray(res.display)
                    ? res.display
                    : [res.display];
                if (debugExecOrder) {
                    const deps: Record<string, true> = {};
                    group[0].deps.forEach((d) => (deps[d.name] = true));
                    results.produce[node.loc].push(
                        'Deps: ' + Object.keys(deps).join(', '),
                    );
                    results.produce[node.loc].push('Execution Order: ' + i);
                }
            }
            return;
        }

        if (!evaluator.addStatements) {
            group.forEach((node) => {
                results.produce[node.id] = [`Evaluator can't handle cycles`];
            });
        } else {
            const stmts: { [key: number]: Stmt } = {};
            group.forEach((node) => {
                stmts[node.id] = node.stmt!;
            });
            const { env, display } = evaluator.addStatements(
                stmts,
                results.env!,
                state.meta,
                results.traces,
            );
            results.env = env;
            Object.assign(results.produce, display);
            const names = group.flatMap((node) => node.names);
            group.forEach((node) => {
                if (!Array.isArray(results.produce[node.id])) {
                    results.produce[node.id] = [
                        results.produce[node.id] as any,
                    ];
                }
                if (debugExecOrder) {
                    results.produce[node.id].push('Cycle: ' + names.join(', '));
                    results.produce[node.id].push(
                        'Deps: ' + node.deps.map((d) => d.name).join(', '),
                    );
                    results.produce[node.id].push('Execution Order: ' + i);
                }
            });
        }
    });

    return results;
};

export const unique = (names: number[]) => {
    const seen: Record<number, true> = {};
    return names.filter((k) => (seen[k] ? false : (seen[k] = true)));
};
