import { useMemo } from 'react';
import { NUIState } from '../UIState';
import equal from 'fast-deep-equal';
import { reduce } from '../../ide/ground-up/reduce';
import { FullEvalator } from '../../ide/ground-up/Evaluators';
import { AnyEnv, emptyResults, getResults } from './getResults';
import { ResultsCache } from './ResultsCache';
import { Store, NUIResults, adaptiveBounce, loadEvaluator, Evt } from './Store';
import {
    ImmediateResults,
    blankInitialResults,
    getImmediateResults,
} from './getImmediateResults';

export const useSyncStore = (
    initialState: NUIState,
    initialCache?: ImmediateResults<any>,
    initialEvaluator?: AnyEnv | null,
) => {
    const store = useMemo<Store>(
        () => setupSyncStore(initialState, initialCache, initialEvaluator),
        [],
    );
    return store;
};

export const setupSyncStore = (
    initialState: NUIState,
    initialResults?: ImmediateResults<any>,
    initialEvaluator?: AnyEnv | null,
): Store => {
    const nodeListeners: {
        [key: string]: ((
            state: NUIState,
            // results: ImmediateResults<any>['nodes'][0],
            results: NUIResults,
        ) => void)[];
    } = {};

    const evtListeners: Record<Evt, ((state: NUIState) => void)[]> = {
        all: [],
        hover: [],
        map: [],
        nsMap: [],
        results: [],
        selection: [],
    };

    let state = initialState;
    const results = initialResults
        ? { ...initialResults, lastState: initialState }
        : blankInitialResults();
    let evaluator = initialEvaluator ?? null;

    if (!initialEvaluator && state.evaluator) {
        throw new Error(
            `evaluator needs to be provided, if state.evaluator is present`,
        );
    }

    if (!initialResults) {
        getImmediateResults(state, evaluator ?? null, results);
    }

    let inProcess = false;

    const oldResults = emptyResults();
    copyToOldResults(oldResults, results);
    const cache: ResultsCache<any> = {
        run: 0,
        hover: {},
        nodes: {},
        types: {},
        results: {},
        lastState: null,
        lastEvaluator: null,
        settings: { debugExecOrder: false },
    };

    return {
        setDebug(execOrder, disableEvaluation) {
            // throw new Error(`todo`);
            console.error('ignoring sotry');
        },
        async dispatch(action) {
            if (inProcess) return alert(`Dispatch not finished`);
            inProcess = true;
            const lastState = state;
            state = reduce(state, action);

            if (state.evaluator !== lastState.evaluator) {
                let ev = await new Promise<AnyEnv | null>((res) =>
                    loadEvaluator(state.evaluator, res),
                );
                evaluator = ev;
            }

            const nodeChanges = getImmediateResults(state, evaluator, results);

            copyToOldResults(oldResults, results);

            Object.keys(nodeChanges).forEach((id) => {
                console.log('node change', id);
                nodeListeners[id]?.forEach((f) => f(state, oldResults));
                // nodeListeners[id].forEach((f) =>
                //     f(state, results.nodes[nodeChanges[+id]]),
                // );
            });

            evtListeners.all.forEach((f) => f(state));
            if (state.at !== lastState.at) {
                evtListeners.selection.forEach((f) => f(state));
            }
            if (state.map !== lastState.map) {
                evtListeners.map.forEach((f) => f(state));
            }
            if (state.nsMap !== lastState.nsMap) {
                evtListeners.nsMap.forEach((f) => f(state));
            }
            if (state.hover !== lastState.hover) {
                evtListeners.hover.forEach((f) => f(state));
            }

            inProcess = false;
        },

        getEvaluator: () => evaluator,
        getState: () => state,
        getResults: () => oldResults,
        getCache: () => cache,
        reg(node, idx, path, loc) {
            if (!state.regs[idx]) {
                state.regs[idx] = {};
            }
            state.regs[idx][loc ?? 'main'] = node ? { node, path } : null;
        },

        onChange(idx, fn) {
            if (!nodeListeners[idx]) {
                nodeListeners[idx] = [];
            }
            nodeListeners[idx].push(fn);
            return () => {
                const at = nodeListeners[idx].indexOf(fn);
                if (at !== -1) {
                    nodeListeners[idx].splice(at, 1);
                }
            };
        },
        on(evt, fn) {
            evtListeners[evt].push(fn);
            return () => {
                const idx = evtListeners[evt].indexOf(fn);
                if (idx !== -1) {
                    evtListeners[evt].splice(idx, 1);
                }
            };
        },
    };
};

function copyToOldResults(
    oldResults: NUIResults,
    results: ImmediateResults<any>,
) {
    oldResults.jumpToName = results.jumpToName.value;
    oldResults.display = {};
    oldResults.errors = {};
    Object.keys(results.nodes).forEach((top) => {
        const node = results.nodes[+top];
        Object.assign(oldResults.display, node.layout);
        if (node.parsed?.type === 'failure') {
            Object.assign(oldResults.errors, node.parsed.errors);
        }
    });
}
