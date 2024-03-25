import * as React from 'react';
import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { Action, MetaData, NUIState, UIState } from '../UIState';
import { Display } from '../../../src/to-ast/library';
import { NNode, getNestedNodes } from '../../../src/state/getNestedNodes';
import { Node } from '../../../src/types/cst';
import { MNode, Map, fromMCST } from '../../../src/types/mcst';
import { Reg } from '../types';
import { CoverageLevel } from '../../../src/state/clipboard';
import { Path } from '../../store';
import { isCoveredBySelection } from '../isCoveredBySelection';
import equal from 'fast-deep-equal';
import { useLatest } from '../useNSDrag';
import { normalizeSelections, useRegs } from '../CardRoot';
import { debounce } from '../../ide/ground-up/reduce';
import { loadEv } from '../../ide/ground-up/loadEv';
import {
    FullEvalator,
    LocError,
    MyEvalError,
    bootstrap,
    repr,
    Produce as Produce,
    ProduceItem,
} from '../../ide/ground-up/Evaluators';
import { goRight } from '../../../src/state/navigate';
import { cmpFullPath } from '../../../src/state/path';

export type NUIResults = {
    jumpToName: { [name: string]: number };
    errors: { [loc: number]: string[] };
    display: Display;
    hashNames: { [loc: string]: string };
    produce: { [key: string]: ProduceItem[] };
    env: any;
    traces: { [loc: number]: { [loc: number]: any[] } };
    pluginResults: { [nsLoc: number]: any };
};

export type Evt = 'selection' | 'hover' | 'map' | 'nsMap' | 'all' | 'results';

export type Store = {
    dispatch: React.Dispatch<Action>;
    getState(): NUIState;
    getResults(): NUIResults;
    getEvaluator(): FullEvalator<any, any, any> | null;
    reg: Reg;
    onChange(
        idx: number,
        fn: (state: NUIState, results: NUIResults) => void,
    ): () => void;
    // everyChange(fn: (state: NUIState) => void): () => void;
    on(evt: Evt, fn: (state: NUIState) => void): () => void;
    setDebug(execOrder: boolean): void;
};

export const allNodesBetween = (
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

export const loadEvaluator = (
    ev: NUIState['evaluator'],
    fn: (ev: FullEvalator<any, any, any> | null, async: boolean) => void,
) => {
    if (typeof ev === 'string') {
        switch (ev) {
            case ':bootstrap:':
                return fn(bootstrap, false);
            case ':repr:':
                return fn(repr, false);
            default:
                if (ev?.endsWith('.json')) {
                    fn(null, false); // clear it out
                    loadEv([ev]).then((ev) => fn(ev, true));
                } else {
                    fn(null, false);
                }
        }
    } else if (ev) {
        loadEv(ev).then((ev) => fn(ev, true));
    }
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

const noopStore: Store = {
    setDebug() {},
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
    on(evt, fn) {
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

    meta: MetaData | null;
    display: Display[0];
    errors?: string[];

    reg: Reg;
    selection?: {
        edge: boolean;
        coverage: CoverageLevel;
    };
    dispatch: React.Dispatch<Action>;
};

export const getValues = (
    idx: number,
    // path: Path[],
    store: Store,
    state: NUIState,
    results: NUIResults,
): Values => {
    if (!state.map[idx]) {
        return {
            dispatch() {},
            display: {},
            meta: null,
            reg() {},
            node: { type: 'blank', loc: -1 },
            nnode: { type: 'text', text: '' },
        };
    }
    // const sel = normalizeSelections(state.at);
    // const edgeSelected = sel.some(
    //     (s) =>
    //         s.start[s.start.length - 1].idx === idx ||
    //         (s.end && s.end[s.end.length - 1].idx === idx),
    // );
    // const coverageLevel = isCoveredBySelection(sel, path, state.map);
    const nnode = getNestedNodes(
        state.map[idx],
        state.map,
        results.hashNames[idx],
        results.display[idx]?.layout,
    );

    return {
        errors: results.errors[idx],
        dispatch: store.dispatch,
        meta: state.meta?.[idx] ?? null,
        display: results.display[idx],
        // selection: coverageLevel
        //     ? { edge: edgeSelected, coverage: coverageLevel }
        //     : undefined,
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
            store.on('map', (state) => {
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
            store.on('all', () =>
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

/**
 * This will:
 * - perform the calculation the first time
 * - recheck it whenever `sub` notifies us
 * - recalc whenever `deps` changes
 *
 * - but `calc` better never change...
 */
export const useSubscribe = <T,>(
    calc: () => T,
    sub: (fn: () => void) => void,
    deps: any[],
) => {
    const saved = useRef<T | null>(null);
    useMemo(() => {
        const nw = calc();
        if (!equal(nw, saved.current)) {
            saved.current = calc();
        }
    }, deps);
    const [_, tick] = useState(null);

    useEffect(() => {
        sub(() => {
            const nw = calc();
            if (!equal(nw, saved.current)) {
                saved.current = nw;
                tick(null);
            }
        });
    }, []);

    return saved.current!;
};

export const useNode = (idx: number, path: Path[]): Values => {
    const store = useContext(StoreCtx);
    let [state, setState] = useState(() =>
        getValues(idx, store, store.getState(), store.getResults()),
    );
    const diff = state.node.loc !== idx;
    if (diff) {
        throw new Error(`ok cant handle the idx actually changing`);
    }

    const pathRef = useLatest(path);
    const selection = useSubscribe(
        () => {
            const path = pathRef.current;
            const state = store.getState();

            console.log(`doin a calc`, path);

            // man we're running this calculation quite a lot
            const sel = normalizeSelections(state.at);
            const edgeSelected = sel.some(
                (s) =>
                    s.start[s.start.length - 1].idx === idx ||
                    (s.end && s.end[s.end.length - 1].idx === idx),
            );
            const coverageLevel = isCoveredBySelection(sel, path, state.map);

            return coverageLevel
                ? { edge: edgeSelected, coverage: coverageLevel }
                : undefined;
        },
        (notify) => {
            let la = store.getState().at;
            store.on('selection', (f) => {
                if (f.at !== la) {
                    la = f.at;
                }
                notify();
            });
        },
        [path],
    );

    useEffect(() => {
        return store.onChange(idx, (state, results) => {
            // Node is being deleted, ignore. This'll unmount in a minute
            if (!state.map[idx]) return;
            setState(getValues(idx, store, state, results));
        });
    }, [idx]);
    return { ...state, selection };
};
