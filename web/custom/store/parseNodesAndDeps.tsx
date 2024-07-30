import { NUIState, RealizedNamespace } from '../UIState';
import { Errors, FullEvalator } from '../../ide/ground-up/FullEvalator';
import { layout } from '../../../src/old-layout';
import { NUIResults } from './Store';
import { fromMCST } from '../../../src/types/mcst';
import equal from 'fast-deep-equal';
import { depSort } from './depSort';
import { filterNulls } from '../old-stuff/filterNulls';
import { Display } from '../../../src/to-ast/library';
import { Path } from '../../store';
import { registerNames, emptyResults } from './getResults';
import { ResultsCache, DepsOrNoDeps, ChangesMap } from './ResultsCache';
import { add } from '../worker/add';

export function sortTopsWithDeps<Stmt>(
    cache: ResultsCache<Stmt>,
    tops: {
        top: number;
        path: Path[]; // console.log('Doing a plugin', topsById[node.id].plugin);

        // console.log('Doing a plugin', topsById[node.id].plugin);
        ns: RealizedNamespace;
    }[],
): DepsOrNoDeps[][] {
    return !cache.deps
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
                                // names: cache.deps[top].names,
                                // deps: cache.deps[top].deps,
                                allNames: cache.deps[top].allNames,
                            }
                          : null;
                  })
                  .filter(filterNulls),
          );
}

export function parseNodesAndDeps<
    Env extends { values: { [key: string]: any } },
    Stmt,
    Expr,
>(
    tops: { top: number; path: Path[]; ns: RealizedNamespace }[],
    cache: ResultsCache<Stmt>,
    lastState: NUIState | null,
    state: NUIState,
    evaluator: FullEvalator<Env, Stmt, Expr>,
) {
    const results = emptyResults();
    const changes: ChangesMap = {};
    tops.forEach((top) => (changes[top.top] = {}));

    const idForName: { [name: string]: number } = {};

    tops.forEach((top) => {
        const nsChange = cache.nodes[top.top]
            ? cache.nodes[top.top].ns.plugin !== top.ns.plugin ||
              cache.nodes[top.top].ns.display !== top.ns.display
            : false;
        if (nsChange) {
            changes[top.top].ns = true;
        }

        if (cache.nodes[top.top] && lastState && !nsChange) {
            if (
                !cache.nodes[top.top].ids.some(
                    (id) =>
                        state.map[+id] !== lastState.map[+id] ||
                        state.meta[+id] !== lastState.meta[+id],
                )
            ) {
                // console.log(
                //     `No map/meta changes for ${top.top}, reusing display`,
                // );
                Object.assign(results.display, cache.nodes[top.top].display);

                if (cache.deps?.[top.top]?.allNames) {
                    registerNames(cache, top.top, results, idForName);
                }
                if (!cache.nodes[top.top].parsed) {
                    if (
                        Object.keys(cache.nodes[top.top].parseErrors ?? {})
                            .length
                    ) {
                        results.produce[top.top] = [
                            {
                                type: 'error',
                                message: `Parse error, or no stmt idk ${JSON.stringify(
                                    cache.nodes[top.top].parseErrors,
                                )}`,
                            },
                        ];
                    }
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
            if (cache.deps?.[top.top]?.allNames) {
                registerNames(cache, top.top, results, idForName);
            }

            return;
        }

        const display: Display = {};
        // console.log('PARSE & LAYOUT', top);
        layout(top.top, 0, state.map, display, results.hashNames, true);
        Object.assign(results.display, display);

        changes[top.top].source = true;
        const { stmt, errors } = evaluator.parse(node);
        changes[top.top].stmt = cache.nodes[top.top]?.parsed
            ? !equal(cache.nodes[top.top].parsed!.stmt, stmt) ||
              cache.nodes[top.top].ids.some(
                  (id) => state.meta[+id] !== lastState!.meta[+id],
              )
            : true;
        if (!stmt) {
            // console.log('no stmt', node, errors);
            if (Object.keys(errors).length) {
                results.produce[top.top] = [
                    { type: 'error', message: JSON.stringify(errors) },
                ];
            }
        }
        cache.nodes[top.top] = {
            ns: top.ns,
            ids,
            node,
            display,
            parsed: stmt ? { stmt } : undefined,
            parseErrors: errors.length ? errorsListToMap(errors) : null,
        };

        if (stmt && evaluator.analysis) {
            if (changes[top.top].stmt) {
                const allNames = evaluator.analysis.allNames(stmt);
                // const deps = evaluator.analysis.externalsStmt(stmt);
                cache.deps![top.top] = { allNames };
                registerNames(cache, top.top, results, idForName);
            }
        }
    });

    return { changes, idForName, results };
}

export function errorsListToMap(errors: [number, string][]): Errors {
    return errors.reduce((err, [k, v]) => (add(err, k, v), err), {} as Errors);
}
