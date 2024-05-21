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
import { FullEvalator, Produce } from './FullEvalator';
import { valueToString } from './valueToString';
import { LocedName } from '../../custom/store/sortTops';
import { Node } from '../../../src/types/cst';

export const valueToNode = (v: any): Node => {
    if (typeof v === 'object' && v && 'type' in v) {
        if (v.type === 'cons' || v.type === 'nil') {
            const un = unwrapArray(v);
            return { type: 'array', values: un.map(valueToNode), loc: -1 };
        }
        let args = [];
        for (let i = 0; i in v; i++) {
            args.push(v[i]);
        }
        return {
            type: 'list',
            values: [
                { type: 'identifier', text: v.type, loc: -1 },
                ...args.map(valueToNode),
            ],
            loc: -1,
        };
    }
    if (typeof v === 'string') {
        return {
            type: 'string',
            first: { type: 'stringText', text: v, loc: -1 },
            templates: [],
            loc: -1,
        };
    }
    if (typeof v === 'number' || typeof v === 'boolean') {
        return { type: 'identifier', text: v + '', loc: -1 };
    }
    if (
        Array.isArray(v) &&
        v.every((item) => Array.isArray(item) && item.length === 2)
    ) {
        return {
            type: 'list',
            values: [
                { type: 'identifier', text: 'map/from-list', loc: -1 },
                {
                    type: 'array',
                    values: v.map((item) => ({
                        type: 'list',
                        values: [
                            { type: 'identifier', text: ',', loc: -1 },
                            valueToNode(item[0]),
                            valueToNode(item[1]),
                        ],
                        loc: -1,
                    })),
                    loc: -1,
                },
            ],
            loc: -1,
        };
    }
    if (Array.isArray(v)) {
        if (v.length === 0)
            return { type: 'identifier', text: 'set/nil', loc: -1 };
        return {
            type: 'list',
            values: [
                { type: 'identifier', text: 'set/from-list', loc: -1 },
                {
                    type: 'array',
                    values: v.map((item) => valueToNode(item)),
                    loc: -1,
                },
            ],
            loc: -1,
        };
    }
    if (v === null) {
        return { type: 'list', values: [], loc: -1 };
    }
    return {
        type: 'list',
        values: [
            { type: 'identifier', text: 'eval', loc: -1 },
            { type: 'raw-code', raw: JSON.stringify(v), lang: 'json', loc: -1 },
        ],
        loc: -1,
    };
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
    valueToString,
    valueToNode,
    compile(expr, meta) {
        throw new Error(`bootstrap eval cant compile`);
    },
    analysis: {
        // externalsStmt(stmt) {
        //     switch (stmt.type) {
        //         case 'sdef': {
        //             const res: LocedName[] = [];
        //             dependencies(stmt[1], [], res);
        //             return res;
        //         }
        //         case 'sexpr': {
        //             const res: LocedName[] = [];
        //             dependencies(stmt[0], [], res);
        //             return res;
        //         }
        //         case 'sdeftype': {
        //             //
        //         }
        //     }
        //     return [];
        // },
        stmtSize() {
            return null;
        },
        exprSize() {
            return null;
        },
        typeSize() {
            return null;
        },
        allNames(stmt) {
            throw new Error('i dont think Im using this bootstrap anymore');
        },
        allNamesExpr(stmt) {
            throw new Error('i dont think Im using this bootstrap anymore');
        },
        // externalsExpr(expr) {
        //     const res: LocedName[] = [];
        //     dependencies(expr, [], res);
        //     return res;
        // },
        // names(stmt) {
        //     switch (stmt.type) {
        //         case 'sdef':
        //             return [{ name: stmt[0], kind: 'value', loc: stmt.loc }];
        //         case 'sdeftype':
        //             return unwrapArray(stmt[1]).map((m) => ({
        //                 name: m[0],
        //                 kind: 'value',
        //                 loc: stmt.loc,
        //             }));
        //     }
        //     return [];
        // },
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
    evaluate(expr, _, env) {
        return evalExpr(expr, env.values);
    },
    setTracing(idx) {},
    addStatements(stmts, env) {
        const display: Record<number, Produce> = {};
        const values: Record<string, any> = {};
        Object.keys(stmts).forEach((id) => {
            const { stmt } = stmts[+id];
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
