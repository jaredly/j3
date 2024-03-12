import * as React from 'react';
import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { Action, NUIState, UIState } from './UIState';
import { Display } from '../../src/to-ast/library';
import { NNode, getNestedNodes } from '../../src/state/getNestedNodes';
import { Node } from '../../src/types/cst';
import { MNode, Map, fromMCST } from '../../src/types/mcst';
import { Reg } from './types';
import { CoverageLevel } from '../../src/state/clipboard';
import { Path } from '../store';
import { isCoveredBySelection } from './isCoveredBySelection';
import equal from 'fast-deep-equal';
import { useLatest } from './useNSDrag';
import { normalizeSelections, useRegs } from './CardRoot';
import { orderStartAndEnd } from '../../src/parse/parse';
import { debounce, findTops, reduce } from '../ide/ground-up/reduce';
import { Results } from '../ide/ground-up/GroundUp';
import { loadEv } from '../ide/ground-up/loadEv';
import { FullEvalator, bootstrap, repr } from '../ide/ground-up/Evaluators';
import { layout } from '../../src/layout';
import { goRight } from '../../src/state/navigate';
import { cmpFullPath } from '../../src/state/path';

type NUIResults = {
    errors: { [loc: number]: string[] };
    display: Display;
    hashNames: { [loc: string]: string };
    produce: { [key: string]: JSX.Element | string };
    env: any;
};

type Store = {
    dispatch: React.Dispatch<Action>;
    getState(): NUIState;
    getResults(): NUIResults;
    getEvaluator(): FullEvalator<any, any, any> | null;
    reg: Reg;
    onChange(
        idx: number,
        fn: (state: NUIState, results: NUIResults) => void,
    ): () => void;
    everyChange(fn: (state: NUIState) => void): () => void;
};

const allNodesBetween = (
    start: Path[],
    end: Path[],
    state: NUIState,
): number[] => {
    const found: number[] = [start[start.length - 1].idx];

    while (cmpFullPath(start, end) < 0) {
        const sel = goRight(start, state.map, state.nsMap, state.cards);
        if (!sel) break;
        found.push(start[start.length - 1].idx);
        start = sel.selection;
    }

    found.push(end[end.length - 1].idx);

    return found;
};

const getResults = (
    state: NUIState,
    evaluator: FullEvalator<any, any, any> | null,
) => {
    const results: NUIResults = {
        display: {},
        errors: {},
        hashNames: {},
        produce: {},
        env: null,
    };
    // const produce: { [key: string]: JSX.Element | string } = {};
    // if (!evaluator) return results;

    results.env = evaluator?.init();
    findTops(state).forEach(({ top, hidden }) => {
        if (hidden) return;
        // console.log('process top', top);
        const stmt = fromMCST(top, state.map);
        if (stmt.type === 'blank') {
            results.produce[stmt.loc] = ' ';
            return;
        }
        if (evaluator) {
            const errs: Results['errors'] = {};
            const ast = evaluator.parse(stmt, errs);
            Object.assign(results.errors, errs);
            if (ast) {
                const res = evaluator.addStatement(ast, results.env!);
                results.env = res.env;
                results.produce[stmt.loc] = res.display;
                // console.log('good', res.display);
            } else {
                console.log('not parsed');
                results.produce[stmt.loc] =
                    'not parsed ' + JSON.stringify(errs);
            }
        } else {
            results.produce[stmt.loc] = 'No evaluator';
        }

        layout(top, 0, state.map, results.display, results.hashNames, true);
    });

    return results;
};

const loadEvaluator = (
    ev: string | undefined,
    fn: (ev: FullEvalator<any, any, any> | null, async: boolean) => void,
) => {
    switch (ev) {
        case ':bootstrap:':
            return fn(bootstrap, false);
        case ':repr:':
            return fn(repr, false);
        default:
            if (ev?.endsWith('.json')) {
                fn(null, false); // clear it out
                loadEv(ev).then((ev) => fn(ev, true));
            } else {
                fn(null, false);
            }
    }
};

export const useStore = (
    initialState: NUIState,
    // state: NUIState,
    // results: NUIResults,
    // dispatch: React.Dispatch<Action>,
) => {
    // const lstate = useLatest(state);
    // const lresults = useLatest(results);
    // const reg = useRegs(state);

    const store = useMemo<Store>(() => {
        const nodeListeners: {
            [key: string]: ((state: NUIState, results: NUIResults) => void)[];
        } = {};
        const everyListeners: ((state: NUIState) => void)[] = [];
        let state = initialState;
        let evaluator: FullEvalator<any, any, any> | null = null;

        const updateResults = debounce(async () => {
            results = getResults(state, evaluator);
            everyListeners.forEach((f) => f(state));
        }, 200);

        loadEvaluator(state.evaluator, (ev, async) => {
            evaluator = ev;
            if (async) {
                results = getResults(state, evaluator);
                everyListeners.forEach((f) => f(state));
            }
        });

        let results = getResults(state, evaluator);

        return {
            dispatch(action) {
                const a = performance.now();
                let nextState = reduce(state, action);
                const b = performance.now();
                if (nextState.evaluator !== state.evaluator) {
                    loadEvaluator(
                        nextState.evaluator,
                        // TODO: ... if this happens async, we should re-trigger ... the "oneverychange"
                        (ev, async) => {
                            evaluator = ev;
                            if (async) {
                                results = getResults(state, evaluator);
                                everyListeners.forEach((f) => f(state));
                            }
                        },
                    );
                }
                let nextResults = results;
                const c = performance.now();

                let prevState = state;
                let prevResults = results;
                state = nextState;
                results = nextResults;

                if (prevState.map !== state.map) {
                    // nextResults = getResults(nextState, evaluator);
                    updateResults(0);
                }

                // Send out the infos

                const selChange: { [key: number]: boolean } = {};
                if (state.at !== prevState.at) {
                    prevState.at.forEach((cursor) => {
                        cursor.start.forEach(
                            (item) => (selChange[item.idx] = true),
                        );
                        cursor.end?.forEach(
                            (item) => (selChange[item.idx] = true),
                        );

                        if (cursor.end) {
                            const [start, end] = orderStartAndEnd(
                                cursor.start,
                                cursor.end,
                            );
                            allNodesBetween(start, end, prevState).forEach(
                                (idx) => (selChange[idx] = true),
                            );
                        }
                    });
                    state.at.forEach((cursor) => {
                        cursor.start.forEach(
                            (item) => (selChange[item.idx] = true),
                        );
                        cursor.end?.forEach(
                            (item) => (selChange[item.idx] = true),
                        );

                        if (cursor.end) {
                            const [start, end] = orderStartAndEnd(
                                cursor.start,
                                cursor.end,
                            );
                            allNodesBetween(start, end, state).forEach(
                                (idx) => (selChange[idx] = true),
                            );
                        }
                    });

                    // WE NEED
                    // TO
                    // ...
                    // .....

                    // `allNodesBetween(path[], path[], nsMap[], map)`
                }
                const d = performance.now();

                Object.keys(nodeListeners).forEach((k) => {
                    const idx = +k;
                    let changed =
                        selChange[idx] ||
                        state.map[idx] !== prevState.map[idx] ||
                        !equal(results.errors[idx], prevResults.errors[idx]) ||
                        !equal(results.display[idx], prevResults.display[idx]);
                    if (changed) {
                        nodeListeners[idx].forEach((fn) => fn(state, results));
                    }
                });

                const e = performance.now();

                // prevState = state;
                // prevResults = results;

                everyListeners.forEach((f) => f(state));
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
            everyChange(fn) {
                everyListeners.push(fn);
                return () => {
                    const idx = everyListeners.indexOf(fn);
                    if (idx !== -1) {
                        everyListeners.splice(idx, 1);
                    }
                };
            },
        };
    }, []);

    // const prevState = useRef(state);
    // const prevResults = useRef(results);
    // React.useLayoutEffect(() => {
    // }, [state, results]);

    return store;
};

const noopStore: Store = {
    dispatch() {
        throw new Error('');
    },
    getResults() {
        throw new Error('');
    },
    getEvaluator() {
        throw new Error('');
    },
    getState() {
        throw new Error('');
    },
    onChange(idx, fn) {
        throw new Error('');
    },
    everyChange(fn) {
        throw new Error('');
    },
    reg(a, b, c, d) {
        throw new Error('');
    },
};

const StoreCtx = createContext<Store>(noopStore);

export const WithStore = ({
    store,
    children,
}: {
    store: Store;
    children: JSX.Element[] | JSX.Element;
}) => {
    return <StoreCtx.Provider value={store}>{children}</StoreCtx.Provider>;
};

export type Values = {
    node: MNode;
    nnode: NNode;

    display: Display[0];
    errors?: string[];

    reg: Reg;
    selection?: {
        edge: boolean;
        coverage: CoverageLevel;
    };
    // UIState['at'],
    dispatch: React.Dispatch<Action>;
};

export const getValues = (
    idx: number,
    path: Path[],
    store: Store,
    state: NUIState,
    results: NUIResults,
): Values => {
    const sel = normalizeSelections(state.at);
    const edgeSelected = sel.some(
        (s) =>
            s.start[s.start.length - 1].idx === idx ||
            (s.end && s.end[s.end.length - 1].idx === idx),
    );
    const coverageLevel = isCoveredBySelection(sel, path, state.map);
    // if (!state.map[idx]) {
    //     debugger;
    // }
    const nnode = getNestedNodes(
        state.map[idx],
        state.map,
        results.hashNames[idx],
        results.display[idx]?.layout,
    );

    return {
        errors: results.errors[idx],
        dispatch: store.dispatch,
        display: results.display[idx],
        selection: coverageLevel
            ? { edge: edgeSelected, coverage: coverageLevel }
            : undefined,
        node: state.map[idx],
        reg: store.reg,
        nnode,
    };
};

export const useMemoEqual = <T,>(fn: () => T, deps: any[]): T => {
    const last = useRef<T | null>(null);
    const v = useMemo(fn, deps);
    if (last.current === null || !equal(last.current, v)) {
        last.current = v;
    }
    return last.current!;
};

export const useExpanded = (idx: number): Node => {
    const store = useContext(StoreCtx);
    const [v, setV] = useState(() => fromMCST(idx, store.getState().map));
    const latest = useLatest(v);
    useEffect(
        () =>
            store.everyChange((state) => {
                const nw = fromMCST(idx, state.map);
                if (!equal(nw, latest.current)) {
                    setV(nw);
                }
            }),
        [idx],
    );
    return v;
};

export const useGlobalState = (store: Store) => {
    const [state, setState] = useState({
        state: store.getState(),
        results: store.getResults(),
    });
    useEffect(
        () =>
            store.everyChange(() =>
                setState({
                    state: store.getState(),
                    results: store.getResults(),
                }),
            ),
        [],
    );
    return state;
};

export const useGetStore = () => useContext(StoreCtx);

export const useNode = (idx: number, path: Path[]): Values => {
    const store = useContext(StoreCtx);
    let [state, setState] = useState(
        getValues(idx, path, store, store.getState(), store.getResults()),
    );
    const lpath = useRef(path);
    if (lpath.current !== path && !equal(lpath.current, path)) {
        lpath.current = path;
        state = getValues(
            idx,
            path,
            store,
            store.getState(),
            store.getResults(),
        );

        // throw new Error(
        //     `path was different, I guess I need to account for it.`,
        // );
    }
    useEffect(() => {
        return store.onChange(idx, (state, results) => {
            setState(getValues(idx, path, store, state, results));
        });
    }, [idx, lpath.current]);
    return state;
};
