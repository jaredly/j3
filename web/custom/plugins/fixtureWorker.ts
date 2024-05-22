import equal from 'fast-deep-equal';
import { Node } from '../../../src/types/cst';
import { WorkerPlugin } from '../UIState';
import { LocedName } from '../store/sortTops';
import { Data, Expr, parse, parseExpr } from './Data';
import { valueToString } from '../../ide/ground-up/valueToString';
import { AllNames } from '../../ide/ground-up/evaluators/interface';
import { blankAllNames } from '../../ide/ground-up/evaluators/analyze';
import { AnyEnv } from '../store/getResults';

export const compileFixture = (
    node: Node,
    evaluator: AnyEnv,
    options: never,
) => {
    const typeInfo = []; // STOPSHIP typeInfo
    const parsed = parse(node, parseExpr(evaluator, {}, blankAllNames()));
    if (!parsed) throw new Error(`cant compile fixture tests, unable to parse`);
    if (!parsed.test?.expr) throw new Error(`no test`);

    // STOPSHIP: get the type env...
    const info = evaluator.inference?.inferExpr(parsed.test.expr, null);

    // STOPSHIP: pass type info for real
    return `{
    const test = ${evaluator.compile(parsed.test?.expr, typeInfo, {})};
    ${parsed.fixtures
        .map((item, i) => {
            if (item.type === 'unknown') return '';
            if (!item.input?.expr && !item.output?.expr) return '';
            if (!item.input?.expr)
                throw new Error(`no input on line ${i} (${node.loc})`);
            if (!item.output?.expr)
                throw new Error(`no output on line ${i} (${node.loc})`);
            return `
    const in_${i} = ${evaluator.compile(item.input.expr, null, {})};
    const mod_${i} = test(in_${i});
    const out_${i} = ${evaluator.compile(item.output.expr, null, {})};
    if (!equal(mod_${i}, out_${i})) {
        console.log(mod_${i});
        console.log(out_${i});
        throw new Error(\`Fixture test (${
            node.loc
        }) failing ${i}. Not equal.\`);
    }
    `;
        })
        .join('\n')}
}`;
};

export const fixtureWorker: WorkerPlugin<any, Data<Expr>, any> = {
    test: (node: Node) => {
        return parse(node, (node) => undefined) != null;
    },
    compile: compileFixture,
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
            if (res.error) {
                errors.push([res.error, +k]);
            }
        }
        return errors;
    },

    process(data, meta, evaluator, traces, env, _options, tenv) {
        const setTracing = (idx: number | null) =>
            evaluator.setTracing(idx, traces, env);
        const evaluate = (expr: Expr) => {
            const t = evaluator.inference?.inferExpr(expr, tenv);
            return evaluator.evaluate(
                expr,
                evaluator.analysis?.allNamesExpr(expr) ?? blankAllNames(),
                t?.codeGenData,
                env,
                meta,
            );
        };

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
                return results;
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
    if (typeof x === 'function') {
        throw new Error(`Cannot send function ${x + ''}`);
    }
    try {
        structuredClone(x);
    } catch (_) {
        throw new Error(`Cannot send ${typeof x}: ${JSON.stringify(x)}`);
    }
    return x;
};
