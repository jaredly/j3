import { useContext, useEffect, useState } from 'react';
import { Path } from '../../store';
import { isCoveredBySelection } from '../isCoveredBySelection';
import { useLatest } from '../useLatest';
import { normalizeSelections } from '../normalizeSelections';
import { Values, getValues } from './Store';
import { StoreCtx, useSubscribe } from './StoreCtx';
import equal from 'fast-deep-equal';
import { NUIState, RealizedNamespace } from '../UIState';

const findNs = (path: Path[]) => path.find((p) => p.type === 'ns-top')!.idx;

export const useNode = (
    idx: number,
    path: Path[],
    readOnly?: boolean,
): Values => {
    const store = useContext(StoreCtx);
    let [state, setState] = useState(() =>
        getValues(
            idx,
            store,
            store.getState(),
            store.getResults().results.nodes[findNs(path)],
            store.getResults().workerResults.nodes[findNs(path)],
            store.getResults().workerResults.usages[idx]?.length === 0,
        ),
    );

    // console.log(`useNode`, idx, state);

    const diff = state.node.loc !== idx;
    if (diff) {
        console.warn(`ok cant handle the idx actually changing`);
    }

    const pathRef = useLatest(path);

    const hover = useSubscribe(
        () => {
            if (readOnly) return false;
            const state = store.getState();
            return equal(state.hover, path);
        },
        (notify) => store.on('hover', notify),
        [path],
    );

    const selection = useSubscribe(
        () => {
            if (readOnly) return undefined;
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
            return store.on('selection', (f) => {
                if (f.at !== la) {
                    la = f.at;
                }
                notify();
            });
        },
        [path],
    );

    useEffect(() => {
        return store.onChange(idx, (state, results, asyncResults, unused) => {
            // Node is being deleted, ignore. This'll unmount in a minute
            if (!state.map[idx]) return;
            setState(
                getValues(idx, store, state, results, asyncResults, unused),
            );
        });
    }, [idx]);

    return { ...state, selection, hover };
};
