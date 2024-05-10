import { Node } from '../../../src/types/cst';
import { MetaDataMap, NUIState } from '../../custom/UIState';
import { TraceMap } from './loadEv';
import { LocedName } from '../../custom/store/sortTops';
import { LocError, MyEvalError } from './Evaluators';
import { Analyze, TypeChecker } from './evaluators/interface';

export type Errors = { [key: number]: string[] };

export type ProduceItem =
    | string
    | { type: 'node'; node: Node }
    | { type: 'inference-error'; err: InferenceError }
    | { type: 'type'; text: string; cst?: Node; name?: string }
    | { type: 'withjs'; message: string; js: string; stack?: string }
    | { type: 'eval'; message: string; inner: string; stack?: string }
    | { type: 'error'; message: string; stack?: string }
    | { type: 'pre'; text: string };
export type Produce = ProduceItem | ProduceItem[];

export type AnyEnv = FullEvalator<any, any, any>;

export type InferenceError =
    | {
          type: 'with-items';
          message: string;
          items: { name: string; loc: number }[];
      }
    | {
          type: 'missing';
          missing: { name: string; loc: number; type: Node }[];
      }
    | {
          type: 'nested';
          outer: InferenceError;
          inner: InferenceError;
      }
    | {
          type: 'types';
          one: Node;
          two: Node;
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
    parse(node: Node): { stmt: Stmt | null; errors: [number, string][] };
    parseExpr(node: Node): { expr: Expr | null; errors: [number, string][] };
    valueToString(v: any): string;
    valueToNode(v: any): Node | null;

    // Type checker stuff
    inference?: TypeChecker<TypeEnv, Stmt, Expr, Type>;
    analysis?: Analyze<Stmt, Expr, Type>;

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
    toFile(
        state: NUIState,
        target?: number,
    ): {
        js: string;
        // errors: Errors
    };
};
