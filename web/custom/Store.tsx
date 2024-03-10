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
import { MNode, fromMCST } from '../../src/types/mcst';
import { Reg } from './types';
import { CoverageLevel } from '../../src/state/clipboard';
import { Path } from '../store';
import { isCoveredBySelection } from './isCoveredBySelection';
import equal from 'fast-deep-equal';
import { useLatest } from './useNSDrag';

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

const ctx = createContext<Store>(noopStore);

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
    const edgeSelected = state.at.some(
        (s) =>
            s.start[s.start.length - 1].idx === idx ||
            (s.end && s.end[s.end.length - 1].idx === idx),
    );
    const coverageLevel = isCoveredBySelection(state.at, path, state.map);
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
    const store = useContext(ctx);
    const [v, setV] = useState(() => fromMCST(idx, store.getState().map));
    const latest = useLatest(v);
    useEffect(
        () =>
            store.everyChange((state) => {
                const nw = fromMCST(idx, state.map);
            }),
        [idx],
    );
    const state = store.getState();
    return useMemoEqual(() => fromMCST(idx, state.map), [idx, state.map]);
};

export const useNode = (idx: number, path: Path[]): Values => {
    const store = useContext(ctx);
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
