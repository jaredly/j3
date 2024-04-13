import { NUIState, RealizedNamespace } from '../UIState';
import { Errors, ProduceItem } from '../../ide/ground-up/Evaluators';
import { NUIResults } from './Store';
import { LocedName } from './sortTops';
import { Node } from '../../../src/types/cst';
import { AnyEnv } from './getResults';

export type ResultsCache<Stmt> = {
    run: number;
    lastEvaluator: string | null;
    lastState: null | NUIState;
    settings: { debugExecOrder: boolean };
    hover: { [top: string]: { [loc: number]: string[] } };
    // the result of `fromMCST`
    // and the IDs of all included nodes. We can do a quick
    // check of each of the `ids` to see if we need to recalculate
    nodes: {
        [top: number]: {
            ns: RealizedNamespace;
            node: Node;
            ids: number[];
            parsed: void | {
                stmt: Stmt;
            };
            parseErrors: Errors | null;
            display: NUIResults['display'];
        };
    };
    deps?: {
        [top: number]: {
            names: LocedName[];
            deps: LocedName[];
            duplicate?: boolean;
        };
    };

    types: {
        [group: string]: {
            tops: number[];
            env: any;
            types: any[];
            ts: number;
            // TODO represent error condition?
            error?: Error;
        };
    };

    results: {
        [top: number]: {
            pluginResult?: any;
            // the things to display
            produce: ProduceItem[];
            // any exportable values
            values: { [name: string]: any };
            ts: number;
        };
    };
};

export type DepsOrNoDeps =
    | {
          type: 'nodeps';
          id: number;
          names?: null;
          deps?: null;
      }
    | {
          type: 'deps';
          id: number;
          names: LocedName[];
          deps: LocedName[];
      };

export type ChangesMap = {
    [top: number]: {
        ns?: boolean;
        source?: boolean;
        stmt?: boolean;
        type?: boolean;
        value?: boolean;
    };
};
