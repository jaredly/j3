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
): FullEvalator<
    { values: { [key: string]: any }; source: string[] },
    stmt & { loc: number },
    expr
> => {
    let benv = bootstrap.init();
    data.stmts.forEach((stmt: stmt & { loc: number }) => {
        const res = bootstrap.addStatements({ [0]: stmt }, benv, {}, {}, {});
        benv = res.env;
    });
    const san = sanitizedEnv(benv.values);
    const envArgs = '{' + Object.keys(san).join(', ') + '}';
    return {
        id,
        init() {
            return { values: bootstrap.init(), source: [] };
        },
        setTracing(idx, traceMap) {},
        addStatements(stmts: Record<number, stmt>, env) {
            const display: Record<number, Produce> = {};
            const values: Record<string, any> = {};
            let js: string[] = [];

            Object.keys(stmts).forEach((loc) => {
                const stmt = stmts[+loc];

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
                                '{' +
                                    env.source.join('\n') +
                                    (stmt.type === 'sdef'
                                        ? `\nreturn ${sanitize(stmt[0])}`
                                        : '') +
                                    '}',
                            )(san);
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
                        display[+loc] = err as Error;
                    }
                }
                if (stmt.type === 'sexpr') {
                    let raw;
                    try {
                        raw = benv.values['compile-st'](stmt);
                    } catch (err) {
                        console.error(err);
                        display[+loc] = new Error(
                            'Compilation failed: ' + (err as Error).message,
                        );
                        return;
                    }
                    js.push(raw);
                    try {
                        const res = new Function(
                            envArgs,
                            '{' +
                                env.source.join('\n') +
                                '\nreturn ' +
                                raw +
                                '}',
                        )(san);
                        display[+loc] = valueToString(res);
                        values._ = res;
                    } catch (err) {
                        console.log(envArgs);
                        console.log(raw);
                        console.error(err);
                        display[+loc] = new Error(
                            'Error evaluating! ' +
                                (err as Error).message +
                                '\n' +
                                raw,
                        );
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
                const nodeErrors: Errors = {};
                const parsed = this.parse(node, nodeErrors);
                Object.assign(errors, nodeErrors);
                if (!parsed) return;
                if (parsed.type === 'sdef') {
                    names.push(parsed[0]);
                }
                let res;
                try {
                    res = this.addStatements({ [0]: parsed }, env, {}, {}, {});
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
        parse(node, errors) {
            if (
                node.type === 'blank' ||
                node.type === 'comment' ||
                node.type === 'comment-node' ||
                node.type === 'rich-text'
            ) {
                return;
            }
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
                raw = benv.values['compile'](expr);
            } catch (err) {
                console.error(err);
                return 'Compilation failed: ' + (err as Error).message;
            }
            try {
                const res = new Function(
                    envArgs,
                    '{' + env.source.join('\n') + '\nreturn ' + raw + '}',
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
