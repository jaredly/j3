import { NUIState } from '../../custom/UIState';
import { FullEvalator, Produce } from './FullEvalator';

const evalWith = (text: string, values: Record<string, any>) => {
    return new Function(`{${Object.keys(values).join(',')}}`, text)(values);
};

export const jsEvaluator: FullEvalator<
    { values: { [key: string]: any } },
    string,
    string
> = {
    id: 'js-evaluator',
    init() {
        return { values: {} };
    },
    analysis: {
        names(stmt) {
            const match = [...stmt.matchAll(/^(\w+)\s*=/g)][0];
            return match ? [{ kind: 'value', name: match[1], loc: -1 }] : [];
        },
        externalsStmt(stmt) {
            const match = [...stmt.matchAll(/^(\w+)\s*=/g)][0];
            const text = match ? stmt.slice(match[0].length) : stmt;
            return [...text.matchAll(/\w+/g)].map((m) => ({
                kind: 'value',
                name: m[0],
                loc: -1,
            }));
        },
        externalsExpr(expr) {
            return [...expr.matchAll(/\w+/g)].map((m) => ({
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
        if (node.type === 'raw-code') {
            return { stmt: node.raw, errors: [] };
        }
        return { stmt: null, errors: [] };
    },
    parseExpr(node) {
        if (node.type === 'raw-code') {
            return { expr: node.raw, errors: [] };
        }
        return { expr: null, errors: [] };
    },
    evaluate(expr, env, meta) {
        return evalWith(expr, env.values);
    },
    setTracing() {},
    addStatements(stmts, env, meta, trace, top, renderResult, debugShowJs) {
        const display: Record<number, Produce> = {};
        const values: Record<string, any> = {};
        Object.entries(stmts).forEach(([key, stmt]) => {
            const match = [...stmt.matchAll(/^(\w+)\s*=/g)][0];
            if (match) {
                const name = match[1];
                const text = stmt.slice(match[0].length);
                try {
                    const res = (env.values[name] = evalWith(
                        'return ' + text.trim(),
                        env.values,
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
                // definition
            } else {
                // expr
                try {
                    const res = evalWith('return ' + stmt.trim(), env.values);
                    display[+key] = JSON.stringify(res) ?? '';
                } catch (err) {
                    display[+key] = {
                        type: 'error',
                        message: (err as Error).message,
                    };
                }
            }
        });
        return { env, display, values };
    },

    toFile(state: NUIState, target: number) {
        return { js: 'not yet' };
    },
};
