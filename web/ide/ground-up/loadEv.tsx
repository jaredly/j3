import { Errors, FullEvalator, bootstrap } from './Evaluators';
import { findTops, urlForId, valueToString } from './reduce';
import { expr, parseExpr, parseStmt, stmt } from './round-1/parse';
import { sanitize } from './round-1/builtins';
import { fromMCST } from '../../../src/types/mcst';
import { toJCST } from './round-1/j-cst';

export const loadEv = async (
    id: string,
): Promise<null | FullEvalator<any, any, any>> => {
    const res = await fetch(urlForId(id) + '.js');
    if (res.status !== 200) {
        console.log('Nope', res.status);
        return null;
    }
    return evaluatorFromText(await res.text());
};

export const evaluatorFromText = (
    text: string,
): FullEvalator<string[], stmt & { loc: number }, expr> | null => {
    const benv = bootstrap.init();
    const san = sanitizedEnv(benv);
    const envArgs = '{' + Object.keys(san).join(', ') + '}';

    console.log(envArgs);
    const data = new Function(envArgs, '{' + text + '}')(san);
    if (data.type === 'full') {
        return data;
    }
    if (data.type === 'fns') {
        if (
            data['parse_stmt'] &&
            data['parse_expr'] &&
            data['compile'] &&
            data['compile_stmt']
        ) {
            return {
                init(): string[] {
                    return [];
                },
                parse(node, errors) {
                    const j = toJCST(node);
                    if (!j) return;
                    try {
                        return data['parse_stmt'](j);
                    } catch (err) {
                        // This is just looking annoying.
                        // errors[node.loc] = [
                        //     'ParseStmt failed: ' + (err as Error).message,
                        // ];
                    }
                },
                parseExpr(node, errors) {
                    const j = toJCST(node);
                    if (!j) return;
                    try {
                        return data['parse_expr'](j);
                    } catch (err) {
                        errors[node.loc] = [
                            'parse-expr failed: ' + (err as Error).message,
                        ];
                    }
                },
                addStatement(stmt, env) {
                    if (stmt.type === 'sexpr') {
                        let js;
                        try {
                            js = data['compile'](stmt[0]);
                        } catch (err) {
                            return {
                                env,
                                display: `Compilation Error: ${
                                    (err as Error).message
                                }`,
                            };
                        }
                        let fn;
                        try {
                            fn = new Function(
                                envArgs,
                                env.join('\n') + '\nreturn ' + js,
                            );
                        } catch (err) {
                            return {
                                env,
                                display: `JS Syntax Error: ${
                                    (err as Error).message
                                }\n${js}`,
                            };
                        }
                        try {
                            return {
                                env,
                                display: valueToString(fn(san)),
                            };
                        } catch (err) {
                            return {
                                env,
                                display: `Runtime error: ${
                                    (err as Error).message ?? err
                                }\n${js}`,
                            };
                        }
                    }
                    let js;
                    try {
                        js = data['compile_stmt'](stmt);
                    } catch (err) {
                        return {
                            env,
                            display: `Compilation Error: ${
                                (err as Error).message
                            }`,
                        };
                    }

                    try {
                        const fn = new Function(envArgs, js);
                        env.push(js);
                        return { env, display: `compiled` };
                    } catch (err) {
                        return {
                            env,
                            display: `JS Syntax Error: ${
                                (err as Error).message
                            }\n${js}`,
                        };
                    }
                },
                evaluate(expr, env) {
                    try {
                        const js = data['compile'](expr);
                        const fn = new Function(
                            envArgs,
                            env.join('\n') + '\nreturn ' + js,
                        );
                        try {
                            return {
                                env,
                                display: valueToString(fn(san)),
                            };
                        } catch (err) {
                            return {
                                env,
                                display: `Error ${(err as Error).message}`,
                            };
                        }
                    } catch (err) {
                        return {
                            env,
                            display: `Error ${(err as Error).message}`,
                        };
                    }
                },
            };
        } else {
            console.log('NOPE', Object.keys(data));
        }
    }
    if (data.type === 'bootstrap') {
        let benv = bootstrap.init();
        data.stmts.forEach((stmt: any) => {
            benv = bootstrap.addStatement(stmt, benv).env;
        });
        const san = sanitizedEnv(benv);
        const envArgs = '{' + Object.keys(san).join(', ') + '}';
        return {
            init(): string[] {
                return [];
            },
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
            toFile(state) {
                let env = this.init();
                const errors: Errors = {};
                const names: string[] = [];
                findTops(state).forEach((top) => {
                    const node = fromMCST(top.top, state.map);
                    if (node.type === 'blank') return;
                    const parsed = this.parse(node, errors);
                    if (!parsed) return;
                    if (parsed.type === 'sdef') {
                        names.push(parsed[0]);
                    }
                    try {
                        env = this.addStatement(parsed, env).env;
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
    }
    // we have `compile-st` and `compile`.
    // ELSE do ... a thing
    return null;
};
function sanitizedEnv(benv: { [key: string]: any }) {
    const san: { [key: string]: any } = {};
    Object.entries(benv).forEach(([k, v]) => (san[sanitize(k)] = v));
    return san;
}
