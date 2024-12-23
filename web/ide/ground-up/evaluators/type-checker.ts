import { fixDuplicateLocs } from '../../../../src/state/fixDuplicateLocs';
import { Node } from '../../../../src/types/cst';
import { InferenceError } from '../FullEvalator';
import { fromJCST, jcst } from '../round-1/j-cst';
import {
    arr,
    tuple,
    tuple3,
    unwrapArray,
    unwrapTuple3,
    wrapArray,
} from '../round-1/parse';
import { TypeInfo } from './analyze';
import { Infer, TypeChecker } from './interface';

const unwrapTuple2or3 = <a, b extends { type: string }, c>(
    v: tuple<a, b> | tuple3<a, b, c>,
): [a, b, c | null] => {
    if (v[1].type === ',') {
        return [v[0], (v[1] as tuple<b, c>)[0], (v[1] as tuple<b, c>)[1]];
    } else {
        return [v[0], v[1] as b, null];
    }
};

type Type = { _type: 1 };
type Stmt = { _stmt: 1 };
type Expr = { _expr: 1 };
type Env = { _env: 1 };

export const infer2 = (fns: {
    infer_stmts2: (env: Env) => (stmts: arr<Stmt>) => InferStmts2<Env, Type>;
    // infer_stmts3?: (env: Env) => (stmts: arr<Stmt>) => InferStmts3<Env, Type>;
    infer2: (env: Env) => (expr: Expr) => InferExpr2<Type>;
    type_to_cst: (type: Type) => jcst;
}): Infer<Env, Stmt, Expr, Type> => ({
    infer(stmts, env) {
        return inferStmts2(fns, env, stmts);
    },
    inferExpr(expr, env) {
        return inferExpr2(fns, env, expr);
    },
});

export const infer3 = (fns: {
    infer_stmts3: (env: Env) => (stmts: arr<Stmt>) => InferStmts3<Env, Type>;
    infer3: (env: Env) => (expr: Expr) => InferExpr3<Type, TypeInfo>;
    type_to_cst: (type: Type) => jcst;
}): Infer<Env, Stmt, Expr, Type> => ({
    infer(stmts, env) {
        const result = fns.infer_stmts3(env)(wrapArray(stmts));
        return {
            result: inferResult3(result, fns.type_to_cst),
            typesAndLocs: unwrapArray(result[1]).map((tal) => ({
                loc: tal[0],
                type: tal[1],
            })),
            usages: {},
            // codeGenData: result[1][1],
        };
    },
    inferExpr(expr, env) {
        const result = fns.infer3(env)(expr);
        return {
            typesAndLocs: unwrapArray(result[1]).map((res) => ({
                loc: res[0],
                type: res[1],
            })),
            result:
                result[0].type === 'ok'
                    ? {
                          type: 'ok',
                          value: {
                              type: result[0][0][0],
                              codeGenData: result[0][0][1],
                          },
                      }
                    : {
                          type: 'err',
                          err: parseTerr(fns.type_to_cst, result[0][0]),
                      },
            usages: [],
            // codeGenData: result[1][1],
        };
    },
});

type terr<Type> =
    | {
          type: ',';
          0: string;
          1: arr<tuple<string, number>>;
      }
    | {
          type: 'terr';
          0: string;
          1: arr<tuple<string, number>>;
      }
    | {
          type: 'ttypes';
          0: Type;
          1: Type;
      }
    | {
          type: 'twrap';
          0: terr<Type>;
          1: terr<Type>;
      }
    | {
          type: 'tmissing';
          0: arr<tuple3<string, number, Type> | tuple<string, number>>;
      };

type InferExpr2<Type> = {
    type: ',';
    0: { type: 'ok'; 0: Type } | { type: 'err'; 0: terr<Type> };
    1: {
        type: ',';
        0: arr<tuple<number, Type>>;
        1: tuple<arr<number>, arr<tuple<number, number>>>;
    };
};

type InferExpr3<Type, CodeGenInfo> = {
    type: ',';
    0:
        | { type: 'ok'; 0: tuple<Type, CodeGenInfo> }
        | { type: 'err'; 0: terr<Type> };
    1: arr<tuple<number, Type>>;
};

type InferStmts2<Env, Type> = {
    type: ',';
    0:
        | { type: 'ok'; 0: tuple<Env, arr<Type>> }
        | { type: 'err'; 0: terr<Type> };
    1: {
        type: ',';
        0: arr<tuple<number, Type>>;
        1: tuple<arr<number>, arr<tuple<number, number>>>;
    };
};

type InferStmts3<Env, Type> = {
    type: ',';
    0:
        | { type: 'ok'; 0: tuple<Env, tuple<arr<Type>, any>> }
        | { type: 'err'; 0: terr<Type> };
    1: arr<tuple<number, Type>>;
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
                        type: 'with-items',
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
                result: { type: 'ok', value: { type: result } },
                typesAndLocs: [],
                usages: {},
            };
        } catch (err) {
            return {
                result: {
                    type: 'err',
                    err: {
                        type: 'with-items',
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

export const typeChecker = <SimpleNode>(fns: {
    fromNode?: (node: Node) => SimpleNode;
    toNode?: (node: SimpleNode) => Node;
    env_nil: Env;
    add_stmt: (a: Env) => (b: Env) => Env;
    get_type: (
        a: Env,
    ) => (b: string) => { type: 'some'; 0: Type } | { type: 'none' };
    type_to_string(t: Type): string;
    type_to_cst?(t: Type): SimpleNode;
    env_to_string?(env: Env): string;
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
        ? (type) =>
              fixDuplicateLocs(
                  fns.toNode
                      ? fns.toNode(fns.type_to_cst!(type))
                      : fromJCST(fns.type_to_cst!(type) as jcst),
              )
        : undefined,
    envToString: fns.env_to_string,
});

const getUsages = (data: InferExpr2<any>[1][1]) => {
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

function inferExpr2(
    fns: {
        infer2: (env: Env) => (expr: Expr) => InferExpr2<Type>;
        type_to_cst: (type: Type) => jcst;
    },
    env: Env,
    expr: Expr,
): ReturnType<Infer<any, any, any, any>['inferExpr']> {
    let result: InferExpr2<Type>;
    try {
        result = fns.infer2(env)(expr);
    } catch (err) {
        return {
            result: { type: 'err', err: { type: 'missing', missing: [] } },
            typesAndLocs: [],
            usages: {},
        };
    }
    return {
        typesAndLocs: unwrapArray(result[1][0]).map((res) => ({
            loc: res[0],
            type: res[1],
        })),
        result:
            result[0].type === 'ok'
                ? { type: 'ok', value: { type: result[0][0] } }
                : {
                      type: 'err',
                      err: parseTerr(fns.type_to_cst, result[0][0]),
                  },
        usages: getUsages(result[1][1]),
    };
}

function inferStmts2(
    fns: {
        infer_stmts2: (
            env: Env,
        ) => (stmts: arr<Stmt>) => InferStmts2<Env, Type>;
        type_to_cst: (type: Type) => jcst;
    },
    env: Env,
    stmts: Stmt[],
): ReturnType<Infer<any, any, any, any>['infer']> {
    const result: InferStmts2<Env, Type> = fns.infer_stmts2(env)(
        wrapArray(stmts),
    );
    return {
        result: inferResult(result, fns.type_to_cst),
        typesAndLocs: unwrapArray(result[1][0]).map((tal) => ({
            loc: tal[0],
            type: tal[1],
        })),
        usages: getUsages(result[1][1]),
    };
}

function inferResult3(
    result: InferStmts3<Env, Type>,
    type_to_cst: (type: Type) => jcst,
):
    | { type: 'err'; err: InferenceError }
    | { type: 'ok'; value: { env: any; types: any[]; codeGenData: any } } {
    return result[0].type === 'ok'
        ? {
              type: 'ok',
              value: {
                  env: result[0][0][0],
                  types: unwrapArray(result[0][0][1][0]),
                  codeGenData: result[0][0][1][1],
              },
          }
        : {
              type: 'err',
              err: parseTerr(type_to_cst, result[0][0]),
          };
}

function inferResult(
    result: InferStmts2<Env, Type>,
    type_to_cst: (type: Type) => jcst,
):
    | { type: 'err'; err: InferenceError }
    | { type: 'ok'; value: { env: any; types: any[] } } {
    return result[0].type === 'ok'
        ? {
              type: 'ok',
              value: {
                  env: result[0][0][0],
                  types: unwrapArray(result[0][0][1]),
              },
          }
        : {
              type: 'err',
              err: parseTerr(type_to_cst, result[0][0]),
          };
}

function parseTerr(
    type_to_cst: (t: any) => jcst,
    result: terr<any>,
): InferenceError {
    if (result.type === 'tmissing') {
        return {
            type: 'missing',
            missing: unwrapArray(result[0])
                .map(unwrapTuple2or3 as any)
                .map(([name, loc, type]: any) => ({
                    loc,
                    name,
                    type: type
                        ? fixDuplicateLocs(fromJCST(type_to_cst(type)))
                        : null,
                })),
        };
    }
    if (result.type !== ',' && result.type !== 'terr') {
        // throw new Error(`cant handle the truth ${JSON.stringify(result)}`);
        if (result.type === 'ttypes') {
            return {
                type: 'types',
                one: fixDuplicateLocs(fromJCST(type_to_cst(result[0]))),
                two: fixDuplicateLocs(fromJCST(type_to_cst(result[1]))),
            };
        }
        if (result.type === 'twrap') {
            return {
                type: 'nested',
                outer: parseTerr(type_to_cst, result[0]),
                inner: parseTerr(type_to_cst, result[1]),
            };
        }
    }
    return {
        type: 'with-items',
        message: result[0],
        items: unwrapArray(result[1]).map((item) => ({
            loc: item[1],
            name: item[0],
        })),
    };
}
