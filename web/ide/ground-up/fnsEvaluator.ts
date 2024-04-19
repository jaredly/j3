import { MyEvalError, LocError } from './Evaluators';
import { Errors, FullEvalator, Produce, ProduceItem } from './FullEvalator';
import { valueToString } from './valueToString';
import { findTops } from './findTops';
import { arr, expr, stmt, unwrapArray, wrapArray } from './round-1/parse';
import { sanitize } from './round-1/sanitize';
import { fromMCST } from '../../../src/types/mcst';
import { toJCST } from './round-1/j-cst';
import { FnsEnv, TraceMap, sanitizedEnv, withTracing } from './loadEv';
import { MetaDataMap } from '../../custom/UIState';
import { depSort } from '../../custom/store/depSort';
import { LocedName } from '../../custom/store/sortTops';
import { unique } from '../../custom/store/unique';
import { builtins } from './builtins';
import { filterNulls } from '../../custom/old-stuff/filterNulls';

/**
 * This is for creating an evaluator out of a sandbox that was compiled
 * to javascript by something other than the `:bootstrap:` evaluator.
 */

type CallingConvention = 'curried' | 'tuple' | 'tuple-nil';

const makeTuple = (values: any[]) => {
    let res = values[values.length - 1];
    for (let i = values.length - 2; i >= 0; i--) {
        res = { type: ',', 0: values[i], 1: res };
    }
    return res;
};

type InferExpr2 = {
    type: ',,';
    0:
        | { type: 'ok'; 0: any }
        | {
              type: 'err';
              0: {
                  type: ',';
                  0: string;
                  1: arr<{ type: ','; 0: string; 1: number }>;
              };
          };
    1: arr<{ type: ','; 0: number; 1: any }>;
    2: {
        type: ',';
        0: arr<number>;
        1: arr<{ type: ','; 0: number; 1: number }>;
    };
};

const getUsages = (data: InferExpr2[2]) => {
    const usages: Record<number, number[]> = {};
    unwrapArray(data[0]).forEach((loc) => (usages[loc] = []));
    unwrapArray(data[1]).forEach(({ 0: loc, 1: provider }) => {
        if (loc === provider) return;
        if (!usages[provider]) {
            usages[provider] = [];
        }
        usages[provider].push(loc);
    });
    return usages;
};

type InferStmts2 = {
    type: ',,';
    0:
        | { type: 'ok'; 0: { type: ','; 0: any; 1: arr<any> } }
        | {
              type: 'err';
              0: {
                  type: ',';
                  0: string;
                  1: arr<{ type: ','; 0: string; 1: number }>;
              };
          };
    1: arr<{ type: ','; 0: number; 1: any }>;
    2: {
        type: ',';
        0: arr<number>;
        1: arr<{ type: ','; 0: number; 1: number }>;
    };
};

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
        const keys = ['parse_stmt', 'parse_expr', 'compile', 'compile_stmt'];
        throw new Error(
            `Can't produce a fnsEvaluator: ${keys.map(
                (k) => `${k}: ${!!data[k]}`,
            )} : ${Object.keys(data)}`,
        );
    }

    return {
        id,
        init() {
            return { js: [], values: sanitizedEnv(builtins()) };
        },

        // @ts-ignore
        _data: data,

        inference: data['infer_stmts']
            ? {
                  initType() {
                      return data['env_nil'];
                  },
                  infer(stmts, env) {
                      if (data['infer_stmts2']) {
                          const result: InferStmts2 = data['infer_stmts2'](env)(
                              wrapArray(stmts),
                          );
                          return {
                              result:
                                  result[0].type === 'ok'
                                      ? {
                                            type: 'ok',
                                            value: {
                                                env: result[0][0][0],
                                                types: unwrapArray(
                                                    result[0][0][1],
                                                ),
                                            },
                                        }
                                      : {
                                            type: 'err',
                                            err: {
                                                message: result[0][0][0],
                                                items: unwrapArray(
                                                    result[0][0][1],
                                                ).map((item) => ({
                                                    loc: item[1],
                                                    name: item[0],
                                                })),
                                            },
                                        },
                              typesAndLocs: unwrapArray(result[1]).map(
                                  (tal) => ({
                                      loc: tal[0],
                                      type: tal[1],
                                  }),
                              ),
                              usages: getUsages(result[2]),
                          };
                      }
                      try {
                          return {
                              result: {
                                  type: 'ok',
                                  value: {
                                      env: data['infer_stmts'](env)(
                                          wrapArray(stmts),
                                      ),
                                      types: [],
                                  },
                              },
                              usages: {},
                              typesAndLocs: [],
                          };
                      } catch (err) {
                          return {
                              result: {
                                  type: 'err',
                                  err: {
                                      message: (err as Error).message,
                                      items: [],
                                  },
                              },
                              typesAndLocs: [],
                              usages: {},
                          };
                      }
                  },
                  inferExpr(expr, env) {
                      if (data['infer2']) {
                          const result: InferExpr2 = data['infer2'](env)(expr);
                          return {
                              typesAndLocs: unwrapArray(result[1]).map(
                                  (res) => ({ loc: res[0], type: res[1] }),
                              ),
                              result:
                                  result[0].type === 'ok'
                                      ? { type: 'ok', value: result[0][0] }
                                      : {
                                            type: 'err',
                                            err: {
                                                message: result[0][0][0],
                                                items: unwrapArray(
                                                    result[0][0][1],
                                                ).map((item) => ({
                                                    loc: item[1],
                                                    name: item[0],
                                                })),
                                            },
                                        },
                              usages: getUsages(result[2]),
                          };
                      }
                      try {
                          const result = data['infer'](env)(expr);
                          return {
                              result: { type: 'ok', value: result },
                              typesAndLocs: [],
                              usages: {},
                          };
                      } catch (err) {
                          return {
                              result: {
                                  type: 'err',
                                  err: {
                                      message: (err as Error).message,
                                      items: [],
                                  },
                              },
                              typesAndLocs: [],
                              usages: {},
                          };
                      }
                  },
                  addTypes(env, nenv) {
                      return data['add_stmt'](env)(nenv);
                  },
                  typeForName(env, name) {
                      const res = data['get_type'](env)(name);
                      if (res.type === 'some') {
                          return res[0];
                      }
                      return null;
                  },
                  typeToString(type) {
                      return data['type_to_string'](type);
                  },
              }
            : undefined,

        analysis:
            data['externals_stmt'] && data['externals_expr'] && data['names']
                ? {
                      dependencies(stmt) {
                          try {
                              const deps = unwrapArray<{
                                  type: ',,';
                                  0: string;
                                  1: { type: LocedName['kind'] };
                                  2: number;
                              }>(data['externals_stmt'](stmt));
                              return deps.map((item) => ({
                                  name: item[0],
                                  loc: item[2],
                                  kind: item[1].type,
                              }));
                          } catch (err) {
                              console.warn(`Cant get dependencies`, stmt);
                              console.error(err);
                              return [];
                          }
                      },
                      size(stmt) {
                          if (data['stmt_size']) {
                              try {
                                  return data['stmt_size'](stmt);
                              } catch (err) {
                                  console.error('failed to get size', err);
                              }
                          }
                          return null;
                      },
                      exprDependencies(stmt) {
                          try {
                              const deps = unwrapArray<{
                                  type: ',,';
                                  0: string;
                                  1: { type: LocedName['kind'] };
                                  2: number;
                              }>(data['externals_expr'](stmt));
                              return deps.map((item) => ({
                                  name: item[0],
                                  loc: item[2],
                                  kind: item[1].type,
                              }));
                          } catch (err) {
                              console.warn(`Cant get dependencies`, stmt);
                              console.error(err);
                              return [];
                          }
                      },

                      stmtNames(stmt) {
                          try {
                              return unwrapArray(
                                  data['names'](stmt) as arr<{
                                      type: ',,';
                                      0: string;
                                      1: { type: LocedName['kind'] };
                                      2: number;
                                  }>,
                              ).map((res) => ({
                                  name: res[0],
                                  loc: res[2],
                                  kind: res[1].type,
                              }));
                          } catch (err) {
                              console.error(`cant get stmt naems`, err);
                              return [];
                          }
                      },
                  }
                : undefined,

        parse(node, errors) {
            const j = toJCST(node);
            if (!j) return;
            try {
                return data['parse_stmt'](j);
            } catch (err) {
                // This is just looking annoying.
                errors[node.loc] = [
                    'ParseStmt failed: ' + (err as Error).message,
                ];
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
            if (!this.analysis) {
                throw new Error(`toFile requires analysis`);
            }
            let env = this.init();
            let tenv = this.inference?.initType();
            const errors: Errors = {};
            const allNames: LocedName[] = [];
            let ret: null | string = null;
            const tops = findTops(state);
            const sorted = depSort(
                tops
                    .map((top) => {
                        const node = fromMCST(top.top, state.map);
                        if (
                            node.type === 'blank' ||
                            node.type === 'comment-node' ||
                            node.type === 'rich-text'
                        ) {
                            return;
                        }
                        const errs = {};
                        const stmt = this.parse(node, errs);
                        if (!stmt) return;
                        return {
                            id: top.top,
                            top,
                            node,
                            stmt,
                            names: this.analysis!.stmtNames(stmt),
                            deps: this.analysis!.dependencies(stmt),
                        };
                    })
                    .filter(filterNulls),
            );

            sorted.forEach((group) => {
                if (
                    group.every((item) => item.stmt.type === 'sexpr') &&
                    group[0].top.top !== target
                ) {
                    return;
                }
                const result = this.addStatements(
                    group.map((g) => g.stmt),
                    env,
                    {},
                    {},
                );
                if (
                    group[0].top.top === target &&
                    'js' in result &&
                    typeof result.js === 'string'
                ) {
                    ret = result.js;
                    return;
                }
                env.js.push((result as any).js);
                env = result.env;
                allNames.push(
                    ...group
                        .flatMap(({ names }) => names)
                        .filter((n) => n.kind === 'value'),
                );
            });

            if (target != null && ret == null) {
                throw new Error(`tagtet wasnt a toplevel ${target}`);
            }
            if (ret) {
                env.js.push(`return ${ret}`);
            } else {
                env.js.push(
                    `return {type: 'fns', ${allNames
                        .map(({ name }) => sanitize(name))
                        .sort()
                        .join(', ')}}`,
                );
            }
            return { js: env.js.join('\n'), errors };
        },

        addStatements(stmts, env, meta, trace, displayResult) {
            const display: { [key: number]: ProduceItem[] } = {};
            // const values: Record<string, any> = {};
            let names:
                | {
                      type: ',,';
                      0: string;
                      1: { type: LocedName['kind'] };
                      2: number;
                  }[]
                | null = null;
            if (data['names']) {
                try {
                    names = Object.values(stmts).flatMap((stmt) =>
                        unwrapArray(data['names'](stmt)),
                    );
                } catch (err) {
                    console.error(`cant get names`, err);
                    Object.keys(stmts).forEach((k) => {
                        display[+k] = [
                            {
                                type: 'error',
                                message:
                                    'Error while getting stmt names ' +
                                    (err as Error).message,
                            },
                        ];
                    });
                }
            }

            // Object.entries(stmts).forEach(([id, stmt]) => {
            //     display[+id] = [];

            //     if (stmt.type === 'sexpr' && tenv && data['infer']) {
            //         try {
            //             display[+id] = [
            //                 data['type_to_string'](
            //                     data['infer'](tenv)(stmt[0]),
            //                 ),
            //             ];
            //         } catch (err) {
            //             display[+id] = [
            //                 new MyEvalError('Type Checker', err as Error),
            //             ];
            //         }
            //     }

            //     if (
            //         tenv &&
            //         data['names'] &&
            //         data['get_type'] &&
            //         stmt.type === 'sdef'
            //     ) {
            //         const names: { type: ','; 0: string; 1: number }[] =
            //             unwrapArray(data['names'](stmt));
            //         const types: any[] = names.map((name) =>
            //             data['get_type'](tenv)(name[0]),
            //         );
            //         (display[+id] as any[]).push(
            //             ...types.map((type, i) => {
            //                 if (type.type === 'some') {
            //                     return `${names[i][0]}⁚ ${data[
            //                         'type_to_string'
            //                     ](type[0])}`;
            //                 }
            //                 return new Error(`No type for ${names[i][0]}`);
            //             }),
            //         );
            //     }
            // });

            const res = compileStmt(
                data,
                san,
                Object.values(stmts),
                env,
                meta,
                trace,
                displayResult,
                names,
            );

            Object.keys(stmts).forEach((id) => {
                if (display[+id]) {
                    display[+id].push(...res.display);
                } else {
                    display[+id] = res.display;
                }
            });

            return { env, display, values: res.values, js: res.js };
        },

        setTracing(idx, traceMap, env) {
            if (idx != null) {
                withTracing(traceMap, idx, env.values, env);
            } else {
                env.values.$setTracer(null);
            }
        },

        evaluate(expr, env, meta) {
            const mm = prepareMeta(meta, data['parse_version'] === 2);

            const externals: { type: ','; 0: string; 1: number }[] =
                unwrapArray(data['externals_expr'](expr));
            const { needed, values } = assembleExternals(externals, env, san);

            try {
                const js = data['compile'](expr)(mm);
                const fn = new Function(
                    needed.length
                        ? `{${needed.map(sanitize).join(', ')}}`
                        : '_',
                    'return ' + js,
                );
                try {
                    return fn(values);
                } catch (err) {
                    return `Error ${(err as Error).message} Deps:${needed.join(
                        ',',
                    )}`;
                }
            } catch (err) {
                return `Error ${(err as Error).message} Deps:${needed.join(
                    ',',
                )}`;
            }
        },
    };
};

const compileStmt = (
    data: any,
    san: any,
    stmts: stmt[],
    env: FnsEnv,
    meta: MetaDataMap,
    traceMap: TraceMap,
    renderValue: (v: any) => ProduceItem[] = (v) => [valueToString(v)],
    names?:
        | null
        | {
              type: ',,';
              0: string;
              1: { type: LocedName['kind'] };
              2: number;
          }[],
): {
    env: any;
    display: ProduceItem[];
    values: Record<string, any>;
    js?: string;
} => {
    const mm = prepareMeta(meta, data['parse_version'] === 2);

    let externals: { type: ','; 0: string; 1: number }[] = [];
    if (data['externals_stmt']) {
        try {
            externals = stmts.flatMap((stmt) =>
                unwrapArray(data['externals_stmt'](stmt)),
            );
        } catch (err) {
            console.error('Unable to calculate externals');
            console.error(err);
        }
    }
    const { needed, values } = assembleExternals(externals, env, san, names);

    if (stmts.length === 1 && stmts[0].type === 'sexpr') {
        let type = null;

        let js;
        try {
            js = data['compile'](stmts[0][0])(mm);
        } catch (err) {
            // console.log('error');
            // console.error(err);
            return {
                env,
                display: [
                    {
                        type: 'eval',
                        message: `Compilation Error`,
                        inner: (err as Error).message,
                        stack: (err as Error).stack,
                    },
                ],
                values: {},
            };
        }
        let fn;
        try {
            fn = new Function(
                needed.length ? `{${needed.map(sanitize).join(', ')}}` : '_',
                'return ' + js,
            );
        } catch (err) {
            return {
                env,
                display: [
                    {
                        type: 'error',
                        message: `JS Syntax Error: ${
                            (err as Error).message
                        }\n${js}\nDeps: ${needed.join(',')}`,
                    },
                ],
                values: {},
            };
        }
        try {
            if (meta[stmts[0][1]]?.traceTop) {
                withTracing(traceMap, stmts[0][1], env.values, env);
            }
            const value = fn(values);

            env.values.$setTracer(null);
            return {
                env,
                display: [
                    ...renderValue(value),
                    ...(type ? ['Type: ' + type] : []),
                ],
                values: { _: value },
                js,
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
                display: [
                    {
                        type: 'withjs',
                        message: (err as Error).message,
                        js: fn + '',
                    },
                ],
                values: {},
            };
        }
    }

    let js;
    try {
        js = stmts.map((stmt) => data['compile_stmt'](stmt)(mm)).join('\n\n');
    } catch (err) {
        console.error(err);
        return {
            env,
            display: [
                {
                    type: 'eval',
                    message: `Compilation Error`,
                    inner: (err as Error).message,
                    stack: (err as Error).stack,
                },
            ],
            values: {},
        };
    }

    try {
        let display: ProduceItem[] = [];
        const fn = new Function(
            needed.length ? `{${needed.map(sanitize).join(', ')}}` : '_',
            `{${js};\n${
                names
                    ? 'return {' +
                      names
                          .filter((n) => n[1].type === 'value')
                          .map(({ 0: name }) => sanitize(name))
                          .join(',') +
                      '}'
                    : ''
            }}`,
        );
        const result_values: { [key: string]: any } = {};
        if (names?.length) {
            let result: { [key: string]: any };
            try {
                result = fn(values);
            } catch (err) {
                // debugger;
                return {
                    env,
                    display: [
                        `JS Evaluation Error: ${
                            (err as Error).message
                        }\n${js}\nDeps: ${needed.join(',')}`,
                    ],
                    values: {},
                };
            }
            names.forEach(({ 0: name }) => {
                result_values[name] = result[sanitize(name)];
            });
            Object.assign(env.values, result_values);
            display = names
                .flatMap(({ 0: name }) =>
                    result_values[name] === undefined
                        ? null
                        : typeof result_values[name] !== 'function'
                        ? renderValue(result_values[name])
                        : null,
                )
                .filter(filterNulls);
        }
        // display += '\n' + fn;

        return { env, display, values: names?.length ? result_values : {}, js };
    } catch (err) {
        return {
            env,
            display: [`JS Syntax Error: ${(err as Error).message}\n${js}`],
            values: {},
        };
    }
};

function assembleExternals(
    externals: { type: ','; 0: string; 1: number }[],
    env: FnsEnv,
    san: any,
    names?:
        | null
        | {
              type: ',,';
              0: string;
              1: { type: LocedName['kind'] };
              2: number;
          }[],
) {
    const provided = names?.map((obj) => obj[0]) ?? [];
    const needed = unique(
        externals
            .map((ex) => ex[0])
            .concat(['$trace', 'jsonify', 'valueToString']),
    ).filter(
        // Skip recursive self-calls
        (name) => !provided.includes(name),
    );
    const values: Record<string, any> = {};
    needed.forEach((name) => {
        if (env.values[name] == null) {
            if (san[sanitize(name)]) {
                values[sanitize(name)] = san[sanitize(name)];
            }
        } else {
            values[sanitize(name)] = env.values[name];
        }
    });
    return { needed, values };
}

function prepareMeta(meta: MetaDataMap, and_how: boolean) {
    const mm = Object.entries(meta)
        .map(([k, v]) => [+k, v.trace])
        .filter((k) => k[1]);
    return and_how ? { type: ',', 0: mm, 1: false } : mm;
}
