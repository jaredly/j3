import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { Node } from '../../../src/types/cst';
import { fromMCST } from '../../../src/types/mcst';
import equal from 'fast-deep-equal';
import { useLatest } from '../useLatest';
import { Store, noopStore } from './Store';

export const StoreCtx = createContext<Store>(noopStore);
export const useMemoEqual = <T>(fn: () => T, deps: any[]): T => {
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

export const useResults = (store: Store) => {
    const [state, setState] = useState(store.getResults());
    useEffect(
        () => store.on('results', () => setState(store.getResults())),
        [],
    );
    return state;
};

export const useGlobalState = (store: Store) => {
    const [state, setState] = useState({
        state: store.getState(),
        // results: store.getResults(),
        // cache: store.getCache(),
    });
    useEffect(
        () =>
            store.on('all', () =>
                setState({
                    state: store.getState(),
                    // results: store.getResults(),
                    // cache: store.getCache(),
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

export const useSubscribe = <T>(
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
    const [_, tick] = useState(0);

    useEffect(() => {
        sub(() => {
            const nw = calc();
            if (!equal(nw, saved.current)) {
                saved.current = nw;
                tick((t) => t + 1);
            }
        });
    }, []);

    return saved.current!;
};
