import { LocedName } from '../../../custom/store/sortTops';
import {
    arr,
    tuple,
    tuple3,
    unwrapArray,
    unwrapTuple,
    unwrapTuple3,
} from '../round-1/parse';
import { Analyze } from './interface';

export type Stmt = { _stmt: 1 };
export type Expr = { _expr: 1 };
export type Type = { _type: 1 };
export type Env = { _env: 1 };

type namesRes =
    | arr<tuple3<string, { type: LocedName['kind'] }, number>>
    | Array<LocedName>;

const parseLocedName = (res: namesRes) =>
    Array.isArray(res)
        ? res
        : unwrapArray(res)
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
    stmt_size?(stmt: Stmt): number;
    expr_size?(expr: Expr): number;
    type_size?(type: Type): number;
    locals_at?(loc: number): (stmt: Stmt) => arr<tuple<string, number>>;
}): Analyze<Stmt, Expr, Type> => ({
    names: guard([], (stmt) => parseLocedName(fns.names(stmt))),
    externalsStmt: guard([], (stmt) =>
        parseLocedName(fns.externals_stmt(stmt)),
    ),
    externalsExpr: guard([], (stmt) =>
        parseLocedName(fns.externals_expr(stmt)),
    ),
    stmtSize: fns.stmt_size ? guard(-1, fns.stmt_size) : () => null,
    exprSize: fns.expr_size ? guard(-1, fns.expr_size) : () => null,
    typeSize: fns.type_size ? guard(-1, fns.type_size) : () => null,
    localsAt: fns.locals_at
        ? (loc, stmt) => unwrapArray(fns.locals_at!(loc)(stmt)).map(unwrapTuple)
        : undefined,
});
