import * as React from 'react';
import { Action, MetaData, NUIState } from '../UIState';
import { Display } from '../../../src/to-ast/library';
import { getNestedNodes } from '../../../src/state/nestedNodes/getNestedNodes';
import { NNode } from '../../../src/state/nestedNodes/NNode';
import { MNode } from '../../../src/types/mcst';
import { Reg } from '../types';
import { CoverageLevel } from '../../../src/state/clipboard';
import { Path } from '../../store';
import { TraceMap } from '../../ide/ground-up/loadEv';
import { FullEvalator, ProduceItem } from '../../ide/ground-up/FullEvalator';
import { goRight } from '../../../src/state/goRightUntil';
import { cmpFullPath } from '../../../src/state/path';
import { ResultsCache } from './ResultsCache';
import {
    ImmediateResults,
    NodeResults,
    blankInitialResults,
    getImmediateResults,
} from './getImmediateResults';
import { Sendable } from '../worker/worker';
import { AsyncResults, WorkerResults } from './useSyncStore';
import { initialState } from '../../ide/ground-up/reduce';
import { emptyResults } from './getResults';

export type NUIResults = {
    jumpToName: { [name: string]: number };
    errors: { [loc: number]: string[] };
    display: Display;
    hashNames: { [loc: string]: string };
    produce: { [key: string]: ProduceItem[] };
    hover: { [loc: number]: string[] };
    env: { values: { [key: string]: any } };
    tenv: any;
    traces: TraceMap;
    pluginResults: { [nsLoc: number]: any };
};

export type Evt =
    | 'selection'
    | 'hover'
    | 'map'
    | 'nsMap'
    | 'all'
    | 'parse'
    | 'results'
    | 'pending';

export type CombinedResults = {
    results: ImmediateResults<any>;
    workerResults: WorkerResults;
};

export type Store = {
    asyncResults: AsyncResults;
    dispatch: React.Dispatch<Action>;
    getState(): NUIState;
    getResults(): CombinedResults;
    // getCache(): ResultsCache<any>;
    getEvaluator(): FullEvalator<any, any, any> | null;
    reg: Reg;
    onChange(
        idx: number | string,
        fn: (
            state: NUIState,
            results: NodeResults<any>,
            worker: Sendable | null,
            unused: boolean,
        ) => void,
    ): () => void;
    // everyChange(fn: (state: NUIState) => void): () => void;
    on(evt: Evt, fn: (state: NUIState, extra?: any) => void): () => void;
    setDebug(
        execOrder: boolean,
        disableEvaluation: boolean,
        showJs: boolean,
    ): void;

    // remote fn calls
    respond: {
        trigger(ns: number, id: number): void;
        ask(ns: number, id: number, value: any): void;
    };
};

export type OldStore = {
    dispatch: React.Dispatch<Action>;
    getState(): NUIState;
    getResults(): NUIResults;
    getCache(): ResultsCache<any>;
    getEvaluator(): FullEvalator<any, any, any> | null;
    reg: Reg;
    onChange(
        idx: number | string,
        fn: (state: NUIState, results: NUIResults) => void,
    ): () => void;
    // everyChange(fn: (state: NUIState) => void): () => void;
    on(evt: Evt, fn: (state: NUIState) => void): () => void;
    setDebug(execOrder: boolean, disableEvaluation: boolean): void;
};

export const allNodesBetween = (
    start: Path[],
    end: Path[],
    state: NUIState,
): number[] => {
    const found: number[] = [start[start.length - 1].idx];

    while (cmpFullPath(start, end, state) < 0) {
        const sel = goRight(start, state.map, state.nsMap, state.cards);
        if (!sel) break;
        found.push(start[start.length - 1].idx);
        start = sel.selection;
    }
    found.push(end[end.length - 1].idx);

    return found;
};

export const adaptiveBounce = (fn: () => void) => {
    let lastRun = Date.now();
    let lastCost = 0;
    // let lastCall = Date.now()
    let tid: Timer | null = null;

    const run = () => {
        tid = null;
        lastRun = Date.now();
        const start = performance.now();
        fn();
        lastCost = performance.now() - start;
        // console.log('last cost', lastCost);
    };

    return () => {
        // const sinceLast = Date.now() - lastCall
        // lastCall = Date.now()
        if (lastCost < 10) {
            return run();
        }
        // We can update, like every 200ms
        if (lastCost < 50) {
            let wait = 200;
            if (tid) return;
            if (Date.now() - lastRun > wait) {
                return run();
            }
            tid = setTimeout(run, Date.now() - lastRun - wait);
            return;
        }
        // Otherwise, wait until a pause
        if (tid) clearTimeout(tid);
        tid = setTimeout(run, 200);
    };
};

const nope = () => {
    console.warn('nope');
    return null;
};

export const noopStore: Store = {
    setDebug() {},
    asyncResults: { triggers: {}, asks: {} },
    dispatch: nope,
    getEvaluator() {
        return null;
    },
    getResults: () => ({
        results: blankInitialResults(),
        workerResults: {
            nodes: {},
            traces: {},
            usages: {},
        },
    }),
    getState: () => initialState(),
    onChange() {
        console.warn('nope');
        return () => {};
    },
    on() {
        console.warn('nope');
        return () => {};
    },
    reg: nope,
    respond: {
        ask(id, value) {},
        trigger(id) {},
    },
};

export type Values = {
    node: MNode;
    nnode: NNode;

    meta: MetaData | null;
    display: Display[0];
    errors?: string[];
    unused: boolean;
    highlight: boolean;
    static?: boolean;

    // If the parent is new, we don't track changes on this one.
    trackChanges?: MNode | null;

    reg: Reg;
    selection?: {
        edge: boolean;
        coverage: CoverageLevel;
    };
    hover?: boolean;
    dispatch?: React.Dispatch<Action>;
};

export const getValues = (
    idx: number,
    pidx: number,
    store: Store,
    state: NUIState,
    results: NodeResults<any>,
    workerResults?: Sendable | null,
    unused = false,
): Values => {
    // if (!results) {
    //     debugger;
    //     throw new Error(`no results`);
    // }
    if (!results || !state.map[idx]) {
        return {
            dispatch() {},
            display: {},
            meta: null,
            highlight: false,
            reg() {},
            node: { type: 'blank', loc: -1 },
            nnode: { type: 'text', text: '' },
            unused,
        };
    }
    const nnode = getNestedNodes(
        state.map[idx],
        state.map,
        undefined,
        results.layout[idx]?.layout,
    );
    const parsed = results.parsed;
    let errors =
        parsed?.type === 'failure'
            ? parsed.errors[idx]
            : parsed?.type === 'success'
            ? parsed.errors.filter((k) => k[0] === idx).map((k) => k[1])
            : undefined;
    const asyncErrors = workerResults?.errors[idx];
    if (asyncErrors) {
        errors = [...(errors ?? []), ...asyncErrors];
    }

    return {
        errors,
        trackChanges:
            state.trackChanges?.previous[pidx] === null
                ? undefined
                : state.trackChanges?.previous[idx],
        highlight: state.highlight?.includes(idx) ?? false,
        dispatch: store.dispatch,
        meta: state.meta?.[idx] ?? null,
        display: results.layout[idx] ?? {},
        node: state.map[idx],
        reg: store.reg,
        unused,
        nnode,
    };
};
