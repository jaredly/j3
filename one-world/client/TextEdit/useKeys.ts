import React from 'react';
import { splitGraphemes } from '../../../src/parse/splitGraphemes';
import { useKeyListener } from '../HiddenInput';
import { specials, textKey } from '../keyboard';
import { EditState } from './Id';
import { Store, useStore } from '../StoreContext';
import { handleAction } from './actions';
import { Path } from '../../shared/nodes';

export function useKeys(
    tid: string,
    path: Path,
    latest: React.MutableRefObject<EditState | null>,
    resetBlink: () => void,
    setState: React.Dispatch<React.SetStateAction<EditState | null>>,
) {
    const store = useStore();

    const loc = path.children[path.children.length - 1];

    useKeyListener(
        latest.current != null,
        (key, mods) => {
            if (!latest.current) return;
            if (mods.meta) return; // skip those
            let { text, sel } = latest.current;

            resetBlink();

            if (specials[key]) {
                const action = specials[key](
                    sel === text.length
                        ? 'end'
                        : sel === 0
                        ? 'start'
                        : 'middle',
                    latest.current,
                    mods,
                );
                if (!action) {
                } else if (action.type === 'update') {
                    setState({
                        text: action.text!,
                        sel: action.cursor,
                        start: action.cursorStart,
                    });
                } else {
                    maybeCommitTextChanges(latest.current, store, tid, loc);
                    const state = store.getState();
                    const saction = handleAction(action, path, state);
                    if (saction) {
                        // console.log('state action', saction);
                        store.update(saction);
                    } else {
                        console.warn('ignoring action', action);
                    }
                }
                return;
            }
            const extra = splitGraphemes(key);
            if (extra.length > 1) {
                console.warn('Too many graphemes? What is this', key, extra);
                return;
            }
            const results = textKey(extra, latest.current, mods);
            setState({ text: results.text, sel: results.cursor });
        },
        () => {
            if (latest.current) {
                maybeCommitTextChanges(latest.current, store, tid, loc);
            }
            setState(null);
        },
    );
}

function maybeCommitTextChanges(
    estate: EditState,
    store: Store,
    tid: string,
    loc: number,
) {
    const text = estate.text.join('');
    const current = store.getState().toplevels[tid].nodes[loc];
    if (
        current.type === 'id' ||
        current.type === 'accessText' ||
        current.type === 'stringText'
    ) {
        if (text !== current.text) {
            store.update({
                type: 'toplevel',
                id: tid,
                action: {
                    type: 'update',
                    update: {
                        nodes: { [loc]: { ...current, text } },
                    },
                },
            });
        }
    }
}
