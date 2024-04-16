import { ProduceItem } from '../../ide/ground-up/FullEvalator';
import { TraceMap } from '../../ide/ground-up/loadEv';
import { ImmediateResults } from '../store/getImmediateResults';
import { AnyEnv } from '../store/getResults';
import { LocedName } from '../store/sortTops';

type Tenv = { _type: 'tenv' };
type Env = { values: { [key: string]: any } };

export type Sortable = {
    id: number;
    names: LocedName[];
    deps: LocedName[];
    isPlugin: boolean;
};

export type AsyncResults = {
    tops: Record<
        number,
        {
            produce: ProduceItem[];
            changes: { type?: boolean; value?: boolean; results?: boolean };
            errors: Record<number, string[]>;
            hover: Record<number, string[]>;
            pluginResults?: any;
            values: Record<string, any>;
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
            tops: number[];
            tenv: Tenv | null;
            traces: TraceMap;
        }
    >;
};

export type State = {
    evaluator: AnyEnv | null;
    nodes: ImmediateResults<any>['nodes'];
    results?: AsyncResults;
};
