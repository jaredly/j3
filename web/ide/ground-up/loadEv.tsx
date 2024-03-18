import { Errors, FullEvalator, LocError, bootstrap } from './Evaluators';
import { findTops, urlForId, valueToString } from './reduce';
import { expr, parseExpr, parseStmt, stmt } from './round-1/parse';
import { sanitize } from './round-1/builtins';
import { fromMCST } from '../../../src/types/mcst';
import { toJCST } from './round-1/j-cst';
import { NUIState } from '../../custom/UIState';

export const loadEv = async (
    ids: string[],
): Promise<null | FullEvalator<any, any, any>> => {
    const res = await Promise.all(
        ids.map((id) => fetch(urlForId(id) + '.js').then((res) => res.text())),
    );

    return evaluatorFromText(res);
};

export const evaluatorFromText = (
    text: string[],
): FullEvalator<string[], stmt & { loc: number }, expr> | null => {
    const benv = bootstrap.init();
    const san = sanitizedEnv(benv);
    const envArgs = '{' + Object.keys(san).join(', ') + '}';

    let data: any = {};
    text.forEach((text) => {
        const result = new Function(envArgs, '{' + text + '}')(san);
        Object.assign(data, result);
    });
    if (data.type === 'full') {
        return data;
    }
    if (data.type === 'fns') {
        return fnsEvaluator(data, envArgs, san);
    }

    if (data.type === 'bootstrap') {
        return bootstrapEvaluator(data);
    }

    return null;
};

const bootstrapEvaluator = (data: any): FullEvalator<any, any, any> => {
    let benv = bootstrap.init();
    data.stmts.forEach((stmt: any) => {
        benv = bootstrap.addStatement(stmt, benv, {}, {}).env;
    });
    const san = sanitizedEnv(benv);
    const envArgs = '{' + Object.keys(san).join(', ') + '}';
    return {
        init(): string[] {
            return [];
        },
        setTracing(idx, traceMap) {},
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
                    env = this.addStatement(parsed, env, {}, {}).env;
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
};

function withTracing(
    traceMap: { [loc: number]: { [loc: number]: any[] } },
    loc: number,
    san: { [key: string]: any },
) {
    let count = 0;
    const trace: { [key: number]: any[] } = (traceMap[loc] = {});
    san.$setTracer((loc: number, value: any) => {
        if (!trace[loc]) {
            trace[loc] = [];
        }
        trace[loc].push({ value, at: count++ });
        return value;
    });
}

function sanitizedEnv(benv: { [key: string]: any }) {
    const san: { [key: string]: any } = {};
    Object.entries(benv).forEach(([k, v]) => (san[sanitize(k)] = v));
    return san;
}

export const fnsEvaluator = (
    data: any,
    envArgs: string,
    san: any,
): FullEvalator<any, any, any> | null => {
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
                        env = this.addStatement(parsed, env, {}, {}).env;
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
            addStatement(stmt, env, meta, traceMap) {
                // console.log('add stmt', stmt., meta[stmt.loc]);
                const mm = Object.entries(meta)
                    .map(([k, v]) => [+k, v.trace])
                    .filter((k) => k[1]);
                if (stmt.type === 'sexpr') {
                    // console.log('add stmt', meta[stmt[1]]);
                    let js;
                    try {
                        js = data['compile'](stmt[0])(mm);
                    } catch (err) {
                        return {
                            env,
                            display: `Compilation Error: ${
                                (err as Error).message
                            }`,
                        };
                    }
                    let fn;
                    const fullSource =
                        '{' + env.join('\n') + '\nreturn ' + js + '}';
                    try {
                        fn = new Function(envArgs, fullSource);
                    } catch (err) {
                        return {
                            env,
                            display: `JS Syntax Error: ${
                                (err as Error).message
                            }\n${js}`,
                        };
                    }
                    try {
                        let old = san.$trace;
                        if (meta[stmt[1]]?.traceTop) {
                            withTracing(traceMap, stmt[1], san);
                        }
                        const value = fn(san);
                        san.$setTracer(null);
                        return {
                            env,
                            display: valueToString(value),
                        };
                    } catch (err) {
                        const locs: { row: number; col: number }[] = [];
                        (err as Error).stack!.replace(
                            /<anonymous>:(\d+):(\d+)/g,
                            (a, row, col) => {
                                locs.push({ row: +row, col: +col });
                                return '';
                            },
                        );
                        return {
                            env,
                            display: new LocError(err as Error, fn + ''),
                        };
                    }
                }
                let js;
                try {
                    js = data['compile_stmt'](stmt)(mm);
                } catch (err) {
                    return {
                        env,
                        display: `Compilation Error: ${(err as Error).message}`,
                    };
                }

                try {
                    const fn = new Function(envArgs, '{' + js + '}');
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
            setTracing(idx, traceMap) {
                if (idx != null) {
                    withTracing(traceMap, idx, san);
                } else {
                    san.$setTracer(null);
                }
            },
            evaluate(expr, env, meta) {
                const mm = Object.entries(meta)
                    .map(([k, v]) => [+k, v.trace])
                    .filter((k) => k[1]);

                try {
                    const js = data['compile'](expr)(mm);
                    const fn = new Function(
                        envArgs,
                        '{' + env.join('\n') + '\nreturn ' + js + '}',
                    );
                    try {
                        return fn(san);
                    } catch (err) {
                        return `Error ${(err as Error).message}`;
                    }
                } catch (err) {
                    return `Error ${(err as Error).message}`;
                }
            },
        };
    } else {
        console.log('NOPE', Object.keys(data));
    }
    return null;
};
