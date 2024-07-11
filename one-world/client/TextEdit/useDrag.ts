import React, { useEffect, useRef, useState } from 'react';
import { splitGraphemes } from '../../../src/parse/splitGraphemes';
import { getNewSelection } from './getNewSelection';
import { EditState } from './Id';

export const useDrag = (
    nodeText: string,
    latest: React.MutableRefObject<EditState | null>,
    setState: React.Dispatch<React.SetStateAction<EditState | null>>,
    resetBlink: () => void,
) => {
    const [drag, setDrag] = useState(false);
    const ref = useRef<HTMLSpanElement>(null);
    useEffect(() => {
        if (!drag) return;
        const up = () => setDrag(false);
        const move = (evt: MouseEvent) => {
            const state = latest.current;
            const range = new Range();
            const text = state?.text ?? splitGraphemes(nodeText);
            const sel = getNewSelection(
                text,
                state,
                ref.current!,
                { x: evt.clientX, y: evt.clientY },
                false,
                range,
            );
            setState({ text, sel: sel.sel, start: state?.start ?? state?.sel });

            resetBlink();
        };
        document.addEventListener('mouseup', up);
        document.addEventListener('mousemove', move);

        return () => {
            document.removeEventListener('mouseup', up);
            document.removeEventListener('mousemove', move);
        };
    }, [drag]);
    return { ref, setDrag };
};
