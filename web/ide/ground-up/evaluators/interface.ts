import { Node } from '../../../../src/types/cst';
import { MetaDataMap } from '../../../custom/UIState';
import { LocedName } from '../../../custom/store/sortTops';
import { InferenceError } from '../FullEvalator';
import { TypeInfo } from './analyze';

export type Parser<Stmt, Expr, SimpleNode> = {
    toNode(node: SimpleNode): Node;
    fromNode(simple: Node): SimpleNode;
    parse(node: Node): { stmt: null | Stmt; errors: [number, string][] };
    parseExpr(node: Node): { expr: null | Expr; errors: [number, string][] };
};

export type AllNames = {
    global: {
        declarations: LocedName[];
        usages: LocedName[];
    };
    local: {
        declarations: number[];
        usages: {
            loc: number;
            decl: number;
        }[];
    };
};

export type Analyze<Stmt, Expr, Type> = {
    allNames(stmt: Stmt): AllNames;
    allNamesExpr(expr: Expr): AllNames;
    // names(stmt: Stmt): LocedName[];
    // externalsStmt(stmt: Stmt): LocedName[];
    // externalsExpr(expr: Expr): LocedName[];
    stmtSize(stmt: Stmt): number | null;
    exprSize(expr: Expr): number | null;
    typeSize(type: Type): number | null;
    localsAt?(loc: number, stmt: Stmt): [string, number][];
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
        codeGenData?: any;
    };
    inferExpr(
        expr: Expr,
        env: Env,
    ): {
        typesAndLocs: { loc: number; type: Type }[];
        usages: Record<number, number[]>;
        codeGenData?: any;
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
    envToString?(env: Env): string;
} & Infer<Env, Stmt, Expr, Type>;

export type Compiler<Stmt, Expr> = {
    prelude?: Record<string, string>;
    builtins?: string;
    compileStmt(stmt: Stmt, codeGenData: TypeInfo, meta: MetaDataMap): string;
    compileExpr(expr: Expr, codeGenData: TypeInfo, meta: MetaDataMap): string;
};
