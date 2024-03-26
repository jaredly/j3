import { NUIState } from '../UIState';
import { fromMCST } from '../../../src/types/mcst';
import { findTops } from '../../ide/ground-up/findTops';
import { FullEvalator } from '../../ide/ground-up/Evaluators';
import { layout } from '../../../src/layout';
import { NUIResults } from './Store';
import { filterNulls } from '../reduce';
import { depSort } from './depSort';
import { Node } from '../../../src/types/cst';

type Tops = ReturnType<typeof findTops>;
export type LocedName = { name: string; loc: number; kind: 'type' | 'value' };
export type SortedInfo<Stmt> = {
    id: number;
    top: Tops[0];
    node: Node;
    stmt: void | null | Stmt;
    names: LocedName[];
    deps: LocedName[];
};

export function sortTops<Env, Stmt, Expr>(
    tops: Tops,
    state: NUIState,
    results: NUIResults,
    evaluator: FullEvalator<Env, Stmt, Expr>,
): SortedInfo<Stmt>[][] {
    const parsed = tops
        .map((top): SortedInfo<Stmt> | null | void => {
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
