import { useMemo } from 'react';
import { NUIState } from '../UIState';
import equal from 'fast-deep-equal';
import { reduce } from '../../ide/ground-up/reduce';
import { FullEvalator } from '../../ide/ground-up/Evaluators';
import { ResultsCache, getResults } from './getResults';
import { Store, NUIResults, adaptiveBounce, loadEvaluator, Evt } from './Store';

export const useStore = (initialState: NUIState) => {
    const cache = useMemo<ResultsCache<any>>(
        () => ({
            nodes: {},
            types: {},
            results: {},
            lastState: null,
            lastEvaluator: null,
        }),
        [],
    );

    const store = useMemo<Store>(() => {
        const nodeListeners: {
            [key: string]: ((state: NUIState, results: NUIResults) => void)[];
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
        let evaluator: FullEvalator<any, any, any> | null = null;
        let debugExecOrder = { current: false };

        const updateResults = adaptiveBounce(() => {
            // console.log('updating results');
            results = getResults(
                state,
                evaluator,
                debugExecOrder.current,
                cache,
            );

            evtListeners.results.forEach((f) => f(state));
            evtListeners.all.forEach((f) => f(state));
        });

        loadEvaluator(state.evaluator, (ev, async) => {
            evaluator = ev;
            console.log('loaded new', async);
            if (async) {
                results = getResults(
                    state,
                    evaluator,
                    debugExecOrder.current,
                    cache,
                );

                evtListeners.results.forEach((f) => f(state));
                evtListeners.all.forEach((f) => f(state));
            }
        });

        let results = getResults(
            state,
            evaluator,
            debugExecOrder.current,
            cache,
        );

        return {
            setDebug(nv) {
                debugExecOrder.current = nv;
                updateResults();
            },
            dispatch(action) {
                const a = performance.now();
                let nextState = reduce(state, action);
                const b = performance.now();
                if (nextState.evaluator !== state.evaluator) {
                    loadEvaluator(nextState.evaluator, (ev) => {
                        evaluator = ev;
                        results = getResults(
                            state,
                            evaluator,
                            debugExecOrder.current,
                            cache,
                        );

                        evtListeners.results.forEach((f) => f(state));
                        evtListeners.all.forEach((f) => f(state));
                    });
                }
                let nextResults = results;
                const c = performance.now();

                let prevState = state;
                let prevResults = results;
                state = nextState;
                results = nextResults;

                if (
                    prevState.map !== state.map ||
                    prevState.meta !== state.meta
                ) {
                    updateResults();
                }

                // Send out the infos
                // TODO: This is still a somewhat good idea, but I'll want to
                // ... have the ability to subscribe to ... just selection changes?
                // eh maybe not. it's fine.
                //
                // const selChange: { [key: number]: boolean } = {};
                // if (state.at !== prevState.at) {
                //     prevState.at.forEach((cursor) => {
                //         cursor.start.forEach(
                //             (item) => (selChange[item.idx] = true),
                //         );
                //         cursor.end?.forEach(
                //             (item) => (selChange[item.idx] = true),
                //         );
                //         if (cursor.end) {
                //             const [start, end] = orderStartAndEnd(
                //                 cursor.start,
                //                 cursor.end,
                //             );
                //             allNodesBetween(start, end, prevState).forEach(
                //                 (idx) => (selChange[idx] = true),
                //             );
                //         }
                //     });
                //     state.at.forEach((cursor) => {
                //         cursor.start.forEach(
                //             (item) => (selChange[item.idx] = true),
                //         );
                //         cursor.end?.forEach(
                //             (item) => (selChange[item.idx] = true),
                //         );
                //         if (cursor.end) {
                //             const [start, end] = orderStartAndEnd(
                //                 cursor.start,
                //                 cursor.end,
                //             );
                //             allNodesBetween(start, end, state).forEach(
                //                 (idx) => (selChange[idx] = true),
                //             );
                //         }
                //     });
                //     // WE NEED
                //     // TO
                //     // ...
                //     // .....
                //     // `allNodesBetween(path[], path[], nsMap[], map)`
                // }
                const d = performance.now();

                Object.keys(nodeListeners).forEach((k) => {
                    const idx = +k;
                    let changed =
                        // selChange[idx] ||
                        state.map[idx] !== prevState.map[idx] ||
                        state.meta[idx] !== prevState.meta[idx] ||
                        !equal(results.errors[idx], prevResults.errors[idx]) ||
                        !equal(results.display[idx], prevResults.display[idx]);
                    if (changed) {
                        nodeListeners[idx].forEach((fn) => fn(state, results));
                    }
                });

                const e = performance.now();

                // prevState = state;
                // prevResults = results;
                // everyListeners.forEach((f) => f(state));

                evtListeners.all.forEach((f) => f(state));
                if (state.at !== prevState.at) {
                    evtListeners.selection.forEach((f) => f(state));
                }
                if (state.map !== prevState.map) {
                    evtListeners.map.forEach((f) => f(state));
                }
                if (state.nsMap !== prevState.nsMap) {
                    evtListeners.nsMap.forEach((f) => f(state));
                }
                if (state.hover !== prevState.hover) {
                    evtListeners.hover.forEach((f) => f(state));
                }

                const f = performance.now();
                // console.log(
                //     `Reduce ${b - a}\nResults ${c - b}\nSelection calc ${
                //         d - c
                //     }\nListeners ${e - d}\nEverylisteners ${f - e}`,
                // );
            },
            getEvaluator: () => evaluator,
            getState: () => state,
            getResults: () => results,
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
    }, []);

    return store;
};
