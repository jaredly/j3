import { NUIState } from '../UIState';
import { fromMCST } from '../../../src/types/mcst';
import { findTops } from '../../ide/ground-up/reduce';
import { Results } from '../../ide/ground-up/GroundUp';
import { FullEvalator } from '../../ide/ground-up/Evaluators';
import { layout } from '../../../src/layout';
import { plugins } from '../plugins';
import { NUIResults } from './Store';

export const getResults = (
    state: NUIState,
    evaluator: FullEvalator<any, any, any> | null,
) => {
    const results: NUIResults = {
        display: {},
        errors: {},
        hashNames: {},
        produce: {},
        env: null,
        traces: {},
        pluginResults: {},
    };
    console.log('getting results for', evaluator?.id);

    results.env = evaluator?.init();
    findTops(state).forEach(({ top, hidden, plugin }) => {
        if (hidden) return;
        const stmt = fromMCST(top, state.map);
        if (stmt.type === 'blank') {
            results.produce[stmt.loc] = ' ';
            return;
        }
        if (evaluator) {
            if (plugin) {
                results.produce[stmt.loc] = 'evaluated by plugin';
                const pid = typeof plugin === 'string' ? plugin : plugin.id;
                const options =
                    typeof plugin === 'string' ? null : plugin.options;
                const pl = plugins.find((p) => p.id === pid);
                if (!pl) {
                    results.produce[stmt.loc] = `plugin ${pid} not found`;
                    return;
                }
                results.pluginResults[stmt.loc] = pl.process(
                    fromMCST(top, state.map),
                    state,
                    evaluator,
                    results,
                    // state.meta,
                    // (node) => {
                    //     const errors = {};
                    //     const expr = evaluator.parseExpr(node, errors);
                    //     return evaluator.evaluate(
                    //         expr,
                    //         results.env,
                    //         state.meta,
                    //     );
                    // },
                    // (idx) => evaluator.setTracing(idx, results.traces),
                    options,
                );
            } else {
                const errs: Results['errors'] = {};
                const ast = evaluator.parse(stmt, errs);
                Object.assign(results.errors, errs);
                if (ast) {
                    const res = evaluator.addStatement(
                        ast,
                        results.env!,
                        state.meta,
                        results.traces,
                    );
                    results.env = res.env;
                    results.produce[stmt.loc] = res.display;
                    // console.log('good', res.display);
                } else {
                    // console.log('not parsed');
                    results.produce[stmt.loc] =
                        'not parsed ' + JSON.stringify(errs);
                }
            }
        } else {
            results.produce[stmt.loc] = 'No evaluator';
        }

        layout(top, 0, state.map, results.display, results.hashNames, true);
    });

    return results;
};
