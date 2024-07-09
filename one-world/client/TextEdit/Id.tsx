import React, { useEffect, useRef, useState } from 'react';
import { splitGraphemes } from '../../../src/parse/splitGraphemes';
import { useLatest } from '../../../web/custom/useLatest';
import { getNewSelection } from './getNewSelection';
import { renderTextAndCursor } from './renderTextAndCursor';
import { useBlink } from './useBlink';
import { useDrag } from './useDrag';
import { useKeys } from './useKeys';
import { Path } from '../../shared/nodes';

export type EditState = {
    text: string[];
    sel: number;
    start?: number;
};

export const Id = ({
    tid,
    node,
    path,
}: {
    path: Path;
    tid: string;
    node: {
        type: 'id' | 'stringText' | 'accessText';
        text: string;
        loc: number;
    };
}) => {
    const [state, setState] = useState(null as null | EditState);

    const latest = useLatest(state);
    const { resetBlink, blink } = useBlink();

    maintainLatestText(node.text, latest, setState);

    useKeys(tid, path, latest, resetBlink, setState);

    const { ref, setDrag } = useDrag(node.text, latest, setState, resetBlink);

    return (
        <span
            ref={ref}
            onMouseDown={(evt) => {
                evt.preventDefault();
                evt.stopPropagation();
                const text = state?.text ?? splitGraphemes(node.text);
                const range = new Range();

                let { sel, start } = getNewSelection(
                    text,
                    state,
                    evt.currentTarget,
                    evt.clientX,
                    evt.shiftKey,
                    range,
                );

                setState({ sel, start, text });
                resetBlink();
                setDrag(true);
            }}
            style={{
                padding: 4,
                backgroundColor: '#222',
                boxSizing: 'border-box',
            }}
        >
            {state != null ? renderTextAndCursor(state, blink) : node.text}
        </span>
    );
};

function maintainLatestText(
    nodeText: string,
    latest: React.MutableRefObject<EditState | null>,
    setState: React.Dispatch<React.SetStateAction<EditState | null>>,
) {
    const prevText = useRef(nodeText);
    useEffect(() => {
        if (prevText.current !== nodeText) {
            prevText.current = nodeText;
            if (latest.current) {
                const text = splitGraphemes(nodeText);
                setState({
                    sel: Math.min(text.length, latest.current.sel),
                    text,
                });
            }
        }
    }, [nodeText]);
}
