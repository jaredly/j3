import { jcst, toJCST } from '../round-1/j-cst';
import { arr, tuple, unwrapArray, unwrapTuple } from '../round-1/parse';
import { Parser } from './interface';

type Stmt = { _stmt: 1 };
type Expr = { _expr: 1 };
type Env = { _env: 1 };

export const basicParser = (fns: {
    parse_stmt: (cst: jcst) => Stmt;
    parse_expr: (cst: jcst) => Expr;
}): Parser<Stmt, Expr> => ({
    parse(node) {
        const j = toJCST(node);
        try {
            return { stmt: j ? fns.parse_stmt(j) : null, errors: [] };
        } catch (err) {
            return {
                stmt: null,
                errors: [[node.loc, (err as Error).message]],
            };
        }
    },

    parseExpr(node) {
        const j = toJCST(node);
        try {
            return { expr: j ? fns.parse_expr(j) : null, errors: [] };
        } catch (err) {
            return {
                expr: null,
                errors: [[node.loc, (err as Error).message]],
            };
        }
    },
});

export const recoveringParser = (fns: {
    parse_stmt2(cst: jcst): tuple<arr<tuple<number, string>>, Stmt>;
    parse_expr2(cst: jcst): tuple<arr<tuple<number, string>>, Expr>;
}): Parser<Stmt, Expr> => ({
    parse(node) {
        const j = toJCST(node);
        if (!j) return { stmt: null, errors: [] };
        try {
            const [errors, stmt] = unwrapTuple(fns.parse_stmt2(j));
            return { stmt, errors: unwrapArray(errors).map(unwrapTuple) };
        } catch (err) {
            return { stmt: null, errors: [[node.loc, (err as Error).message]] };
        }
    },

    parseExpr(node) {
        const j = toJCST(node);
        if (!j) return { expr: null, errors: [] };
        try {
            const [errors, expr] = unwrapTuple(fns.parse_expr2(j));
            return { expr, errors: unwrapArray(errors).map(unwrapTuple) };
        } catch (err) {
            return { expr: null, errors: [[node.loc, (err as Error).message]] };
        }
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
