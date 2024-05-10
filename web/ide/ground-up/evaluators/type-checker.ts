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
import { Infer, TypeChecker } from './interface';

type Type = { _type: 1 };
type Stmt = { _stmt: 1 };
type Expr = { _expr: 1 };
type Env = { _env: 1 };

export const advancedInfer = (fns: {
    infer_stmts2: (env: Env) => (stmts: arr<Stmt>) => InferStmts2<Env, Type>;
    infer2: (env: Env) => (expr: Expr) => InferExpr2<Type>;
    type_to_cst: (type: Type) => jcst;
}): Infer<Env, Stmt, Expr, Type> => ({
    infer(stmts, env) {
        const result: InferStmts2<Env, Type> = fns['infer_stmts2'](env)(
            wrapArray(stmts),
        );
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
                          err: parseTerr(fns.type_to_cst, result[0][0]),
                      },
            typesAndLocs: unwrapArray(result[1][0]).map((tal) => ({
                loc: tal[0],
                type: tal[1],
            })),
            usages: getUsages(result[1][1]),
        };
    },
    inferExpr(expr, env) {
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
                    ? { type: 'ok', value: result[0][0] }
                    : {
                          type: 'err',
                          err: parseTerr(fns.type_to_cst, result[0][0]),
                      },
            usages: getUsages(result[1][1]),
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
          0: arr<tuple3<string, number, Type>>;
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
                result: { type: 'ok', value: result },
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

function parseTerr(
    type_to_cst: (t: any) => jcst,
    result: terr<any>,
): InferenceError {
    if (result.type === 'tmissing') {
        return {
            type: 'missing',
            missing: unwrapArray(result[0])
                .map(unwrapTuple3)
                .map(([name, loc, type]) => ({
                    loc,
                    name,
                    type: fixDuplicateLocs(fromJCST(type_to_cst(type))),
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
