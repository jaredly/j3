import * as React from 'react';
import { Store } from './store/Store';
import { NUIState } from './UIState';

export function useAutoFocus(
    store: Store,
    idx: number,
    type: string,
    focus: () => void,
) {
    React.useEffect(() => {
        const state = store.getState();
        const last = lastPath(state);
        if (last?.idx === idx && last.type === type) {
            // This is to allow the rich-text node to render, it's a little delayed
            setTimeout(() => {
                focus();
            }, 100);
        }

        return store.on('selection', () => {
            const state = store.getState();
            const last = lastPath(state);
            if (last?.idx === idx && last.type === type) {
                focus();
            }
        });
    }, []);
}

export function lastPath(state: NUIState) {
    const at = state.at[0]?.start;
    const last = at?.[at.length - 1];
    return last;
}
