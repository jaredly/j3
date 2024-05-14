import equal from 'fast-deep-equal';
import { Node } from '../../../src/types/cst';
import { WorkerPlugin } from '../UIState';
import { LocedName } from '../store/sortTops';
import { Data, Expr, parse, parseExpr } from './Data';
import { valueToString } from '../../ide/ground-up/valueToString';
import { AllNames } from '../../ide/ground-up/evaluators/interface';
import { blankAllNames } from '../../ide/ground-up/evaluators/analyze';

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
        // const deps: LocedName[] = [];
        const allNames: AllNames = {
            global: { declarations: [], usages: [] },
            local: { usages: [], declarations: [] },
        };
        const parsed = parse(node, parseExpr(evaluator, errors, allNames));
        return parsed ? { parsed, allNames } : null;
    },

    getErrors(results: {
        [key: number]: { expected: any; found: any; error?: string };
    }) {
        const errors: [string, number][] = [];
        for (let [k, res] of Object.entries(results)) {
            if (res.error) {
                errors.push([res.error, +k]);
            }
            if (!equal(res.expected, res.found)) {
                errors.push([
                    `Fixture test not equal ${valueToString(
                        res.expected,
                    )} vs ${valueToString(res.found)}`,
                    +k,
                ]);
            }
            if (res.expected === undefined) {
                errors.push([`No "expected" value for fixture test`, +k]);
            }
        }
        return errors;
    },

    process(data, meta, evaluator, traces, env) {
        const setTracing = (idx: number | null) =>
            evaluator.setTracing(idx, traces, env);
        const evaluate = (expr: Expr) =>
            evaluator.evaluate(
                expr,
                evaluator.analysis?.allNamesExpr(expr) ?? blankAllNames(),
                env,
                meta,
            );

        let test: null | Function = null;
        const results: {
            [key: number]: { expected: any; found: any; error?: string };
        } = {};
        if (data.test) {
            if (!data.test.expr) {
                return {
                    [data.test.node.loc]: {
                        expected: null,
                        found: null,
                        error: "Test expression didn't parse",
                    },
                };
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
            if (typeof test !== 'function')
                return {
                    [data.test.node.loc]: {
                        expected: null,
                        found: null,
                        error: "Test expression isn't a function",
                    },
                };
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
