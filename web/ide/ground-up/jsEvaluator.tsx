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

type stmt =
    | { type: 'raw'; raw: string; args: Node[] }
    | { type: 'cst'; cst: Node };

export const jsEvaluator: FullEvalator<
    { values: { [key: string]: any } },
    stmt,
    stmt | string
> = {
    id: 'js-evaluator',
    init() {
        return { values: {} };
    },
    analysis: {
        names(stmt) {
            if (stmt.type === 'cst') return [];
            const { name } = parseAssign(stmt.raw);
            return name ? [{ kind: 'value', name: name, loc: -1 }] : [];
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
        if (node.type === 'blank' || node.type === 'rich-text') {
            return { stmt: null, errors: [] };
        }
        if (node.type === 'raw-code') {
            return {
                stmt: { type: 'raw', raw: node.raw, args: [] },
                errors: [],
            };
        }
        if (node.type === 'identifier') {
            return {
                stmt: { type: 'raw', raw: node.text, args: [] },
                errors: [],
            };
        }
        if (
            node.type === 'list' &&
            node.values.length >= 1 &&
            (node.values[0].type === 'raw-code' ||
                node.values[0].type === 'identifier')
        ) {
            if (
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
            return {
                stmt: {
                    type: 'raw',
                    raw:
                        node.values[0].type === 'raw-code'
                            ? node.values[0].raw
                            : node.values[0].text,
                    args: node.values.slice(1),
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
    addStatements(stmts, env) {
        const display: Record<number, Produce> = {};
        const values: Record<string, any> = {};
        const entries = Object.entries(stmts)
            .map(([key, stmt]) => {
                if (stmt.type === 'cst') {
                    display[+key] = JSON.stringify(stmt.cst) ?? '';
                    return;
                }
                const { name, text } = parseAssign(stmt.raw);
                if (stmt.args.length || !name) {
                    try {
                        const res = evalWith(
                            'return ' + stmt.raw.trim(),
                            env.values,
                            stmt.args,
                        );
                        display[+key] = JSON.stringify(res) ?? '';
                    } catch (err) {
                        display[+key] = {
                            type: 'error',
                            message:
                                (err as Error).message + (err as Error).stack,
                        };
                    }
                    return;
                }

                return { key, name, text };
            })
            .filter(filterNulls);
        if (entries.length) {
            const source = `${entries
                .map((e) => `const ${e.name} = ${e.text.trim()}`)
                .join('\n')};\nreturn {${entries
                .map((e) => e.name)
                .join(',')}}`;
            try {
                const res = evalWith(source, env.values, []);
                entries.forEach((e) => {
                    const value = res[e.name];
                    values[e.name] = value;
                    env.values[e.name] = value;
                    display[+e.key] =
                        typeof value === 'function'
                            ? '<function>'
                            : JSON.stringify(value) ?? '';
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
        let names: string[] = [];
        const source = tops
            .map((top) => {
                const node = fromMCST(top.top, state.map);
                if (node.type !== 'raw-code') return;
                if (top.top === target) {
                    res = node.raw;
                    return;
                }
                const { name, text } = parseAssign(node.raw);
                if (!name) return;
                names.push(name);
                return `const ${name} = ${text.trim()}`;
            })
            .filter(filterNulls);
        return {
            js:
                source.join('\n\n') +
                `\n\nreturn ${res ?? `{${names.join(',')}}`}`,
        };
    },
};

const parseAssign = (text: string) => {
    const match = text.match(/^(\w+)\s*=[^>]/);
    if (match) {
        return { name: match[1], text: text.slice(match[0].length) };
    }
    return { name: null, text };
};
