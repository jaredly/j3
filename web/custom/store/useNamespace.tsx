import { useContext, useEffect, useState } from 'react';
import { NUIResults } from './Store';
import { StoreCtx } from './StoreCtx';
import { Path } from '../../../src/state/path';
import { NUIState, RealizedNamespace } from '../UIState';
import { NodeResults } from './getImmediateResults';
import { ProduceItem } from '../../ide/ground-up/FullEvalator';
import { Sendable } from '../worker/worker';

// type NSValues = {}

export const getNSValues = (
    idx: number,
    state: NUIState,
    results: NodeResults<any>,
    remote: Sendable | null,
) => {
    const ns = state.nsMap[idx] as RealizedNamespace;
    const produce: ProduceItem[] = remote?.produce ?? [];
    if (idx === 0) {
        return { ns, produce: [] };
    }
    if (results?.parsed?.type === 'failure') {
        produce.push(
            ...Object.entries(results.parsed.errors).map(
                ([loc, errors]) => `Parse error ${loc}: ${errors.join(', ')}`,
            ),
        );
    }
    console.log('get ns value', produce, results, remote);
    return { ns, produce };
};

export const useNamespace = (idx: number, path: Path[]) => {
    const store = useContext(StoreCtx);
    const [state, setState] = useState(() =>
        getNSValues(idx, store.getState(), store.getResults().nodes[idx], null),
    );

    useEffect(
        () =>
            store.onChange(`ns:${idx}`, (state, results, remote) => {
                if (!state.nsMap[idx]) return;
                setState(getNSValues(idx, state, results, remote));
            }),
        [idx],
    );

    return state;
};
