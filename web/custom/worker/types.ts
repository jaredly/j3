import { Node } from '../../../src/types/cst';
import { ProduceItem } from '../../ide/ground-up/FullEvalator';
import { AllNames } from '../../ide/ground-up/evaluators/interface';
import { TraceMap } from '../../ide/ground-up/loadEv';
import { jcst } from '../../ide/ground-up/round-1/j-cst';
import { ImmediateResults } from '../store/getImmediateResults';
import { AnyEnv } from '../store/getResults';
import { LocedName } from '../store/sortTops';

type Tenv = { _type: 'tenv' };
type Env = { values: { [key: string]: any } };

export type Sortable = {
    id: number;
    // names: LocedName[]; deps: LocedName[];
    allNames?: AllNames;
    isPlugin: boolean;
};

/**
 * Ok what can I send back over the pipe?
 * What do I *need* to send?
 * - produce
 * - errors
 * - hover
 * - pluginResults? ... I mean yes ... will cross that bridge in a bit.
 */

export type HoverContents =
    | { type: 'type'; node: Node }
    | { type: 'change'; node: Node | null; parent?: 'let' }
    | { type: 'text'; text: string }; // | {type: 'error'};

export type AsyncResults = {
    tops: Record<
        number,
        {
            produce: ProduceItem[];
            changes: {
                type?: boolean;
                value?: boolean;
                results?: boolean;
                source?: boolean;
            };
            errors: Record<number, string[]>;
            hover: Record<number, HoverContents[]>;
            pluginResults?: any;
            values: Record<string, any>;
            usages: Record<number, number[]>;
        }
    >;

    // We cache the sort order. If a node comes in w/ different
    // names or deps, we re-sort (?). Well, maybe we could
    // first "check" to see if it's sorted correctly. And if not,
    // we re-shuffle everything.
    sorted: Sortable[][];

    groups: Record<
        string,
        {
            changed: boolean;
            tops: number[];
            tenv: Tenv | null;
            codeGenData?: any;
            traces: TraceMap;
            typeFailed: boolean;
        }
    >;
};

export type State = {
    evaluator: AnyEnv | null;
    nodes: ImmediateResults<any>['nodes'];
    results?: AsyncResults;
    debugExecOrder?: boolean;
    debugShowJs?: boolean;
    traceFn?: (loc: number, info: any, value: any) => any;
};
