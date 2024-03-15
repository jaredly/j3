import { HistoryItem } from '../../src/to-ast/library';
import { NUIState } from './UIState';

export const maybeMerge = (
    prev: HistoryItem | undefined,
    next: HistoryItem,
): HistoryItem | void => {
    if (!prev) return;
    if (Object.keys(next.nsMap).length) return;
    if (Object.keys(next.meta).length) return;
    const pchanged = Object.keys(prev.map);
    const nchanged = Object.keys(next.map);
    if (
        pchanged.length !== 1 ||
        nchanged.length !== 1 ||
        pchanged[0] !== nchanged[0]
    ) {
        return;
    }
    const id = nchanged[0];
    if (!next.map[id] || prev.map[id]) return;
    const node = next.map[id];
    if (node?.type !== 'identifier') return;
    return { ...prev, map: next.map, at: next.at };
};

export const compressState = (state: NUIState): NUIState => {
    const history: NUIState['history'] = [];
    state.history.forEach((item) => {
        const last = history[history.length - 1];
        const merged = maybeMerge(last, item);
        if (merged) {
            history[history.length - 1] = merged;
        } else {
            history.push(item);
        }
    });
    return { ...state, history };
};
