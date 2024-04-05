import { useContext, useEffect, useState } from 'react';
import { Path } from '../../store';
import { isCoveredBySelection } from '../isCoveredBySelection';
import { useLatest } from '../useNSDrag';
import { normalizeSelections } from '../CardRoot';
import { Values, StoreCtx, getValues, useSubscribe } from './Store';
import equal from 'fast-deep-equal';

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

    const hover = useSubscribe(
        () => {
            const state = store.getState();
            return equal(state.hover, path);
        },
        (notify) => {
            store.on('hover', notify);
        },
        [path],
    );

    const selection = useSubscribe(
        () => {
            const path = pathRef.current;
            const state = store.getState();

            // man we're running this calculation quite a lot
            const sel = normalizeSelections(state.at, state.nsMap);
            const edgeSelected = sel.some(
                (s) =>
                    s.start[s.start.length - 1].idx === idx ||
                    (s.end && s.end[s.end.length - 1].idx === idx),
            );
            const coverageLevel = isCoveredBySelection(
                sel,
                path,
                state.map,
                state.nsMap,
            );

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
    return { ...state, selection, hover };
};