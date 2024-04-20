import { Node } from '../../../src/types/cst';
import { MetaDataMap, NUIState } from '../../custom/UIState';
import { TraceMap } from './loadEv';
import { LocedName } from '../../custom/store/sortTops';
import { LocError, MyEvalError } from './Evaluators';

export type Errors = { [key: number]: string[] };

export type ProduceItem =
    | string
    | { type: 'type'; text: string }
    | { type: 'withjs'; message: string; js: string; stack?: string }
    | { type: 'eval'; message: string; inner: string; stack?: string }
    | { type: 'error'; message: string; stack?: string }
    | { type: 'pre'; text: string };
export type Produce = ProduceItem | ProduceItem[];

export type AnyEnv = FullEvalator<any, any, any>;

export type InferenceError = {
    message: string;
    items: {
        name: string;
        loc: number;
    }[];
};

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
                | { type: 'ok'; value: { env: TypeEnv; types: Type[] } }
                | { type: 'err'; err: InferenceError };
            typesAndLocs: { type: Type; loc: number }[];
            usages: { [loc: number]: number[] };
        };
        inferExpr(
            expr: Expr,
            env: TypeEnv,
        ): {
            result:
                | { type: 'ok'; value: Type }
                | { type: 'err'; err: InferenceError };
            typesAndLocs: { type: Type; loc: number }[];
            usages: { [loc: number]: number[] };
        };
        addTypes(env: TypeEnv, nenv: TypeEnv): TypeEnv;
        typeForName(env: TypeEnv, name: string): Type;
        typeToString(type: Type): string;
    };

    analysis?: {
        dependencies(stmt: Stmt): LocedName[];
        stmtNames(stmt: Stmt): LocedName[];
        exprDependencies(stmt: Expr): LocedName[];
        size(stmt: Stmt): number | null;
    };

    addStatements(
        stmts: { [key: number]: Stmt },
        env: Env,
        // tenv: TypeEnv,
        meta: MetaDataMap,
        trace: TraceMap,
        top: number,
        renderResult?: (v: any) => ProduceItem[],
        debugShowJs?: boolean,
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
