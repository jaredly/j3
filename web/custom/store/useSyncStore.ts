import { useMemo } from 'react';
import { reduce } from '../../ide/ground-up/reduce';
import { NUIState } from '../UIState';
import { Evt, Store } from './Store';
import { loadEvaluator } from '../../ide/ground-up/loadEv';
import {
    ImmediateResults,
    NodeResults,
    blankInitialResults,
    getImmediateResults,
} from './getImmediateResults';
import { AnyEnv } from './getResults';
import { Message, Sendable, ToPage } from '../worker/worker';
// import Worker from '../worker?worker'

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

export type WorkerResults = {
    nodes: Record<number, Sendable>;
    // probably more stuff? traces maybe?
};

export const setupSyncStore = (
    initialState: NUIState,
    initialResults?: ImmediateResults<any>,
    initialEvaluator?: AnyEnv | null,
): Store => {
    const nodeListeners: {
        [key: string]: ((
            state: NUIState,
            results: NodeResults<any>,
            worker: Sendable | null,
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

    let workerResults: WorkerResults = { nodes: {} };

    if (!initialEvaluator && state.evaluator) {
        console.error(
            `evaluator needs to be provided, if state.evaluator is present`,
        );
    }

    if (!initialResults) {
        getImmediateResults(state, evaluator ?? null, results);
    }

    let inProcess = false;

    const worker = new Worker(new URL('../worker/worker.ts', import.meta.url), {
        type: 'module',
    });
    const send = (msg: Message) => worker.postMessage(msg);
    send({ type: 'initial', nodes: results.nodes, evaluator: state.evaluator });

    worker.addEventListener('message', (evt) => {
        const msg: ToPage = evt.data;
        switch (msg.type) {
            case 'results': {
                console.log('got worker response', msg.results);
                Object.assign(workerResults.nodes, msg.results);
                Object.keys(msg.results).forEach((key) => {
                    nodeListeners[`ns:${key}`]?.forEach((f) =>
                        f(state, results.nodes[+key], msg.results[+key]),
                    );
                });
            }
        }
    });

    return {
        setDebug(execOrder, disableEvaluation) {
            // throw new Error(`todo`);
            console.error('ignoring sotry');
        },
        async dispatch(action) {
            if (inProcess) return alert(`Dispatch not finished`);
            // console.time('dispatch');
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

            if (state.evaluator !== lastState.evaluator) {
                send({
                    type: 'initial',
                    nodes: results.nodes,
                    evaluator: state.evaluator,
                });
            } else {
                const nodes: Record<number, NodeResults<any>> = {};
                Object.entries(results.changes).forEach(([key, changes]) => {
                    if (changes.meta || changes.parsed || changes.plugin) {
                        nodes[+key] = results.nodes[+key];
                    }
                });
                send({ type: 'update', nodes });
            }

            // copyToOldResults(oldResults, results);

            const nsChanged = calcNSChanged(results, state, lastState);
            // console.log('ns changed', nsChanged);
            Object.keys(nsChanged).forEach((key) => {
                nodeListeners[`ns:${key}`]?.forEach((f) =>
                    f(state, results.nodes[+key], workerResults.nodes[+key]),
                );
            });
            // console.log(
            //     'node list',
            //     Object.keys(nodeListeners).filter((n) => n.startsWith('ns:')),
            // );

            Object.keys(nodeChanges).forEach((id) => {
                nodeListeners[id]?.forEach((f) =>
                    f(
                        state,
                        results.nodes[nodeChanges[+id]],
                        workerResults.nodes[nodeChanges[+id]],
                    ),
                );
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
            // console.timeEnd('dispatch');
        },

        getEvaluator: () => evaluator,
        getState: () => state,
        getResults: () => results,
        // getCache: () => cache,
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

function calcNSChanged(
    results: ImmediateResults<any>,
    state: NUIState,
    lastState: NUIState,
) {
    const nsChanged: Record<number, true> = {};
    Object.entries(results.changes).forEach(([key, changes]) => {
        if (changes.source || changes.parsed) {
            nsChanged[+key] = true;
        }
    });
    if (state.nsMap !== lastState.nsMap) {
        Object.keys(state.nsMap).forEach((key) => {
            if (state.nsMap[+key] !== lastState.nsMap[+key]) {
                // const top = state.nsMap[+key].top;
                nsChanged[+key] = true;
            }
        });
    }
    return nsChanged;
}

// function copyToOldResults(
//     oldResults: NUIResults,
//     results: ImmediateResults<any>,
// ) {
//     oldResults.jumpToName = results.jumpToName.value;
//     oldResults.display = {};
//     oldResults.errors = {};
//     Object.keys(results.nodes).forEach((top) => {
//         const node = results.nodes[+top];
//         Object.assign(oldResults.display, node.layout);
//         if (node.parsed?.type === 'failure') {
//             Object.assign(oldResults.errors, node.parsed.errors);
//         }
//     });
// }
