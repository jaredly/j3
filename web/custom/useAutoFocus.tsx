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
            // console.log('focusing', last, idx);
            // node.current?.focus();
            setTimeout(() => {
                focus();
            }, 100);
        }

        return store.on('selection', () => {
            const state = store.getState();
            const last = lastPath(state);
            if (last?.idx === idx && last.type === type) {
                // console.log('focusing 2', last, idx);
                // node.current?.focus();
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
