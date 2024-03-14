// Step 1: produce an `evaluator` for the bootstrap evaluator
// Step 2: use the bootstrap evaluator + state => a new evaluator

import { Node } from '../../../src/types/cst';
import { fromMCST } from '../../../src/types/mcst';
import { MetaDataMap, NUIState } from '../../custom/UIState';
import {
    addTypeConstructors,
    extractBuiltins,
    findTops,
    valueToString,
} from './reduce';
import { evalExpr } from './round-1/bootstrap';
import { sanitize } from './round-1/builtins';
import {
    arr,
    expr,
    parseExpr,
    parseStmt,
    stmt,
    unwrapArray,
    wrapArray,
} from './round-1/parse';

// export type BasicEvaluator<T> = {};

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
export type FullEvalator<Env, Stmt, Expr> = {
    init(): Env;
    parse(node: Node, errors: Errors): Stmt | void;
    parseExpr(node: Node, errors: Errors): Expr | void;
    addStatement(
        stmt: Stmt,
        env: Env,
        meta: MetaDataMap,
        trace: { [loc: number]: { [loc: number]: any[] } },
    ): { env: Env; display: JSX.Element | string | LocError };
    evaluate(
        expr: Expr,
        env: Env,
        meta: MetaDataMap,
        traceMap: { [loc: number]: { [loc: number]: any[] } },
    ): any;
    toFile?(state: NUIState): { js: string; errors: Errors };
};

export const repr: FullEvalator<void, Node, Node> = {
    init() {},
    parse(node: Node, errors: Errors) {
        return node;
    },
    parseExpr(node: Node, errors: Errors) {
        return node;
    },
    addStatement(stmt, env) {
        return { env, display: JSON.stringify(stmt) };
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
    init: () => {
        return builtins();
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
        return evalExpr(expr, env);
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
    toFile(state: NUIState) {
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

function builtins() {
    let env = {
        // Math
        '+': (a: number) => (b: number) => a + b,
        '-': (a: number) => (b: number) => a - b,
        '<': (a: number) => (b: number) => a < b,
        '<=': (a: number) => (b: number) => a <= b,
        '>': (a: number) => (b: number) => a > b,
        '>=': (a: number) => (b: number) => a >= b,
        '=': (a: number) => (b: number) => a === b,

        'int-to-string': (a: number) => a + '',
        string_to_int: (a: string) => {
            var v = parseInt(a);
            if (!isNaN(v) && '' + v === a) return { type: 'some', 0: v };
            return { type: 'none' };
        },
        // Array, tuple
        nil: { type: 'nil' },
        cons: (a: any) => (b: any) => ({ type: 'cons', 0: a, 1: b }),
        ',':
            <a, b>(a: a) =>
            (b: b) => ({ type: ',', 0: a, 1: b }),
        ',,':
            <a, b, c>(a: a) =>
            (b: b) =>
            (c: c) => ({ type: ',,', 0: a, 1: b, 2: c }),
        ',,,':
            <a, b, c, d>(a: a) =>
            (b: b) =>
            (c: c) =>
            (d: d) => ({ type: ',,,', 0: a, 1: b, 2: c, 3: d }),
        '++': (items: arr<string>) => unwrapArray(items).join(''),
        'map/nil': [],
        'map/set': (m: [any, any][]) => (k: any) => (v: any) => [[k, v], ...m],
        'map/rm': (m: [any, any][]) => (k: any) => m.filter((i) => i[0] !== k),
        'map/get': (m: [any, any][]) => (k: any) => {
            const found = m.find((i) => i[0] === k);
            if (found != null) {
                return { type: 'some', 0: found[1] };
            }
            return { type: 'none' };
        },
        'map/map': (fn: (k: any) => any) => (map: [any, any][]) =>
            map.map(([k, v]) => [k, fn(v)]),
        'map/merge': (a: [any, any][]) => (b: [any, any][]) => [...a, ...b],
        'map/values': (m: [any, any][]) => wrapArray(m.map((i) => i[1])),

        'set/nil': [],
        'set/add': (s: any[]) => (v: any) => [v, ...s],
        'set/has': (s: any[]) => (v: any) => s.includes(v),
        'set/rm': (s: any[]) => (v: any) => s.filter((i) => i !== v),
        // NOTE this is only working for primitives
        'set/diff': (a: any[]) => (b: any[]) => a.filter((i) => !b.includes(i)),
        'set/merge': (a: any[]) => (b: any[]) => [...a, ...b],
        'set/to-list': wrapArray,
        'set/from-list': unwrapArray,
        'map/from-list': (a: arr<{ type: ','; 0: any; 1: any }>) =>
            unwrapArray(a).map((i) => [i[0], i[1]]),
        'map/to-list': (a: [any, any][]) =>
            wrapArray(a.map(([k, v]) => ({ type: ',', 0: k, 1: v }))),
        // unwrapArray(a).map((i) => [i[0], i[1]]),

        jsonify: (m: any) => JSON.stringify(m),
        // Meta stuff
        valueToString,
        eval: (v: string) => {
            const obj: { [key: string]: any } = {};
            Object.entries(env).forEach(([k, v]) => (obj[sanitize(k)] = v));
            const k = `{${Object.keys(obj).join(',')}}`;
            return new Function(k, 'return ' + v)(obj);
        },
        sanitize,
        $trace(loc: number, info: any, value: any) {
            return value;
        },
        // Just handy
        'replace-all': (a: string) => (b: string) => (c: string) =>
            a.replaceAll(b, c),
        reduce:
            <T, A>(init: T) =>
            (items: arr<A>) =>
            (f: (res: T) => (item: A) => T) =>
                unwrapArray(items).reduce((a, b) => f(a)(b), init),
        // Debug
        fatal: (v: string) => {
            throw new Error(`Fatal runtime: ${v}`);
        },
    };
    return env;
}
