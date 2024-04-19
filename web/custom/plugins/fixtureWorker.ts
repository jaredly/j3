import equal from 'fast-deep-equal';
import { Node } from '../../../src/types/cst';
import { WorkerPlugin } from '../UIState';
import { LocedName } from '../store/sortTops';
import { Data, Expr, parse, parseExpr } from './Data';

export const fixtureWorker: WorkerPlugin<any, Data<Expr>, any> = {
    test: (node: Node) => {
        return parse(node, (node) => undefined) != null;
    },
    infer(parsed, evaluator) {
        return {
            result: { type: 'ok', value: null },
            typesAndLocs: [],
            usages: {},
        };
    },
    // infer(parsed, evaluator, tenv) {
    //     const { result, typesAndLocs } = evaluator.inference!.inferExpr(
    //         parsed.expr,
    //         tenv,
    //     );
    //     return {
    //         result: result.type === 'ok' ? { type: 'ok', value: null } : result,
    //         typesAndLocs,
    //     };
    // },
    parse(node, errors, evaluator) {
        const deps: LocedName[] = [];
        const parsed = parse(node, parseExpr(evaluator, errors, deps));
        return parsed ? { parsed, deps } : null;
    },

    hasErrors(results: {
        [key: number]: { expected: any; found: any; error?: string };
    }) {
        for (let [k, res] of Object.entries(results)) {
            if (res.error) return true;
            if (!equal(res.expected, res.found)) return true;
        }
        return false;
    },

    process(data, meta, evaluator, traces, env) {
        const setTracing = (idx: number | null) =>
            evaluator.setTracing(idx, traces, env);
        const evaluate = (expr: Expr) => evaluator.evaluate(expr, env, meta);

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
                        expected: ensureSendable(
                            item.output?.expr
                                ? evaluate(item.output?.expr)
                                : null,
                        ),
                        found: ensureSendable(
                            test
                                ? test(evaluate(item.input.expr))
                                : evaluate(item.input.expr),
                        ),
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

const ensureSendable = (x: any) => {
    try {
        structuredClone(x);
    } catch (_) {
        throw new Error(`Cannot send ${typeof x}: ${JSON.stringify(x)}`);
    }
    return x;
};
