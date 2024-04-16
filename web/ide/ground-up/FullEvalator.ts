import { Node } from '../../../src/types/cst';
import { MetaDataMap, NUIState } from '../../custom/UIState';
import { TraceMap } from './loadEv';
import { LocedName } from '../../custom/store/sortTops';
import { LocError, MyEvalError } from './Evaluators';

export type Errors = { [key: number]: string[] };
export type ProduceItem = JSX.Element | string | LocError | MyEvalError | Error;
export type Produce = ProduceItem | ProduceItem[];

export type AnyEnv = FullEvalator<any, any, any>;
export type FullEvalator<
    Env extends { values: { [key: string]: any } },
    Stmt,
    Expr,
    TypeEnv = any,
    Type = any,
> = {
    id: string;
    init(): Env;
    parse(node: Node, errors: Errors): Stmt | void;
    parseExpr(node: Node, errors: Errors): Expr | void;

    // Type checker stuff
    inference?: {
        initType(): TypeEnv;
        infer(
            stmts: Stmt[],
            env: TypeEnv,
        ): {
            result:
                | { type: 'ok'; value: TypeEnv }
                | {
                      type: 'err';
                      err: {
                          message: string;
                          items: { name: string; loc: number }[];
                      };
                  };
            typesAndLocs: { type: Type; loc: number }[];
        };
        inferExpr(expr: Expr, env: TypeEnv): Type;
        addTypes(env: TypeEnv, nenv: TypeEnv): TypeEnv;
        typeForName(env: TypeEnv, name: string): Type;
        typeToString(type: Type): string;
    };

    analysis?: {
        dependencies(stmt: Stmt): LocedName[];
        stmtNames(stmt: Stmt): LocedName[];
        exprDependencies(stmt: Expr): LocedName[];
    };

    addStatements(
        stmts: { [key: number]: Stmt },
        env: Env,
        // tenv: TypeEnv,
        meta: MetaDataMap,
        trace: TraceMap,
        renderResult?: (v: any) => ProduceItem[],
    ): {
        env: Env;
        display: { [key: number]: Produce };
        values: { [name: string]: any };
        js?: string;
    };
    setTracing(idx: number | null, traceMap: TraceMap, env: Env): void;
    evaluate(expr: Expr, env: Env, meta: MetaDataMap): any;
    toFile(state: NUIState, target?: number): { js: string; errors: Errors };
};
