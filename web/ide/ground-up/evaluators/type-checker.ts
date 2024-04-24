import { fixDuplicateLocs } from '../../../../src/state/fixDuplicateLocs';
import { fromJCST, jcst } from '../round-1/j-cst';
import { arr, unwrapArray, wrapArray } from '../round-1/parse';
import { Infer, TypeChecker } from './interface';

type Type = { _type: 1 };
type Stmt = { _stmt: 1 };
type Expr = { _expr: 1 };
type Env = { _env: 1 };

export const advancedInfer = (fns: {
    infer_stmts2: (env: Env) => (stmts: arr<Stmt>) => InferStmts2;
    infer2: (env: Env) => (expr: Expr) => InferExpr2;
}): Infer<Env, Stmt, Expr, Type> => ({
    infer(stmts, env) {
        const result: InferStmts2 = fns['infer_stmts2'](env)(wrapArray(stmts));
        return {
            result:
                result[0].type === 'ok'
                    ? {
                          type: 'ok',
                          value: {
                              env: result[0][0][0],
                              types: unwrapArray(result[0][0][1]),
                          },
                      }
                    : {
                          type: 'err',
                          err: {
                              message: result[0][0][0],
                              items: unwrapArray(result[0][0][1]).map(
                                  (item) => ({
                                      loc: item[1],
                                      name: item[0],
                                  }),
                              ),
                          },
                      },
            typesAndLocs: unwrapArray(result[1]).map((tal) => ({
                loc: tal[0],
                type: tal[1],
            })),
            usages: getUsages(result[2]),
        };
    },
    inferExpr(expr, env) {
        const result: InferExpr2 = fns.infer2(env)(expr);
        return {
            typesAndLocs: unwrapArray(result[1]).map((res) => ({
                loc: res[0],
                type: res[1],
            })),
            result:
                result[0].type === 'ok'
                    ? { type: 'ok', value: result[0][0] }
                    : {
                          type: 'err',
                          err: {
                              message: result[0][0][0],
                              items: unwrapArray(result[0][0][1]).map(
                                  (item) => ({
                                      loc: item[1],
                                      name: item[0],
                                  }),
                              ),
                          },
                      },
            usages: getUsages(result[2]),
        };
    },
});

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

export const basicInfer = (fns: {
    infer_stmts: (env: Env) => (stmts: arr<Stmt>) => Env;
    infer: (env: Env) => (expr: Expr) => Type;
}): Infer<Env, Stmt, Expr, Type> => ({
    infer(stmts, env) {
        try {
            return {
                result: {
                    type: 'ok',
                    value: {
                        env: fns['infer_stmts'](env)(wrapArray(stmts)),
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
        try {
            const result = fns['infer'](env)(expr);
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
});

export const typeChecker = (fns: {
    env_nil: Env;
    add_stmt: (a: Env) => (b: Env) => Env;
    get_type: (
        a: Env,
    ) => (b: string) => { type: 'some'; 0: Type } | { type: 'none' };
    type_to_string(t: Type): string;
    type_to_cst?(t: Type): jcst;
}): Omit<
    TypeChecker<Env, Stmt, Expr, Type>,
    keyof Infer<Env, Stmt, Expr, Type>
> => ({
    init: () => fns.env_nil,
    addTypes(env, nenv) {
        return fns.add_stmt(env)(nenv);
    },
    typeForName(env, name) {
        const res = fns.get_type(env)(name);
        if (res.type === 'some') {
            return res[0];
        }
        return null;
    },
    typeToString: fns.type_to_string,
    typeToCst: fns.type_to_cst
        ? (type) => fixDuplicateLocs(fromJCST(fns.type_to_cst!(type)))
        : undefined,
});

const getUsages = (data: InferExpr2[2]) => {
    const usages: Record<number, number[]> = {};
    unwrapArray(data[0]).forEach((loc) => (usages[loc] = []));
    unwrapArray(data[1]).forEach(({ 0: loc, 1: provider }) => {
        if (loc === provider) {
            // delete usages[loc]
            return;
        }
        if (!usages[provider]) {
            usages[provider] = [];
        }
        usages[provider].push(loc);
    });
    return usages;
};
