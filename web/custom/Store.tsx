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

type NUIResults = {
    errors: { [loc: number]: string[] };
    display: Display;
    hashNames: { [loc: string]: string };
};

type Store = {
    dispatch: React.Dispatch<Action>;
    getState(): NUIState;
    getResults(): NUIResults;
    reg: Reg;
    onChange(
        idx: number,
        fn: (state: NUIState, results: NUIResults) => void,
    ): () => void;
    everyChange(fn: (state: NUIState) => void): () => void;
};

const allNodesBetween = (start: Path[], end: Path[], map: Map): number[] => {
    const found: number[] = [];

    // STOPSHIP start here!

    return found;
};

export const useStore = (
    state: NUIState,
    results: NUIResults,
    dispatch: React.Dispatch<Action>,
) => {
    const lstate = useLatest(state);
    const lresults = useLatest(results);
    const reg = useRegs(state);

    const nodeListeners = useRef<{
        [key: string]: ((state: NUIState, results: NUIResults) => void)[];
    }>({});
    const everyListeners = useRef<((state: NUIState) => void)[]>([]);

    const store = useMemo<Store>(() => {
        return {
            dispatch,
            getState() {
                return lstate.current;
            },
            getResults() {
                return lresults.current;
            },
            reg,
            onChange(idx, fn) {
                if (!nodeListeners.current[idx]) {
                    nodeListeners.current[idx] = [];
                }
                nodeListeners.current[idx].push(fn);
                return () => {
                    const at = nodeListeners.current[idx].indexOf(fn);
                    if (at !== -1) {
                        nodeListeners.current[idx].splice(at, 1);
                    }
                };
            },
            everyChange(fn) {
                everyListeners.current.push(fn);
                return () => {
                    const idx = everyListeners.current.indexOf(fn);
                    if (idx !== -1) {
                        everyListeners.current.splice(idx, 1);
                    }
                };
            },
        };
    }, []);

    const prevState = useRef(state);
    const prevResults = useRef(results);
    React.useLayoutEffect(() => {
        everyListeners.current.forEach((f) => f(state));

        const selChange: { [key: number]: boolean } = {};
        if (state.at !== prevState.current.at) {
            prevState.current.at.forEach((cursor) => {
                cursor.start.forEach((item) => (selChange[item.idx] = true));
                cursor.end?.forEach((item) => (selChange[item.idx] = true));

                if (cursor.end) {
                    const [start, end] = orderStartAndEnd(
                        cursor.start,
                        cursor.end,
                    );
                    allNodesBetween(start, end, prevState.current.map).forEach(
                        (idx) => (selChange[idx] = true),
                    );
                }
            });
            state.at.forEach((cursor) => {
                cursor.start.forEach((item) => (selChange[item.idx] = true));
                cursor.end?.forEach((item) => (selChange[item.idx] = true));

                if (cursor.end) {
                    const [start, end] = orderStartAndEnd(
                        cursor.start,
                        cursor.end,
                    );
                    allNodesBetween(start, end, state.map).forEach(
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

        console.log('handle up');
        Object.keys(nodeListeners.current).forEach((k) => {
            const idx = +k;
            let changed =
                selChange[idx] ||
                state.map[idx] !== prevState.current.map[idx] ||
                !equal(results.errors[idx], prevResults.current.errors[idx]) ||
                !equal(results.display[idx], prevResults.current.display[idx]);
            if (changed) {
                console.log('ok', idx);
                nodeListeners.current[idx].forEach((fn) => fn(state, results));
            }
        });

        prevState.current = state;
        prevResults.current = results;
    }, [state, results]);

    return store;
};

const noopStore: Store = {
    dispatch() {
        throw new Error('');
    },
    getResults() {
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

export const useNode = (idx: number, path: Path[]): Values => {
    const store = useContext(StoreCtx);
    const [state, setState] = useState(
        getValues(idx, path, store, store.getState(), store.getResults()),
    );
    const lpath = useRef(path);
    if (lpath.current !== path && !equal(lpath.current, path)) {
        throw new Error(
            `path was different, I guess I need to account for it.`,
        );
    }
    useEffect(() => {
        return store.onChange(idx, (state, results) => {
            setState(getValues(idx, path, store, state, results));
        });
    }, [idx]);
    return state;
};
