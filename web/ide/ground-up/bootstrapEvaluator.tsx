import { bootstrap, valueToNode } from './bootstrap';
import { Errors, FullEvalator, Produce } from './FullEvalator';
import { valueToString } from './valueToString';
import { findTops } from './findTops';
import { Ctx, expr, parseExpr, parseStmt, stmt } from './round-1/parse';
import { sanitize } from './round-1/sanitize';
import { fromMCST } from '../../../src/types/mcst';
import { sanitizedEnv } from './loadEv';
import { unique } from '../../custom/store/unique';
import { add } from '../../custom/worker/add';

/**
 * This turns a sandbox that ':bootstrap:' as its evaluator
 * into an evaluator in its own right.
 */

export const bootstrapEvaluator = (
    id: string,
    data: any,
): FullEvalator<
    { values: { [key: string]: any }; source: string[] },
    stmt & { loc: number },
    expr
> => {
    let benv = bootstrap.init();
    data.stmts.forEach((stmt: stmt & { loc: number }) => {
        if (stmt.type === 'sexpr') return;
        const res = bootstrap.addStatements(
            { [0]: { stmt } },
            benv,
            null,
            {},
            {},
            -1,
        );
        benv = res.env;
    });
    const san = sanitizedEnv(benv.values);
    const envArgs = '{' + Object.keys(san).join(', ') + '}';
    return {
        id,
        init() {
            return { values: bootstrap.init().values, source: [] };
        },
        compile(expr, meta) {
            throw new Error('bootstrap eval cant compile');
        },
        analysis: bootstrap.analysis,
        valueToString,
        valueToNode,
        setTracing(idx, traceMap) {},
        addStatements(stmts: Record<number, { stmt: stmt }>, env) {
            const display: Record<number, Produce> = {};
            const values: Record<string, any> = {};
            let js: string[] = [];

            const valArgs = Object.keys(env.values).map(
                (name) => [name, sanitize(name)] as const,
            );
            const valMap: Record<string, any> = {};
            valArgs.forEach(([n, sn]) => (valMap[sn] = env.values[n]));
            const valArgText = `{${unique(valArgs.map((n) => n[1]))
                .filter((n) => san[n] === undefined)
                .join(',')}}`;

            Object.keys(stmts).forEach((loc) => {
                const { stmt } = stmts[+loc];

                if (stmt.type === 'sdef' || stmt.type === 'sdeftype') {
                    let raw;
                    try {
                        raw = benv.values['compile-st'](stmt);
                        js.push(raw);
                        env.source.push(raw);
                        try {
                            const name = stmt.type === 'sdef' ? stmt[0] : null;
                            const res = new Function(
                                envArgs,
                                valArgText,
                                '{' +
                                    env.source.join('\n') +
                                    (stmt.type === 'sdef'
                                        ? `\nreturn ${sanitize(stmt[0])}`
                                        : '') +
                                    '}',
                            )(san, valMap);
                            if (name) {
                                values[name] = res;
                            }
                            display[+loc] = valueToString(res);
                            return;
                        } catch (err) {
                            display[+loc] = `Evaluation error ${
                                (err as Error).message
                            }`;
                        }
                    } catch (err) {
                        console.error(err);
                        display[+loc] = {
                            type: 'error',
                            message: (err as Error).message,
                            stack: (err as Error).stack,
                        };
                    }
                }
                if (stmt.type === 'sexpr') {
                    let raw;
                    try {
                        raw = benv.values['compile-st'](stmt);
                    } catch (err) {
                        console.error(err);
                        display[+loc] = {
                            type: 'error',
                            message:
                                'Compilation failed: ' + (err as Error).message,
                        };
                        return;
                    }
                    js.push(raw);
                    const full =
                        '{' + env.source.join('\n') + '\nreturn ' + raw + '}';
                    try {
                        const res = new Function(envArgs, valArgText, full)(
                            san,
                            valMap,
                        );
                        display[+loc] = valueToString(res);
                        values._ = res;
                    } catch (err) {
                        // console.log(envArgs);
                        // console.log(full);
                        // console.error(err);
                        display[+loc] = {
                            type: 'withjs',
                            message:
                                'Error evaluating! ' + (err as Error).message,
                            js: raw,
                        };
                    }
                }
            });
            return {
                env,
                display,
                values,
                js: js.length ? js.join('\n') : undefined,
            };
        },
        toFile(state, target) {
            // if (target != null) {
            //     throw new Error(
            //         `bootstrap evaluator not equipped for target toFile`,
            //     );
            // }
            let env = this.init();
            const errors: Errors = {};
            const names: string[] = [];
            let ret: null | string = null;
            findTops(state).forEach((top) => {
                const node = fromMCST(top.top, state.map);
                if (node.type === 'blank') return;
                const { stmt: parsed, errors: nodeErrors } = this.parse(node);
                nodeErrors.forEach(([k, v]) => add(errors, k, v));
                if (!parsed) return;
                if (parsed.type === 'sdef') {
                    names.push(parsed[0]);
                }
                let res;
                try {
                    res = this.addStatements(
                        { [0]: { stmt: parsed } },
                        env,
                        null,
                        {},
                        {},
                        top.top,
                    );
                } catch (err) {
                    console.error(err);
                    return;
                }
                env = res.env;
                if (top.top === target && res.js) {
                    ret = res.js;
                }
            });
            if (ret) {
                env.source.push(`return ${ret}`);
            } else if (target != null) {
                throw new Error(`no ret, even though given a target ${target}`);
            } else {
                env.source.push(
                    `return {type: 'fns', ${names
                        .map((name) => sanitize(name))
                        .sort()
                        .join(', ')}}`,
                );
            }
            return { js: env.source.join('\n'), errors };
        },
        parse(node) {
            const ctx: Ctx = { errors: {}, display: {} };
            const stmt = parseStmt(node, ctx) as stmt & { loc: number };
            if (stmt) {
                stmt.loc = node.loc;
            }
            return {
                stmt,
                errors: Object.keys(ctx.errors).flatMap((k) =>
                    ctx.errors[+k].map((s): [number, string] => [+k, s]),
                ),
            };
        },
        parseExpr(node) {
            const ctx: Ctx = { errors: {}, display: {} };
            return {
                expr: parseExpr(node, ctx) ?? null,
                errors: Object.keys(ctx.errors).flatMap((k) =>
                    ctx.errors[+k].map((s): [number, string] => [+k, s]),
                ),
            };
        },

        evaluate(expr, allNames, env) {
            const valArgs = Object.keys(env.values).map(
                (name) => [name, sanitize(name)] as const,
            );
            const valMap: Record<string, any> = {};
            valArgs.forEach(([n, sn]) => (valMap[sn] = env.values[n]));
            const valArgText = `{${unique(valArgs.map((n) => n[1]))
                .filter((n) => san[n] === undefined)
                .join(',')}}`;
            let raw;
            try {
                raw = benv.values['compile'](expr);
            } catch (err) {
                console.error(err);
                return 'Compilation failed: ' + (err as Error).message;
            }
            try {
                const res = new Function(
                    envArgs,
                    valArgText,
                    '{' + env.source.join('\n') + '\nreturn ' + raw + '}',
                )(san, valMap);
                return res;
            } catch (err) {
                console.log(raw);
                console.error(err);
                return (
                    'Error evaluating! ' + (err as Error).message
                    // '\n' +
                    // raw
                );
            }
        },
    };
    // first we have to pass everything through the bootstrapping.
};
