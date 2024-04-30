// Step 1: produce an `evaluator` for the bootstrap evaluator
// Step 2: use the bootstrap evaluator + state => a new evaluator

import { Node } from '../../../src/types/cst';
import { fromMCST } from '../../../src/types/mcst';
import { NUIState } from '../../custom/UIState';
import { builtins, traceEnv } from './builtins';
import { extractBuiltins } from './extractBuiltins';
import { addTypeConstructors } from './addTypeConstructors';
import { findTops } from './findTops';
import { evalExpr } from './round-1/bootstrap';
import {
    Ctx,
    expr,
    parseExpr,
    parseStmt,
    pat,
    stmt,
    unwrapArray,
} from './round-1/parse';
import { FullEvalator, Produce, Errors } from './FullEvalator';
import { valueToString } from './valueToString';
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
                return; // console.error('Row out of bounds?', row, lines.length);
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

            // console.error(`Cant symbolicate`, { row, col });
        });
    }
}

export const repr: FullEvalator<{ values: {} }, Node, Node> = {
    id: 'repr',
    init: () => ({ values: {} }),
    parse(node: Node) {
        return { stmt: node, errors: [] };
    },
    parseExpr(node: Node) {
        return { expr: node, errors: [] };
    },
    setTracing(idx) {},
    addStatements(stmts, env) {
        const display: Record<number, Produce> = {};
        Object.keys(stmts).forEach((id) => {
            display[+id] = JSON.stringify(stmts[+id]);
        });
        return { env, display, values: {} };
    },
    evaluate() {
        return null;
    },
    toFile() {
        return { js: 'lol its a repr', errors: {} };
    },
};

const patNames = (pat: pat): string[] => {
    switch (pat.type) {
        case 'pcon':
            return unwrapArray(pat[1]).flatMap(patNames);
        case 'pprim':
        case 'pstr':
        case 'pany':
            return [];
        case 'pvar':
            return [pat[0]];
    }
};

const dependencies = (expr: expr, names: string[], collect: LocedName[]) => {
    switch (expr.type) {
        case 'eapp':
            dependencies(expr[0], names, collect);
            dependencies(expr[1], names, collect);
            return;
        case 'elambda':
            dependencies(expr[1], names.concat([expr[0]]), collect);
            return;
        case 'elet':
            dependencies(expr[1], names, collect);
            dependencies(expr[2], names.concat([expr[0]]), collect);
            return;
        case 'ematch':
            dependencies(expr[0], names, collect);
            unwrapArray(expr[1]).forEach((item) => {
                dependencies(item[1], names.concat(patNames(item[0])), collect);
            });
            return;
        case 'eprim':
        case 'equot':
            return;
        case 'estr':
            unwrapArray(expr[1]).forEach((tpl) => {
                dependencies(tpl[0], names, collect);
            });
            return;
        case 'evar':
            if (!names.includes(expr[0])) {
                collect.push({ name: expr[0], kind: 'value', loc: expr[1] });
            }
            return;
    }
};

export const bootstrap: FullEvalator<
    { values: { [key: string]: any } },
    stmt & { loc: number },
    expr
> = {
    id: 'bootstrap',
    init: () => {
        return { values: { ...builtins(), ...traceEnv() } };
    },
    analysis: {
        externalsStmt(stmt) {
            switch (stmt.type) {
                case 'sdef': {
                    const res: LocedName[] = [];
                    dependencies(stmt[1], [], res);
                    return res;
                }
                case 'sexpr': {
                    const res: LocedName[] = [];
                    dependencies(stmt[0], [], res);
                    return res;
                }
                case 'sdeftype': {
                    //
                }
            }
            return [];
        },
        stmtSize() {
            return null;
        },
        exprSize() {
            return null;
        },
        typeSize() {
            return null;
        },
        externalsExpr(expr) {
            const res: LocedName[] = [];
            dependencies(expr, [], res);
            return res;
        },
        names(stmt) {
            switch (stmt.type) {
                case 'sdef':
                    return [{ name: stmt[0], kind: 'value', loc: stmt.loc }];
                case 'sdeftype':
                    return unwrapArray(stmt[1]).map((m) => ({
                        name: m[0],
                        kind: 'value',
                        loc: stmt.loc,
                    }));
            }
            return [];
        },
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
    evaluate(expr, env) {
        return evalExpr(expr, env.values);
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
                        const res = (env.values[stmt[0]] = evalExpr(
                            stmt[1],
                            env.values,
                        ));
                        if (stmt[0] === 'builtins') {
                            Object.assign(env.values, extractBuiltins(res));
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
                        display[+id] = {
                            type: 'error',
                            message: (err as Error).message,
                        };
                        return;
                    }
                }
                case 'sdeftype': {
                    addTypeConstructors(stmt, values);
                    Object.assign(env.values, values);
                    display[+id] = `type with ${
                        unwrapArray(stmt[1]).length
                    } constructors`;
                    return;
                }
                case 'sexpr': {
                    try {
                        const res = evalExpr(stmt[0], env.values);
                        display[+id] = valueToString(res);
                    } catch (err) {
                        console.error(err);
                        display[+id] = {
                            type: 'error',
                            message: (err as Error).message,
                        };
                    }
                    return;
                }
            }
        });
        return { env, display, values };
    },

    // We ignore the `target` here ... because we're just dumping everything
    toFile(state: NUIState, target: number) {
        return {
            js: `return {type: 'bootstrap', stmts: ${JSON.stringify(
                findTops(state)
                    .map(
                        (stmt) =>
                            bootstrap.parse(fromMCST(stmt.top, state.map)).stmt,
                    )
                    .filter(Boolean),
                null,
                2,
            )}}`,
        };
    },
};
