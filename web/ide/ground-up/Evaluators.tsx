// Step 1: produce an `evaluator` for the bootstrap evaluator
// Step 2: use the bootstrap evaluator + state => a new evaluator

import { Node } from '../../../src/types/cst';
import { fromMCST } from '../../../src/types/mcst';
import { MetaDataMap, NUIState } from '../../custom/UIState';
import { builtins } from './builtins';
import { TraceMap } from './loadEv';
import { addTypeConstructors, extractBuiltins, valueToString } from './reduce';
import { findTops } from './findTops';
import { evalExpr } from './round-1/bootstrap';
import { expr, parseExpr, parseStmt, stmt, unwrapArray } from './round-1/parse';
import { LocedName } from '../../custom/store/sortTops';

// export type BasicEvaluator<T> = {};

export class MyEvalError extends Error {
    source: Error;
    constructor(name: string, source: Error) {
        super(name);
        this.source = source;
    }
}

export class LocError extends Error {
    locs: { loc: number; row: number; col: number }[] = [];
    js: string;
    constructor(source: Error, js: string) {
        super(source.message);
        this.js = js;
        const locs: { row: number; col: number }[] = [];
        source.stack!.replace(/<anonymous>:(\d+):(\d+)/g, (a, row, col) => {
            locs.push({ row: +row, col: +col });
            return '';
        });

        const lines = js.split('\n');

        locs.forEach(({ row, col }) => {
            if (row - 1 >= lines.length) {
                return console.error('Row out of bounds?', row, lines.length);
            }

            for (let i = row - 1; i >= 0; i--) {
                let line = lines[i];
                const found: { num?: number; col: number; end: boolean }[] = [];
                line.replaceAll(
                    /\/\*(<)?(\d+)\*\//g,
                    (_, end, num, col) => (
                        found.push({ num: +num, col, end: !!end }), ''
                    ),
                );
                line.replaceAll(/\/\*!\*\//g, (_, col) => {
                    found.push({ col, end: false });
                    return '';
                });
                found.sort((a, b) => a.col - b.col);
                const start = found.findLast((f) => f.col <= col && !f.end);
                const end = found.find((f) => f.col >= col && f.end);
                if (start) {
                    if (start.num == null) return; // skip
                    this.locs.push({ loc: start.num, col, row });
                    return;
                }
                if (end) {
                    if (end.num == null) return; // skip
                    // this.locs.push(end.num);
                    this.locs.push({ loc: end.num, col, row });
                    return;
                }
            }

            console.error(`Cant symbolicate`, { row, col });
        });
    }
}

export type Errors = { [key: number]: string[] };
export type ProduceItem = JSX.Element | string | LocError | MyEvalError;
export type Produce = ProduceItem | ProduceItem[];

export type FullEvalator<Env, Stmt, Expr, TypeEnv = any, Type = any> = {
    id: string;
    init(): Env;
    parse(node: Node, errors: Errors): Stmt | void;
    parseExpr(node: Node, errors: Errors): Expr | void;

    initType?(): TypeEnv;
    infer?(stmts: Stmt[], env: TypeEnv): TypeEnv;
    inferExpr?(expr: Expr, env: TypeEnv): Type;
    addTypes?(env: TypeEnv, nenv: TypeEnv): TypeEnv;
    typeForName?(env: TypeEnv, name: string): Type;
    typeToString?(type: Type): string;

    dependencies(stmt: Stmt): LocedName[];
    stmtNames(stmt: Stmt): LocedName[];
    addStatements(
        stmts: { [key: number]: Stmt },
        env: Env,
        meta: MetaDataMap,
        trace: TraceMap,
    ): {
        env: Env;
        display: { [key: number]: Produce };
        values: { [name: string]: any };
    };
    setTracing(idx: number | null, traceMap: TraceMap, env: Env): void;
    evaluate(expr: Expr, env: Env, meta: MetaDataMap): any;
    toFile?(state: NUIState, target?: number): { js: string; errors: Errors };
};

export const repr: FullEvalator<void, Node, Node> = {
    id: 'repr',
    init() {},
    dependencies(stmt) {
        return [];
    },
    stmtNames: () => [],
    parse(node: Node, errors: Errors) {
        return node;
    },
    parseExpr(node: Node, errors: Errors) {
        return node;
    },
    setTracing(idx) {},
    addStatements(stmts, env) {
        const display: Record<number, Produce> = {};
        Object.keys(stmts).forEach((id) => {
            display[+id] = JSON.stringify(stmts[+id]);
        });
        return { env, display, values: {} };
    },
    evaluate(expr, env) {
        return null;
    },
};

export const bootstrap: FullEvalator<
    { [key: string]: any },
    stmt & { loc: number },
    expr
> = {
    id: 'bootstrap',
    init: () => {
        return builtins();
    },
    stmtNames: () => [],
    dependencies: () => [],
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
        return evalExpr(expr, env);
    },
    setTracing(idx) {},
    addStatements(stmts, env) {
        const display: Record<number, Produce> = {};
        const values: Record<string, any> = {};
        Object.keys(stmts).forEach((id) => {
            const stmt = stmts[+id];
            switch (stmt.type) {
                case 'sdef': {
                    try {
                        const res = (env[stmt[0]] = evalExpr(stmt[1], env));
                        if (stmt[0] === 'builtins') {
                            Object.assign(env, extractBuiltins(res));
                        }
                        values[stmt[0]] = res;
                        display[+id] =
                            typeof res === 'function'
                                ? '<function>'
                                : JSON.stringify(res);
                        return;
                    } catch (err) {
                        console.error(err);
                        // console.log(text)
                        display[+id] = `Error! ${(err as Error).message}`;
                        return;
                    }
                }
                case 'sdeftype': {
                    addTypeConstructors(stmt, env);
                    display[+id] = `type with ${
                        unwrapArray(stmt[1]).length
                    } constructors`;
                    return;
                }
                case 'sexpr': {
                    try {
                        const res = evalExpr(stmt[0], env);
                        display[+id] = valueToString(res);
                    } catch (err) {
                        console.error(err);
                        display[+id] = `Error! ${(err as Error).message}`;
                    }
                    return;
                }
            }
        });
        return { env, display, values };
    },

    // We ignore the `target` here ... because we're just dumping everything
    toFile(state: NUIState, target: number) {
        const errors: Errors = {};
        return {
            js: `return {type: 'bootstrap', stmts: ${JSON.stringify(
                findTops(state)
                    .map((stmt) =>
                        bootstrap.parse(fromMCST(stmt.top, state.map), errors),
                    )
                    .filter(Boolean),
                null,
                2,
            )}}`,
            errors,
        };
    },
};
