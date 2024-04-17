import { Node } from '../../../src/types/cst';
import { WorkerPlugin } from '../UIState';
import { LocedName } from '../store/sortTops';
import { Data, Expr, parse, parseExpr } from './Data';

export const fixtureWorker: WorkerPlugin<any, Data<Expr>, any> = {
    test: (node: Node) => {
        return parse(node, (node) => undefined) != null;
    },
    parse(node, errors, evaluator) {
        const deps: LocedName[] = [];
        const parsed = parse(node, parseExpr(evaluator, errors, deps));
        return parsed ? { parsed, deps } : null;
    },
    process(data, meta, evaluator, traces, env) {
        const setTracing = (idx: number | null) =>
            evaluator.setTracing(idx, traces, env);
        const evaluate = (expr: Expr) => {
            // const errors = {};
            // const expr = evaluator.parseExpr(node, errors);
            return evaluator.evaluate(expr, env, meta);
        };

        // const data = parse(node);
        // if (!data) {
        //     console.error(`Fixture plugin: failed to parse node`);
        //     console.log(node);
        //     return {};
        // }
        let test: null | Function = null;
        const results: {
            [key: number]: { expected: any; found: any; error?: string };
        } = {};
        if (data.test) {
            if (!data.test.expr) {
                return {};
            }
            try {
                test = evaluate(data.test.expr);
            } catch (err) {
                data.fixtures.forEach((item) => {
                    if (item.type === 'line' && item.input) {
                        results[item.input.node.loc] = {
                            error: (err as Error).message,
                            expected: null,
                            found: null,
                        };
                    }
                });
                return { results };
            }
            if (typeof test !== 'function') return {};
        }
        data.fixtures.forEach((item) => {
            if (item.type === 'line' && item.input?.expr) {
                try {
                    if (meta[item.input.node.loc]?.traceTop) {
                        setTracing(item.input.node.loc);
                    }
                    results[item.input.node.loc] = {
                        expected: item.output?.expr
                            ? evaluate(item.output?.expr)
                            : null,
                        found: test
                            ? test(evaluate(item.input.expr))
                            : evaluate(item.input.expr),
                    };
                } catch (err) {
                    // console.error(err);
                    // failed
                    results[item.input.node.loc] = {
                        expected: null,
                        found: null,
                        error: (err as Error).message,
                    };
                }
                if (meta[item.input.node.loc]?.traceTop) {
                    setTracing(null);
                }
            }
        });
        return results;
    },
};