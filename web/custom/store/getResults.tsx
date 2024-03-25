import { NUIState } from '../UIState';
import { fromMCST } from '../../../src/types/mcst';
import { findTops } from '../../ide/ground-up/findTops';
import { Results } from '../../ide/ground-up/GroundUp';
import { FullEvalator } from '../../ide/ground-up/Evaluators';
import { layout } from '../../../src/layout';
import { plugins } from '../plugins';
import { NUIResults } from './Store';
import { filterNulls } from '../reduce';
import { Path } from '../../store';

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
    // console.log('sorted', sorted);

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

export const depSort = <T,>(
    nodes: ({
        id: number;
        names: { name: string; loc: number }[];
        deps: { name: string }[];
        hidden?: boolean;
    } & T)[],
) => {
    const idForName: { [name: string]: number } = {};
    nodes.forEach((node) =>
        node.names.forEach(({ name }) => (idForName[name] = node.id)),
    );

    // Record<a, b> where a depends on b
    const edges: { [key: number]: number[] } = {};
    // Record<b, a> where b is a dependency of a
    const back: { [key: number]: number[] } = {};

    let hasDeps = false;
    nodes.forEach((node) => {
        if (node.deps.length) hasDeps = true;
        edges[node.id] = unique(
            node.deps.map(({ name }) => idForName[name]).filter(filterNulls),
        );
        edges[node.id].forEach((id) => {
            if (!back[id]) {
                back[id] = [node.id];
            } else {
                back[id].push(node.id);
            }
        });
    });

    if (!hasDeps) return nodes.map((node) => [node]);

    const keys = Object.keys(edges).map((m) => +m);

    let changed = true;
    while (changed) {
        changed = false;
        for (let key of keys) {
            const added: number[] = [];
            edges[key].forEach((dep) => {
                if (dep === key) return;
                added.push(
                    ...edges[dep].filter((k) => !edges[key].includes(k)),
                );
            });
            if (added.length) {
                changed = true;
                added.forEach((k) => {
                    if (!edges[key].includes(k)) {
                        edges[key].push(k);
                    }
                });
            }
        }
    }

    const cycles: { members: number[]; deps: number[] }[] = [];
    const used: Record<number, true> = {};
    const left: number[] = [];
    keys.forEach((k) => {
        if (used[k]) return;
        if (edges[k].includes(k)) {
            const cycle = [k];
            const deps: number[] = [];
            edges[k].forEach((d) => {
                if (edges[d].includes(k)) {
                    if (!cycle.includes(d)) {
                        cycle.push(d);
                    }
                } else {
                    deps.push(d);
                }
            });
            cycle.forEach((k) => (used[k] = true));
            cycles.push({ members: cycle, deps });
        } else {
            left.push(k);
        }
    });

    // Here's what we can do.

    const sorted: number[][] = [];

    const seen: Record<number, true> = {};

    let tick = 0;

    while (left.length || cycles.length) {
        if (tick++ > 10000) throw new Error('too many cycles');
        let toRemove: number[] = [];
        for (let i = 0; i < left.length; i++) {
            if (edges[left[i]].every((k) => seen[k])) {
                sorted.push([left[i]]);
                seen[left[i]] = true;
                toRemove.unshift(i);
                // left.splice(i, 1)
                // break
            }
        }
        if (toRemove.length) {
            toRemove.forEach((i) => left.splice(i, 1));
        }
        toRemove = [];
        for (let i = 0; i < cycles.length; i++) {
            if (cycles[i].deps.every((k) => seen[k])) {
                sorted.push(cycles[i].members);
                cycles[i].members.forEach((k) => (seen[k] = true));
                // cycles.splice(i, 1)
                // break
                toRemove.unshift(i);
            }
        }
        if (toRemove.length) {
            toRemove.forEach((i) => cycles.splice(i, 1));
        }
    }

    const byKey: Record<string, T> = {};
    nodes.forEach((n) => (byKey[n.id] = n));

    return sorted.map((group) => group.map((k) => byKey[k]));
};

export function sortTops<Env, Stmt, Expr>(
    tops: ReturnType<typeof findTops>,
    state: NUIState,
    results: NUIResults,
    evaluator: FullEvalator<Env, Stmt, Expr>,
) {
    const parsed = tops
        .map((top) => {
            const node = fromMCST(top.top, state.map);
            layout(
                top.top,
                0,
                state.map,
                results.display,
                results.hashNames,
                true,
            );

            if (
                node.type === 'blank' ||
                node.type === 'comment-node' ||
                node.type === 'rich-text'
            ) {
                results.produce[node.loc] = [' '];
                return {
                    id: top.top,
                    top,
                    node,
                    stmt: null,
                    names: [],
                    deps: [],
                };
            }
            const errs = {};
            const stmt = evaluator.parse(node, errs);
            Object.assign(results.errors, errs);
            if (!stmt) {
                results.produce[node.loc] = [
                    'not parsed ' + JSON.stringify(errs),
                ];
                if (top.plugin) {
                    return {
                        id: top.top,
                        top,
                        node,
                        stmt,
                        names: [],
                        deps: [],
                    };
                }
                return;
            }
            return {
                id: top.top,
                top,
                node,
                stmt,
                names: evaluator.stmtNames(stmt),
                deps: evaluator.dependencies(stmt),
            };
        })
        .filter(filterNulls);

    const sorted = depSort(parsed);
    return sorted;
}
