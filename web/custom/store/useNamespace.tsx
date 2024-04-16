import { useContext, useEffect, useState } from 'react';
import { NUIResults, StoreCtx } from './Store';
import { Path } from '../../../src/state/path';
import { NUIState, RealizedNamespace } from '../UIState';
import { NodeResults } from './getImmediateResults';
import { ProduceItem } from '../../ide/ground-up/Evaluators';

// type NSValues = {}

export const getNSValues = (
    idx: number,
    state: NUIState,
    results: NodeResults<any>,
) => {
    const ns = state.nsMap[idx] as RealizedNamespace;
    const produce: ProduceItem[] = [];
    if (idx === 0) {
        return { ns, produce: [] };
    }
    if (results.parsed?.type === 'failure') {
        produce.push(
            ...Object.entries(results.parsed.errors).map(
                ([loc, errors]) => `Parse error ${loc}: ${errors.join(', ')}`,
            ),
        );
    }
    return { ns, produce };
};

export const useNamespace = (idx: number, path: Path[]) => {
    const store = useContext(StoreCtx);
    const [state, setState] = useState(() =>
        getNSValues(idx, store.getState(), store.getResults().nodes[idx]),
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
