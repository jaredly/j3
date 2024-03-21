import {
    Errors,
    MyEvalError,
    FullEvalator,
    LocError,
    Display,
} from './Evaluators';
import { valueToString } from './reduce';
import { findTops } from './findTops';
import { expr, stmt, unwrapArray, wrapArray } from './round-1/parse';
import { sanitize } from './round-1/builtins';
import { fromMCST } from '../../../src/types/mcst';
import { toJCST } from './round-1/j-cst';
import { FnsEnv, TraceMap, withTracing } from './loadEv';
import { MetaDataMap } from '../../custom/UIState';

/**
 * This is for creating an evaluator out of a sandbox that was compiled
 * to javascript by something other than the `:bootstrap:` evaluator.
 */

export const fnsEvaluator = (
    id: string,
    data: any,
    envArgs: string,
    san: any,
): FullEvalator<FnsEnv, stmt & { loc: number }, expr> | null => {
    if (
        !data['parse_stmt'] ||
        !data['parse_expr'] ||
        !data['compile'] ||
        !data['compile_stmt']
    ) {
        console.log('NOPE', Object.keys(data));
        return null;
    }
    return {
        id,
        init() {
            return {
                js: [],
                values: {},
                typeCheck: data['env_nil'],
            };
        },
        dependencies(stmt) {
            if (!data['externals_stmt']) {
                return [];
            }
            const deps = unwrapArray<{ type: ','; 0: string; 1: number }>(
                data['externals_stmt'](stmt),
            );
            return deps.map((item) => ({ name: item[0], loc: item[1] }));
        },
        stmtNames(stmt) {
            if (data['names']) {
                return unwrapArray(data['names'](stmt));
            }
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
        toFile(state, target) {
            let env = this.init();
            const errors: Errors = {};
            const names: string[] = [];
            let ret: null | string = null;
            findTops(state).forEach((top) => {
                const node = fromMCST(top.top, state.map);
                if (node.type === 'blank') return;
                const parsed = this.parse(node, errors);
                if (!parsed) return;
                if (parsed.type === 'sdef') {
                    names.push(parsed[0]);
                }
                if (parsed.type === 'sexpr') {
                    if (top.top === target) {
                        ret = data['compile'](parsed[0])([]);
                    }
                }
                try {
                    env = this.addStatement(parsed, env, {}, {}).env;
                } catch (err) {
                    console.error(err);
                }
            });
            if (target != null && ret == null) {
                throw new Error(`tagtet wasnt a toplevel ${target}`);
            }
            if (ret) {
                env.js.push(`return ${ret}`);
            } else {
                env.js.push(
                    `return {type: 'fns', ${names
                        .map((name) => sanitize(name))
                        .sort()
                        .join(', ')}}`,
                );
            }
            return { js: env.js.join('\n'), errors };
        },
        addStatements: data['infer_defns']
            ? (stmts, env, meta, trace) => {
                  const display: { [key: number]: Display } = {};

                  try {
                      env.typeCheck = data['infer_defns'](env.typeCheck)(
                          wrapArray(Object.values(stmts)),
                      );
                  } catch (err) {
                      console.error(err);
                      return {
                          env,
                          display: {
                              [+Object.keys(stmts)[0]]: new MyEvalError(
                                  `Type Error`,
                                  err as Error,
                              ),
                          },
                      };
                  }

                  for (let [key, value] of Object.entries(stmts)) {
                      const res = compileStmt(
                          data,
                          envArgs,
                          san,
                          value,
                          env,
                          meta,
                          trace,
                      );
                      display[+key] = res.display;
                      env = res.env;
                  }
                  return { env, display };
              }
            : undefined,
        addStatement(stmt, env, meta, traceMap) {
            if (data['infer_stmt']) {
                try {
                    env.typeCheck = data['infer_stmt'](env.typeCheck)(stmt);
                } catch (err) {
                    console.error(err);
                    return {
                        env,
                        display: new MyEvalError(`Type Error`, err as Error),
                    };
                }
            }

            return compileStmt(data, envArgs, san, stmt, env, meta, traceMap);
        },
        setTracing(idx, traceMap, env) {
            if (idx != null) {
                withTracing(traceMap, idx, san, env);
            } else {
                san.$setTracer(null);
            }
        },
        evaluate(expr, env, meta) {
            const mm = Object.entries(meta)
                .map(([k, v]) => [+k, v.trace])
                .filter((k) => k[1]);

            let type = null;
            if (data['infer']) {
                type = data['type_to_string'](
                    data['infer'](env.typeCheck)(expr),
                );
            }

            try {
                const js = data['compile'](expr)(mm);
                const fn = new Function(
                    envArgs,
                    '{' + env.js.join('\n') + '\nreturn ' + js + '}',
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
};

const compileStmt = (
    data: any,
    envArgs: string,
    san: any,
    stmt: stmt,
    env: FnsEnv,
    meta: MetaDataMap,
    traceMap: TraceMap,
) => {
    const mm = Object.entries(meta)
        .map(([k, v]) => [+k, v.trace])
        .filter((k) => k[1]);
    if (stmt.type === 'sexpr') {
        let type = null;
        if (data['infer']) {
            try {
                type = data['type_to_string'](
                    data['infer'](env.typeCheck)(stmt[0]),
                );
            } catch (err) {
                console.error(err);
                return {
                    env,
                    display: new MyEvalError(`Type Error`, err as Error),
                };
            }
        }

        let js;
        try {
            js = data['compile'](stmt[0])(mm);
        } catch (err) {
            return {
                env,
                display: new MyEvalError(`Compilation Error`, err as Error),
            };
        }
        let fn;
        const fullSource = '{' + env.js.join('\n') + '\nreturn ' + js + '}';
        try {
            fn = new Function(envArgs, fullSource);
        } catch (err) {
            return {
                env,
                display: `JS Syntax Error: ${(err as Error).message}\n${js}`,
            };
        }
        try {
            let old = san.$trace;
            if (meta[stmt[1]]?.traceTop) {
                withTracing(traceMap, stmt[1], san, env);
            }
            const value = fn(san);
            san.$setTracer(null);
            return {
                env,
                display: valueToString(value) + (type ? '\nType: ' + type : ''),
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

    let name = stmt.type === 'sdef' ? stmt[0] : null;

    try {
        const fn = new Function(
            envArgs,
            `{${env.js.join('\n')};\n${js};\n${
                name ? 'return ' + sanitize(name) : ''
            }}`,
        );
        if (name) {
            try {
                env.values[name] = fn(san);
            } catch (err) {
                return {
                    env,
                    display: `JS Evaluation Error: ${
                        (err as Error).message
                    }\n${js}`,
                };
            }
        }

        env.js.push(js);
        return { env, display: `compiled` };
    } catch (err) {
        return {
            env,
            display: `JS Syntax Error: ${(err as Error).message}\n${js}`,
        };
    }
};
