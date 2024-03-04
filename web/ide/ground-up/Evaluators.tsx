// Step 1: produce an `evaluator` for the bootstrap evaluator
// Step 2: use the bootstrap evaluator + state => a new evaluator

import { Node } from '../../../src/types/cst';
import { addTypeConstructors, extractBuiltins, valueToString } from './reduce';
import { evalExpr } from './round-1/bootstrap';
import { expr, parseStmt, stmt, unwrapArray } from './round-1/parse';

export type BasicEvaluator<T> = {};

export type Errors = { [key: number]: string[] };
export type FullEvalator<Env, Stmt, Expr> = {
    init(): Env;
    parse(node: Node, errors: Errors): Stmt | void;
    addStatement(
        stmt: Stmt,
        env: Env,
    ): { env: Env; display: JSX.Element | string };
    // evaluateExpression(expr: Expr, env: Env): any;
    // showValue(value: any): JSX.Element;
};

export const bootstrap: FullEvalator<
    { [key: string]: any },
    stmt & { loc: number },
    expr
> = {
    init: () => ({
        '+': (a: number) => (b: number) => a + b,
        //             'replace-all': (a: string) => (b: string) => (c: string) =>
        //                 a.replaceAll(b, c),
    }),
    parse(node, errors) {
        const ctx = { errors, display: {} };
        const stmt = parseStmt(node, ctx) as stmt & { loc: number };
        if (Object.keys(ctx.errors).length || !stmt) {
            return;
        }
        stmt.loc = node.loc;
        return stmt;
    },
    addStatement(stmt, env) {
        switch (stmt.type) {
            case 'sdef': {
                try {
                    const res = (env[stmt[0]] = evalExpr(stmt[1], env));
                    if (stmt[0] === 'builtins') {
                        Object.assign(env, extractBuiltins(res));
                    }
                    return {
                        env,
                        display:
                            typeof res === 'function'
                                ? '<function>'
                                : JSON.stringify(res),
                    };
                } catch (err) {
                    return { env, display: `Error! ${(err as Error).message}` };
                }
            }
            case 'sdeftype': {
                addTypeConstructors(stmt, env);
                return {
                    env,
                    display: `type with ${
                        unwrapArray(stmt[1]).length
                    } constructors`,
                };
            }
            case 'sexpr': {
                try {
                    const res = evalExpr(stmt[0], env);
                    return { env, display: valueToString(res) };
                } catch (err) {
                    return { env, display: `Error! ${(err as Error).message}` };
                }
            }
        }
    },
};
