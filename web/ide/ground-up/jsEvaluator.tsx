import { Node } from '../../../src/types/cst';
import { NUIState } from '../../custom/UIState';
import { FullEvalator, Produce } from './FullEvalator';

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
    stmt
> = {
    id: 'js-evaluator',
    init() {
        return { values: {} };
    },
    analysis: {
        names(stmt) {
            if (stmt.type === 'cst') return [];
            const match = [...stmt.raw.matchAll(/^(\w+)\s*=/g)][0];
            return match ? [{ kind: 'value', name: match[1], loc: -1 }] : [];
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
            if (expr.type === 'cst') return [];
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
        if (node.type === 'blank') {
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
        if (node.type === 'raw-code') {
            return {
                expr: { type: 'raw', raw: node.raw, args: [] },
                errors: [],
            };
        }
        if (node.type === 'identifier') {
            return {
                expr: { type: 'raw', raw: node.text, args: [] },
                errors: [],
            };
        }
        return { expr: null, errors: [] };
    },
    evaluate(expr, env, meta) {
        if (expr.type === 'cst') {
            return expr.cst;
        }
        return evalWith(expr.raw, env.values, expr.args);
    },
    setTracing() {},
    addStatements(stmts, env, meta, trace, top, renderResult, debugShowJs) {
        const display: Record<number, Produce> = {};
        const values: Record<string, any> = {};
        Object.entries(stmts).forEach(([key, stmt]) => {
            if (stmt.type === 'cst') {
                display[+key] = JSON.stringify(stmt.cst);
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
                        message: (err as Error).message,
                    };
                }
                return;
            }

            try {
                const res = (env.values[name] = evalWith(
                    `const ${name} = ${text.trim()};\nreturn ${name}`,
                    env.values,
                    [],
                ));
                values[name] = res;
                display[+key] =
                    typeof res === 'function'
                        ? '<function>'
                        : JSON.stringify(res) ?? '';
            } catch (err) {
                display[+key] = {
                    type: 'error',
                    message: (err as Error).message,
                };
            }
        });
        return { env, display, values };
    },

    toFile(state: NUIState, target: number) {
        return { js: 'not yet' };
    },
};

const parseAssign = (text: string) => {
    const match = [...text.matchAll(/^(\w+)\s*=/g)][0];
    if (match) {
        const name = match[1];
        return { name: match[1], text: text.slice(match[0].length) };
    }
    return { name: null, text };
};
