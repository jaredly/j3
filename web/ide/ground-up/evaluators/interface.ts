import { Node } from '../../../../src/types/cst';
import { MetaDataMap } from '../../../custom/UIState';
import { LocedName } from '../../../custom/store/sortTops';
import { InferenceError } from '../FullEvalator';

export type Parser<Stmt, Expr> = {
    parse(node: Node): { stmt: null | Stmt; errors: [number, string][] };
    parseExpr(node: Node): { expr: null | Expr; errors: [number, string][] };
};

export type Analyze<Stmt, Expr, Type> = {
    names(stmt: Stmt): LocedName[];
    externalsStmt(stmt: Stmt): LocedName[];
    externalsExpr(expr: Expr): LocedName[];
    stmtSize(stmt: Stmt): number | null;
    exprSize(expr: Expr): number | null;
    typeSize(type: Type): number | null;
};

export type Infer<Env, Stmt, Expr, Type> = {
    infer(
        stmts: Stmt[],
        env: Env,
    ): {
        result:
            | { type: 'err'; err: InferenceError }
            | { type: 'ok'; value: { env: Env; types: Type[] } };
        typesAndLocs: { loc: number; type: Type }[];
        usages: Record<number, number[]>;
    };
    inferExpr(
        expr: Expr,
        env: Env,
    ): {
        typesAndLocs: { loc: number; type: Type }[];
        usages: Record<number, number[]>;
        result:
            | { type: 'err'; err: InferenceError }
            | { type: 'ok'; value: Type };
    };
};

export type TypeChecker<Env, Stmt, Expr, Type> = {
    init(): Env;
    addTypes(env: Env, nenv: Env): Env;
    typeForName(env: Env, name: string): Type | null;
    typeToString(type: Type): string;
    typeToCst?(type: Type): Node;
} & Infer<Env, Stmt, Expr, Type>;

export type Compiler<Stmt, Expr> = {
    compileStmt(stmt: Stmt, meta: MetaDataMap): string;
    compileExpr(expr: Expr, meta: MetaDataMap): string;
};
