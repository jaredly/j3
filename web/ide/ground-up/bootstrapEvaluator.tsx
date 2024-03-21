import { Errors, FullEvalator, bootstrap } from './Evaluators';
import { valueToString } from './reduce';
import { findTops } from './findTops';
import { parseExpr, parseStmt, stmt } from './round-1/parse';
import { sanitize } from './round-1/builtins';
import { fromMCST } from '../../../src/types/mcst';
import { sanitizedEnv } from './loadEv';

/**
 * This turns a sandbox that ':bootstrap:' as its evaluator
 * into an evaluator in its own right.
 */

export const bootstrapEvaluator = (
    id: string,
    data: any,
): FullEvalator<any, any, any> => {
    let benv = bootstrap.init();
    data.stmts.forEach((stmt: any) => {
        benv = bootstrap.addStatement(stmt, benv, {}, {}).env;
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
        addStatement(stmt: stmt, env) {
            if (stmt.type === 'sdef' || stmt.type === 'sdeftype') {
                try {
                    env.push(benv['compile-st'](stmt));
                    return { env, display: 'compiled.' };
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
                    return { env, display: valueToString(res) };
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
            return { env, display: 'idk' };
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
                    env = this.addStatement(parsed, env, {}, {}).env;
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
