import { HistoryItem } from '../../src/to-ast/library';
import { NUIState } from './UIState';

export const maybeMerge = (
    prev: HistoryItem | undefined,
    next: HistoryItem,
    reverted: boolean,
): HistoryItem | void => {
    if (!prev || reverted) return;
    if (Object.keys(next.nsMap).length) return;
    if (Object.keys(next.meta).length) return;
    if (prev.revert != null || next.revert != null) return;
    const pchanged = Object.keys(prev.map);
    const nchanged = Object.keys(next.map);
    if (
        pchanged.length !== 1 ||
        nchanged.length !== 1 ||
        pchanged[0] !== nchanged[0]
    ) {
        // console.log('not just one', pchanged, nchanged)
        return;
    }
    const id = nchanged[0];
    if (!next.map[id] || !prev.map[id]) return;
    const node = next.map[id]!;
    if (node.type === 'rich-text') {
        return { ...prev, map: next.map, at: next.at };
    }
    if (node.type !== 'identifier') return;
    if (next.ts - prev.ts > 1000) return; // more than a second between, justskip
    return { ...prev, map: next.map, at: next.at };
};

export const compressState = (state: NUIState): NUIState => {
    const reverted: number[] = [];
    state.history.forEach((item) => {
        if (item.revert != null) reverted.push(item.revert);
    });

    const revertMap: { [key: number]: number } = {};

    // OK FOLKS
    // if an item is reverted, we can't touch it.
    // we'll also need to re-id all reverts
    const history: NUIState['history'] = [];
    state.history.forEach((item, i) => {
        const last = history[history.length - 1];
        const merged = maybeMerge(last, item, reverted.includes(i));
        if (merged) {
            history[history.length - 1] = merged;
        } else {
            revertMap[i] = history.length;
            history.push({ ...item, id: history.length });
        }
    });

    history.forEach((item, i) => {
        if (item.revert != null) {
            if (revertMap[item.revert] == null) {
                throw new Error(
                    `revert map invalid, doesnt know where ${item.revert} should go`,
                );
            }
            history[i] = { ...item, revert: revertMap[item.revert] };
        }
    });

    return { ...state, history };
};
