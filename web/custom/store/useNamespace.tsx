import { useContext, useEffect, useState } from 'react';
import { NUIResults, StoreCtx } from './Store';
import { Path } from '../../../src/state/path';
import { NUIState, RealizedNamespace } from '../UIState';

// type NSValues = {}

export const getNSValues = (
    idx: number,
    state: NUIState,
    results: NUIResults,
) => {
    const ns = state.nsMap[idx] as RealizedNamespace;
    return { ns, produce: results.produce[idx] };
};

export const useNamespace = (idx: number, path: Path[]) => {
    const store = useContext(StoreCtx);
    const [state, setState] = useState(() =>
        getNSValues(idx, store.getState(), store.getResults()),
    );

    useEffect(
        () =>
            store.onChange(`ns:${idx}`, (state, results) => {
                if (!state.nsMap[idx]) return;
                setState(getNSValues(idx, state, results));
            }),
        [idx],
    );

    return state;
};
