import { Node } from '../../../src/types/cst';
import { fromMCST } from '../../../src/types/mcst';
import { NUIState } from '../../custom/UIState';
import { filterNulls } from '../../custom/old-stuff/filterNulls';
import { FullEvalator, Produce } from './FullEvalator';
import { findTops } from './findTops';
import { slash } from './round-1/bootstrap';

const evalWith = (text: string, values: Record<string, any>, args: Node[]) => {
    const res = new Function(`{${Object.keys(values).join(',')}}`, text)(
        values,
    );
    if (args.length) return res(...args);
    return res;
};

type stmt = { type: 'raw'; raw: string; loc: number; names: string[] } | expr;
type expr =
    | { type: 'raw-call'; raw: string; args: Node[] }
    | { type: 'cst'; cst: Node };

const serString = (v: any) =>
    typeof v === 'string' && v.includes('"')
        ? `'${v.replace(/'/g, "\\'")}'`
        : v === null
        ? 'null'
        : v === undefined
        ? 'undefined'
        : JSON.stringify(v);

export const jsEvaluator: FullEvalator<
    { values: { [key: string]: any } },
    stmt,
    expr | string
> = {
    id: 'js-evaluator',
    init() {
        return { values: {} };
    },
    valueToString(v) {
        if (typeof v === 'function') {
            return '<function>';
        }
        return serString(v);
    },
    valueToNode(v) {
        return {
            type: 'raw-code',
            lang: 'javascript',
            loc: -1,
            raw: serString(v),
        };
    },
    analysis: {
        names(stmt) {
            if (stmt.type === 'cst' || stmt.type == 'raw-call') return [];
            return getNames(stmt.raw).map((name) => ({
                name,
                kind: 'value',
                loc: stmt.loc,
            }));
        },
        externalsStmt(stmt) {
            if (stmt.type === 'cst') return [];
            const match = [...stmt.raw.matchAll(/^(\w+)\s*=/g)][0];
            const text = match ? stmt.raw.slice(match[0].length) : stmt.raw;
            return [...text.matchAll(/\w+/g)].map((m) => ({
                kind: 'value',
                name: m[0],
                loc: -1,
            }));
        },
        externalsExpr(expr) {
            if (typeof expr === 'string' || expr.type === 'cst') return [];
            return [...expr.raw.matchAll(/\w+/g)].map((m) => ({
                kind: 'value',
                name: m[0],
                loc: -1,
            }));
        },
        stmtSize(stmt) {
            if (stmt.type === 'raw' || stmt.type === 'raw-call') {
                return stmt.raw.split('\n').filter((n) => !n.match(/^\s*\/\//))
                    .length;
            }
            return 1;
        },
        exprSize(expr) {
            return 1;
        },
        typeSize(type) {
            return 1;
        },
    },
    // analysis
    parse(node) {
        if (
            node.type === 'blank' ||
            node.type === 'rich-text' ||
            node.type === 'comment' ||
            node.type === 'comment-node'
        ) {
            return { stmt: null, errors: [] };
        }
        if (node.type === 'raw-code') {
            const names = getNames(node.raw);
            return names.length
                ? {
                      stmt: {
                          type: 'raw',
                          raw: node.raw,
                          names,
                          loc: node.loc,
                      },
                      errors: [],
                  }
                : {
                      errors: [],
                      stmt: { type: 'raw-call', raw: node.raw, args: [] },
                  };
        }
        if (
            node.type === 'identifier' &&
            (!isNaN(+node.text) ||
                node.text === 'true' ||
                node.text === 'false')
        ) {
            return {
                stmt: {
                    type: 'raw-call',
                    raw: node.text,
                    args: [],
                    loc: node.loc,
                },
                errors: [],
            };
        }

        if (
            node.type === 'list' &&
            node.values.length >= 1 &&
            node.values[0].type === 'identifier' &&
            node.values[0].text === '@'
        ) {
            return {
                stmt:
                    node.values.length > 1
                        ? { type: 'cst', cst: node.values[1] }
                        : null,
                errors: [],
            };
        }

        if (
            node.type === 'list' &&
            node.values.length >= 1 &&
            node.values[0].type === 'raw-code'
        ) {
            const names = getNames(node.values[0].raw);
            if (names.length) {
                return {
                    stmt: null,
                    errors: [
                        [
                            node.values[0].loc,
                            `Can't declare toplevel const in an expression`,
                        ],
                    ],
                };
            }
            return {
                stmt: {
                    type: 'raw-call',
                    raw: node.values[0].raw,
                    args: node.values.slice(1),
                    loc: node.loc,
                },
                errors: [],
            };
        }
        return { stmt: { type: 'cst', cst: node }, errors: [] };
    },
    parseExpr(node) {
        if (node.type === 'string' && node.templates.length === 0) {
            return { expr: slash(node.first.text), errors: [] };
        }
        const { stmt, errors } = this.parse(node);
        if (stmt?.type === 'raw') {
            return {
                expr: null,
                errors: [
                    [node.loc, `Can't declare toplevel const in an expression`],
                ],
            };
        }
        return { expr: stmt, errors };
    },
    evaluate(expr, env, meta) {
        if (typeof expr === 'string') {
            return expr;
        }
        if (expr.type === 'cst') {
            return expr.cst;
        }
        return evalWith('return ' + expr.raw, env.values, expr.args);
    },
    setTracing() {},
    addStatements(stmts, env, _, __, ___, displayResult) {
        const display: Record<number, Produce> = {};
        const values: Record<string, any> = {};
        const entries = Object.entries(stmts)
            .map(([key, stmt]) => {
                if (stmt.type === 'cst') {
                    display[+key] = displayResult
                        ? displayResult(stmt.cst)
                        : JSON.stringify(stmt.cst) ?? '';
                    return;
                }
                // const { name, text } = parseAssign(stmt.raw);
                if (stmt.type === 'raw-call') {
                    try {
                        const res = evalWith(
                            'return ' + stmt.raw.trim(),
                            env.values,
                            stmt.args,
                        );
                        display[+key] = displayResult
                            ? displayResult(res)
                            : JSON.stringify(res) ?? 'undefined';
                    } catch (err) {
                        display[+key] = {
                            type: 'error',
                            message:
                                (err as Error).message + (err as Error).stack,
                        };
                    }
                    return;
                }

                return { key, stmt };
            })
            .filter(
                (
                    x,
                ): x is { key: string; stmt: Extract<stmt, { type: 'raw' }> } =>
                    x != null,
            );
        if (entries.length) {
            const source = `${entries
                .map((e) => e.stmt.raw)
                .join('\n')};\nreturn {${entries
                .flatMap((e) => e.stmt.names)
                .join(',')}}`;
            try {
                const res = evalWith(source, env.values, []);
                entries.forEach((e) => {
                    display[+e.key] = e.stmt.names.flatMap((name) => {
                        const value = res[name];
                        values[name] = value;
                        env.values[name] = value;
                        return displayResult
                            ? displayResult(res)
                            : typeof value === 'function'
                            ? [`${name} = <function>`]
                            : [name + ' = ' + (JSON.stringify(value) ?? '')];
                    });
                });
            } catch (err) {
                entries.forEach((e) => {
                    display[+e.key] = {
                        type: 'error',
                        message: (err as Error).message,
                    };
                });
            }
        }
        return { env, display, values };
    },

    toFile(state: NUIState, target?: number) {
        const tops = findTops(state);
        let res;
        let allNames: string[] = [];
        const source = tops
            .map((top) => {
                const node = fromMCST(top.top, state.map);
                if (node.type !== 'raw-code') return;
                if (top.top === target) {
                    res = node.raw;
                    return;
                }
                const names = getNames(node.raw);
                if (!names.length) return;
                allNames.push(...names);
                return node.raw;
            })
            .filter(filterNulls);
        return {
            js:
                source.join('\n\n') +
                `\n\nreturn ${res ?? `{${allNames.join(',')}}`}`,
        };
    },
};

// const parseAssign = (text: string) => {
//     const match = text.match(/^(\/\/[^\n]+\n)*\s*(\w+)\s*=[^>]/);
//     if (match) {
//         return { name: match[2], text: text.slice(match[0].length) };
//     }
//     return { name: null, text };
// };

const getNames = (text: string) => {
    const names: string[] = [];
    text.replace(
        /^const\s+(\w+)\s*=[^>=]/gm,
        (_, name) => (names.push(name), ''),
    );
    return names;
};
