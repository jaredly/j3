import React from 'react';
import { splitGraphemes } from '../../../src/parse/splitGraphemes';
import { useKeyListener } from '../HiddenInput';
import { specials, textKey } from '../keyboard';
import { EditState } from './Id';

export function useKeys(
    state: EditState | null,
    latest: React.MutableRefObject<EditState | null>,
    resetBlink: () => void,
    setState: React.Dispatch<React.SetStateAction<EditState | null>>,
) {
    useKeyListener(
        state != null,
        (key, mods) => {
            if (!latest.current) return;
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
                if (action?.type === 'update') {
                    setState({
                        text: action.text,
                        sel: action.cursor,
                        start: action.cursorStart,
                    });
                } else {
                    console.warn('ignoring action', action);
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
            setState(null);
        },
    );
}
