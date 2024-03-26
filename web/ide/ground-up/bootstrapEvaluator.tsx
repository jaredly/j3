import { Errors, FullEvalator, Produce, bootstrap } from './Evaluators';
import { valueToString } from './reduce';
import { findTops } from './findTops';
import { expr, parseExpr, parseStmt, stmt } from './round-1/parse';
import { sanitize } from './round-1/sanitize';
import { fromMCST } from '../../../src/types/mcst';
import { sanitizedEnv } from './loadEv';

/**
 * This turns a sandbox that ':bootstrap:' as its evaluator
 * into an evaluator in its own right.
 */

export const bootstrapEvaluator = (
    id: string,
    data: any,
): FullEvalator<any, stmt & { loc: number }, expr> => {
    let benv = bootstrap.init();
    data.stmts.forEach((stmt: stmt & { loc: number }) => {
        const res = bootstrap.addStatements({ [0]: stmt }, benv, {}, {}).env;
        benv = res.env;
    });
    const san = sanitizedEnv(benv);
    const envArgs = '{' + Object.keys(san).join(', ') + '}';
    return {
        id,
        init(): string[] {
            return [];
        },
        stmtNames: () => [],
        dependencies: () => [],
        setTracing(idx, traceMap) {},
        addStatements(stmts: Record<number, stmt>, env) {
            const display: Record<number, Produce> = {};
            const values: Record<string, any> = {};

            Object.keys(stmts).forEach((loc) => {
                const stmt = stmts[+loc];

                if (stmt.type === 'sdef' || stmt.type === 'sdeftype') {
                    let raw;
                    try {
                        raw = benv['compile-st'](stmt);
                        env.push(raw);
                        try {
                            const name = stmt.type === 'sdef' ? stmt[0] : null;
                            const res = new Function(
                                envArgs,
                                '{' +
                                    env.join('\n') +
                                    (stmt.type === 'sdef'
                                        ? `\nreturn ${stmt[0]}`
                                        : '') +
                                    '}',
                            )(san);
                            return {
                                env,
                                display: valueToString(res),
                                values: name ? { [name]: res } : {},
                            };
                        } catch (err) {
                            return {
                                env,
                                display: `Evaluation error ${
                                    (err as Error).message
                                }`,
                            };
                        }
                        // return { env, display: 'compiled.' };
                    } catch (err) {
                        console.error(err);
                        return {
                            env,
                            display: 'Failed ' + (err as Error).message,
                        };
                    }
                }
                if (stmt.type === 'sexpr') {
                    let raw;
                    try {
                        raw = benv['compile-st'](stmt);
                    } catch (err) {
                        console.error(err);
                        return {
                            env,
                            display:
                                'Compilation failed: ' + (err as Error).message,
                        };
                    }
                    try {
                        const res = new Function(
                            envArgs,
                            '{' + env.join('\n') + '\nreturn ' + raw + '}',
                        )(san);
                        return {
                            env,
                            display: valueToString(res),
                            values: { _: res },
                        };
                    } catch (err) {
                        console.log(envArgs);
                        console.log(raw);
                        console.error(err);
                        return {
                            env,
                            display:
                                'Error evaluating! ' +
                                (err as Error).message +
                                '\n' +
                                raw,
                        };
                    }
                }
            });
            return { env, display, values };
        },
        toFile(state, target) {
            if (target != null) {
                throw new Error(
                    `bootstrap evaluator not equipped for target toFile`,
                );
            }
            let env = this.init();
            const errors: Errors = {};
            const names: string[] = [];
            const rv = null;
            findTops(state).forEach((top) => {
                const node = fromMCST(top.top, state.map);
                if (node.type === 'blank') return;
                const parsed = this.parse(node, errors);
                if (!parsed) return;
                if (parsed.type === 'sdef') {
                    names.push(parsed[0]);
                }
                // if (target && top.top === target) {
                //     this.addStatement
                // }
                try {
                    env = this.addStatements({ [0]: parsed }, env, {}, {}).env;
                } catch (err) {
                    console.error(err);
                }
            });
            env.push(
                `return {type: 'fns', ${names
                    .map((name) => sanitize(name))
                    .sort()
                    .join(', ')}}`,
            );
            return { js: env.join('\n'), errors };
        },
        parse(node, errors) {
            const ctx = { errors, display: {} };
            const stmt = parseStmt(node, ctx) as stmt & { loc: number };
            if (Object.keys(ctx.errors).length || !stmt) {
                return;
            }
            stmt.loc = node.loc;
            return stmt;
        },
        parseExpr(node, errors) {
            const ctx = { errors, display: {} };
            return parseExpr(node, ctx);
        },
        evaluate(expr, env) {
            let raw;
            try {
                raw = benv['compile'](expr);
            } catch (err) {
                console.error(err);
                return 'Compilation failed: ' + (err as Error).message;
            }
            try {
                const res = new Function(
                    envArgs,
                    '{' + env.join('\n') + '\nreturn ' + raw + '}',
                )(san);
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
