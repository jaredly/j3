import { LocedName } from '../../../custom/store/sortTops';
import {
    arr,
    tuple,
    tuple3,
    unwrapArray,
    unwrapTuple,
    unwrapTuple3,
} from '../round-1/parse';
import { AllNames, Analyze } from './interface';

export type TypeInfo = { _type_info: 1 };
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

export type reportedName =
    | {
          type: 'local';
          0: number;
          1: { type: 'decl' } | { type: 'usage'; 0: number };
      }
    | {
          type: 'global';
          0: string;
          1: { type: 'value' } | { type: 'type' };
          2: number;
          3: { type: 'decl' } | { type: 'usage' };
      };

const handleAllNames = (res: AllNames) => (item: reportedName) => {
    if (item.type === 'local') {
        if (item[1].type === 'decl') {
            res.local.declarations.push(item[0]);
        } else {
            res.local.usages.push({
                loc: item[0],
                decl: item[1][0],
            });
        }
    } else {
        const lname: LocedName = {
            loc: item[2],
            name: item[0],
            kind: item[1].type,
        };
        if (item[3].type === 'decl') {
            res.global.declarations.push(lname);
        } else {
            res.global.usages.push(lname);
        }
    }
};

export const blankAllNames = (): AllNames => ({
    global: { declarations: [], usages: [] },
    local: { declarations: [], usages: [] },
});

export const assignAllNames = (one: AllNames, two: AllNames) => {
    one.global.declarations.push(...two.global.declarations);
    one.global.usages.push(...two.global.usages);
    one.local.declarations.push(...two.local.declarations);
    one.local.usages.push(...two.local.usages);
};

export const analyzer = (fns: {
    names(stmt: Stmt): namesRes;
    externals_stmt(stmt: Stmt): namesRes;
    externals_expr(expr: Expr): namesRes;
    stmt_size?(stmt: Stmt): number;
    expr_size?(expr: Expr): number;
    type_size?(type: Type): number;
    locals_at?(loc: number): (stmt: Stmt) => arr<tuple<string, number>>;
    all_names?(top: Stmt): arr<reportedName>;
    all_names_expr?(top: Expr): arr<reportedName>;
}): Analyze<Stmt, Expr, Type> => ({
    allNamesExpr(expr) {
        const res = blankAllNames();
        if (fns.all_names_expr && 1 > 2) {
            try {
                unwrapArray(fns.all_names_expr(expr)).forEach(
                    handleAllNames(res),
                );
            } catch (err) {
                console.warn(err);
            }
        } else {
            res.global.usages = parseLocedName(fns.externals_expr(expr));
        }
        return res;
    },
    allNames(stmt) {
        const res: AllNames = {
            global: { declarations: [], usages: [] },
            local: { declarations: [], usages: [] },
        };
        if (fns.all_names && 1 > 2) {
            try {
                unwrapArray(fns.all_names(stmt)).forEach(handleAllNames(res));
            } catch (err) {
                console.warn(err);
            }
        } else {
            try {
                res.global.declarations = parseLocedName(fns.names(stmt));
                res.global.usages = parseLocedName(fns.externals_stmt(stmt));
            } catch (err) {
                console.warn(err);
            }
        }
        return res;
    },
    // names: guard([], (stmt) => parseLocedName(fns.names(stmt))),
    // externalsStmt: guard([], (stmt) =>
    //     parseLocedName(fns.externals_stmt(stmt)),
    // ),
    // externalsExpr: guard([], (stmt) =>
    //     parseLocedName(fns.externals_expr(stmt)),
    // ),
    stmtSize: fns.stmt_size ? guard(-1, fns.stmt_size) : () => null,
    exprSize: fns.expr_size ? guard(-1, fns.expr_size) : () => null,
    typeSize: fns.type_size ? guard(-1, fns.type_size) : () => null,
    localsAt: fns.locals_at
        ? (loc, stmt) => unwrapArray(fns.locals_at!(loc)(stmt)).map(unwrapTuple)
        : undefined,
});
