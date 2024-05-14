import { useMemo } from 'react';
import { reduce } from '../../ide/ground-up/reduce';
import { Action, NUIState } from '../UIState';
import { Evt, Store } from './Store';
import { TraceMap, loadEvaluator } from '../../ide/ground-up/loadEv';
import {
    ImmediateResults,
    NodeResults,
    blankInitialResults,
    getImmediateResults,
} from './getImmediateResults';
import { AnyEnv } from './getResults';
import { Message, Sendable, ToPage } from '../worker/worker';
import { calcChangedNodes } from './calcChangedNodes';
import { collectPaths, pathForIdx } from '../../ide/ground-up/pathForIdx';
import equal from 'fast-deep-equal';
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
    traces: TraceMap;
    usages: Record<number, number[]>;
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
            unused: boolean,
        ) => void)[];
    } = {};

    const evtListeners: Record<
        Evt,
        ((state: NUIState, extra?: any) => void)[]
    > = {
        all: [],
        hover: [],
        map: [],
        nsMap: [],
        results: [],
        selection: [],
        pending: [],
        parse: [],
    };

    let state = initialState;
    const results = initialResults
        ? { ...initialResults, lastState: initialState }
        : blankInitialResults();
    let evaluator = initialEvaluator ?? null;

    let workerResults: WorkerResults = { nodes: {}, traces: {}, usages: {} };

    if (!initialEvaluator && state.evaluator) {
        console.error(
            `evaluator needs to be provided, if state.evaluator is present`,
        );
    }

    if (!initialResults) {
        console.time('Initial results');
        getImmediateResults(state, evaluator ?? null, results);
        console.timeEnd('Initial results');
    }

    let msgid = 0;
    let inProcess = false;

    const worker = new Worker(new URL('../worker/worker.ts', import.meta.url), {
        type: 'module',
    });

    let pending: number[] = [];
    const send = (msg: Message) => {
        pending.push(msg.id);
        // console.log('->> pending', pending.length);
        evtListeners.pending.forEach((f) => f(state, pending.length));
        worker.postMessage(msg);
    };
    send({
        type: 'initial',
        nodes: results.nodes,
        evaluator: state.evaluator,
        id: msgid++,
    });

    worker.addEventListener('message', (evt) => {
        const msg: ToPage = evt.data;
        // console.log(`got back`, pending, msg);
        pending = pending.filter((p) => p > msg.id);
        evtListeners.pending.forEach((f) => f(state, pending.length));
        switch (msg.type) {
            case 'results': {
                const changedNodes = calcChangedNodes(
                    workerResults.nodes,
                    msg.results,
                    workerResults.usages,
                );

                Object.assign(workerResults.nodes, msg.results);
                Object.assign(workerResults.traces, msg.traces);

                Object.keys(workerResults.nodes).forEach((k) => {
                    if (!results.nodes[+k] || !results.nodes[+k].parsed) {
                        console.log(`Node doesnt exist anymore`, k);
                        delete workerResults.nodes[+k];
                        changedNodes[+k] = true;
                        nodeListeners[`ns:${k}`]?.forEach((f) =>
                            f(state, results.nodes[+k], null, false),
                        );
                    }
                });

                Object.keys(msg.results).forEach((key) => {
                    nodeListeners[`ns:${key}`]?.forEach((f) =>
                        f(state, results.nodes[+key], msg.results[+key], false),
                    );
                });

                Object.keys(changedNodes).forEach((id) =>
                    nodeListeners[id]?.forEach((f) =>
                        f(
                            state,
                            results.nodes[results.topForLoc[+id]],
                            msg.results[results.topForLoc[+id]],
                            workerResults.usages[+id]?.length === 0,
                        ),
                    ),
                );
                evtListeners.results.forEach((f) => f(state));

                store.dispatch({ type: 'highlight' });
            }
        }
    });

    const store: Store = {
        setDebug(execOrder, disableEvaluation, showJs) {
            // throw new Error(`todo`);
            // console.error('ignoring sotry');
            send({ type: 'debug', execOrder, id: msgid++, showJs });
        },
        dispatch(action) {
            if (action.type === 'jump-to-definition') {
                const changed = getJumpToAction(
                    action.idx,
                    state,
                    results,
                    workerResults,
                );
                if (changed) {
                    action = changed;
                }
            }
            // if (inProcess) {
            //     // debugger;
            //     console.error(`trying to dispatch`, action);
            //     console.log('but we are in progress');
            //     return;
            //     // return alert(`Dispatch not finished`);
            // }
            // console.time('dispatch');
            // inProcess = true;
            const lastState = state;
            // console.time('reduce');
            state = reduce(state, action, workerResults.usages);
            // console.timeEnd('reduce');

            if (state.evaluator !== lastState.evaluator) {
                // let ev = await new Promise<AnyEnv | null>((res) =>
                //     loadEvaluator(state.evaluator, res),
                // );
                // evaluator = ev;
                // um idk
                try {
                    loadEvaluator(state.evaluator, (ev) => {
                        evaluator = ev;
                    });
                } catch (err) {
                    console.error('failed to load evaluator');
                    console.error(err);
                }
            }

            // console.time('get results');
            const nodeChanges = getImmediateResults(state, evaluator, results);
            // console.log('changes', nodeChanges);
            // console.timeEnd('get results');

            if (state.evaluator !== lastState.evaluator) {
                send({
                    type: 'initial',
                    nodes: results.nodes,
                    evaluator: state.evaluator,
                    id: msgid++,
                });
            } else {
                let changed = false;
                const nodes: Record<number, NodeResults<any>> = {};
                Object.entries(results.changes).forEach(([key, changes]) => {
                    if (
                        changes.meta ||
                        changes.parsed ||
                        changes.plugin ||
                        changes.display
                    ) {
                        changed = true;
                        nodes[+key] = results.nodes[+key];
                    }
                });
                if (changed) {
                    send({ type: 'update', nodes, id: msgid++ });
                    evtListeners.parse.forEach((f) => f(state, results));
                }
            }

            // copyToOldResults(oldResults, results);

            const nsChanged = calcNSChanged(results, state, lastState);
            // console.log('ns changed', nsChanged);
            Object.keys(nsChanged).forEach((key) => {
                nodeListeners[`ns:${key}`]?.forEach((f) =>
                    f(
                        state,
                        results.nodes[+key],
                        workerResults.nodes[+key],
                        false,
                    ),
                );
            });
            // console.log(
            //     'node list',
            //     Object.keys(nodeListeners).filter((n) => n.startsWith('ns:')),
            // );

            // --- updating ... usage ... hovers ---
            if (state.highlight != lastState.highlight) {
                const topForLoc: Record<number, number> = {};
                Object.values(results.nodes).forEach((node) => {
                    node.ids.forEach((id) => (topForLoc[id] = node.ns.id));
                });

                lastState.highlight?.forEach(
                    (k) => (nodeChanges[k] = topForLoc[k]),
                );
                state.highlight?.forEach(
                    (k) => (nodeChanges[k] = topForLoc[k]),
                );
            }

            if (
                state.trackChanges &&
                state.trackChanges !== lastState.trackChanges
            ) {
                Object.keys(state.trackChanges.previous).forEach((k) => {
                    if (
                        state.trackChanges!.previous[+k] !==
                        lastState.trackChanges?.previous[+k]
                    ) {
                        nodeChanges[+k] = results.topForLoc[+k];
                    }
                });
                if (lastState.trackChanges?.previous) {
                    Object.keys(lastState.trackChanges.previous).forEach(
                        (k) => {
                            if (!(k in state.trackChanges!.previous)) {
                                nodeChanges[+k] = results.topForLoc[+k];
                            }
                        },
                    );
                }
            }

            Object.keys(nodeChanges).forEach((id) => {
                nodeListeners[id]?.forEach((f) =>
                    f(
                        state,
                        results.nodes[nodeChanges[+id]],
                        workerResults.nodes[nodeChanges[+id]],
                        workerResults.usages[+id]?.length === 0,
                    ),
                );
            });

            evtListeners.all.forEach((f) => f(state));
            if (!equal(state.at, lastState.at)) {
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

            // inProcess = false;
            // console.timeEnd('dispatch');
        },

        getEvaluator: () => evaluator,
        getState: () => state,
        getResults: () => ({ results, workerResults }),
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
    return store;
};

const getJumpToAction = (
    idx: number,
    state: NUIState,
    results: ImmediateResults<any>,
    workerResults: WorkerResults,
): Action | void => {
    for (let [prov, usages] of Object.entries(workerResults.usages)) {
        if (!usages.includes(idx)) {
            continue;
        }
        if (+prov === idx) return;
        const paths = collectPaths(state)(+prov);
        // const path = pathForIdx(+prov, state);
        if (paths.length) {
            console.log('jumping to', prov);
            return { type: 'select', at: [{ start: paths[0] }] };
        } else {
            console.warn(`Cant find a path for ${prov}`);
            return;
        }
    }

    const node = state.map[idx];
    if (node.type === 'identifier') {
        const name = node.text;
        const found = results.jumpToName.value[name];
        if (!found) {
            console.warn(`Cant find a definition for ${name}`);
            return;
        }
        const paths = collectPaths(state)(found);
        // const path = pathForIdx(found, state);
        if (paths.length) {
            return { type: 'select', at: [{ start: paths[0] }] };
        } else {
            console.warn(`Cant find a path for ${found}`);
            return;
        }
    } else {
        console.warn(`Not an identifier`);
        return;
    }
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
