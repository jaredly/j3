import { LocedName } from '../../../custom/store/sortTops';
import { jcst, toJCST } from '../round-1/j-cst';
import {
    arr,
    tuple,
    tuple3,
    unwrapArray,
    unwrapTuple,
    unwrapTuple3,
} from '../round-1/parse';
import { Analyze, Parser } from './interface';

export type Stmt = { _stmt: 1 };
export type Expr = { _expr: 1 };
export type Type = { _type: 1 };
export type Env = { _env: 1 };

type namesRes = arr<tuple3<string, { type: LocedName['kind'] }, number>>;

const parseLocedName = (res: namesRes) =>
    unwrapArray(res)
        .map(unwrapTuple3)
        .map(([name, { type: kind }, loc]) => ({ name, kind, loc }));

const guard =
    <a, b>(dft: b, fn: (a: a) => b) =>
    (a: a) => {
        try {
            return fn(a);
        } catch (err) {
            console.error(`Error!`);
            console.error(err);
            return dft;
        }
    };

export const analyzer = (fns: {
    names(stmt: Stmt): namesRes;
    externals_stmt(stmt: Stmt): namesRes;
    externals_expr(expr: Expr): namesRes;
    stmt_size(stmt: Stmt): number;
    expr_size(expr: Expr): number;
    type_size(type: Type): number;
    locals_at?(loc: number): (stmt: Stmt) => arr<tuple<string, number>>;
}): Analyze<Stmt, Expr, Type> => ({
    names: guard([], (stmt) => parseLocedName(fns.names(stmt))),
    externalsStmt: guard([], (stmt) =>
        parseLocedName(fns.externals_stmt(stmt)),
    ),
    externalsExpr: guard([], (stmt) =>
        parseLocedName(fns.externals_expr(stmt)),
    ),
    stmtSize: guard(-1, fns.stmt_size),
    exprSize: guard(-1, fns.expr_size),
    typeSize: guard(-1, fns.type_size),
    localsAt: fns.locals_at
        ? (loc, stmt) => unwrapArray(fns.locals_at!(loc)(stmt)).map(unwrapTuple)
        : undefined,
});
