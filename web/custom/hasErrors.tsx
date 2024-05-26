import { traverseMCST } from '../../src/types/mcst';
import { NUIState, RealizedNamespace } from './UIState';
import { ImmediateResults } from './store/getImmediateResults';
import { WorkerResults } from './store/useSyncStore';

export const hasErrors = (
    id: number,
    state: NUIState,
    {
        results,
        workerResults,
    }: { results: ImmediateResults<any>; workerResults: WorkerResults },
): boolean => {
    const ns = state.nsMap[id] as RealizedNamespace;
    if (!ns) {
        console.warn(`trying to haserrors but no ns`);
        return true;
    }
    const parsed = results.nodes[ns.id].parsed;
    if (parsed?.type === 'failure') {
        return true;
    }
    if (parsed?.type === 'success' && parsed.errors.length) {
        return true;
    }
    if (Object.keys(workerResults.nodes[ns.id]?.errors ?? {}).length) {
        return true;
    }
    if (
        workerResults.nodes[ns.id]?.produce.some(
            (p) =>
                typeof p !== 'string' &&
                (p.type === 'withjs' ||
                    p.type === 'inference-error' ||
                    p.type === 'error' ||
                    p.type === 'eval'),
        )
    ) {
        return true;
    }
    return ns.children.some((id) =>
        hasErrors(id, state, { results, workerResults }),
    );
};

const topHasChanges = (id: number, state: NUIState) => {
    if (!state.trackChanges) return false;
    const top = state.map[id];
    let hasChanges = false;
    traverseMCST(id, state.map, (id) => {
        if (hasChanges) return;
        if (state.trackChanges!.previous[id] !== undefined) {
            hasChanges = true;
        }
    });
    return hasChanges;
};

export const hasTrackedChanges = (nsid: number, state: NUIState) => {
    const ns = state.nsMap[nsid];
    if (!ns) return false;
    if (topHasChanges(ns.top, state)) {
        return true;
    }
    for (let child of ns.children) {
        if (hasTrackedChanges(child, state)) {
            return true;
        }
    }
    return false;
};
