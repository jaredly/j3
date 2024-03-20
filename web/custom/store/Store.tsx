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
} from '../../ide/ground-up/Evaluators';
import { goRight } from '../../../src/state/navigate';
import { cmpFullPath } from '../../../src/state/path';

export type NUIResults = {
    errors: { [loc: number]: string[] };
    display: Display;
    hashNames: { [loc: string]: string };
    produce: { [key: string]: JSX.Element | string | LocError | MyEvalError };
    env: any;
    traces: { [loc: number]: { [loc: number]: any[] } };
    pluginResults: { [nsLoc: number]: any };
};

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
    everyChange(fn: (state: NUIState) => void): () => void;
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

    meta: MetaData | null;
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
    if (!state.map[idx]) {
        return {
            // errors: {},
            dispatch() {},
            display: {},
            meta: null,
            // selection: null,
            reg() {},
            node: { type: 'blank', loc: -1 },
            nnode: { type: 'text', text: '' },
        };
    }
    const sel = normalizeSelections(state.at);
    const edgeSelected = sel.some(
        (s) =>
            s.start[s.start.length - 1].idx === idx ||
            (s.end && s.end[s.end.length - 1].idx === idx),
    );
    const coverageLevel = isCoveredBySelection(sel, path, state.map);
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
// ok
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
    let [state, setState] = useState(() =>
        getValues(idx, path, store, store.getState(), store.getResults()),
    );
    const diff = state.node.loc !== idx;
    const lpath = useRef(path);
    if ((lpath.current !== path && !equal(lpath.current, path)) || diff) {
        lpath.current = path;
        state = getValues(
            idx,
            path,
            store,
            store.getState(),
            store.getResults(),
        );
        console.warn(`path was different~ ahhh`);
        // setState(state);

        // throw new Error(
        //     `path was different, I guess I need to account for it.`,
        // );
    }
    useEffect(() => {
        if (diff) {
            setState(state);
        }
    }, [diff]);
    // useMemo(() =)
    useEffect(() => {
        return store.onChange(idx, (state, results) => {
            // Node is being deleted, ignore. This'll unmount in a minute
            if (!state.map[idx]) return;
            setState(getValues(idx, path, store, state, results));
        });
    }, [idx, lpath.current]);
    return state;
};
