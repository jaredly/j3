import React, { useEffect, useRef, useState } from 'react';
import { splitGraphemes } from '../../../src/parse/splitGraphemes';
import { useLatest } from '../../../web/custom/useLatest';
import { useKeyListener } from '../HiddenInput';
import { specials, textKey } from '../keyboard';
import { useBlink } from './useBlink';
import { renderTextAndCursor } from './renderTextAndCursor';
import { getNewSelection } from './getNewSelection';

export type EditState = {
    text: string[];
    sel: number;
    start?: number;
};

export const Id = ({
    node,
}: {
    node: {
        type: 'id' | 'stringText' | 'accessText';
        text: string;
        loc: number;
    };
}) => {
    const [state, setState] = useState(null as null | EditState);

    const latest = useLatest(state);
    const { resetBlink, blink } = useBlink();

    useKeyListener(
        state != null,
        (key, mods) => {
            if (!latest.current) return;
            let { text, sel } = latest.current;
            if (sel == null) return;

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
                }
                return;
            }
            const extra = splitGraphemes(key);
            if (extra.length > 1) {
                console.log('Too many graphemes? What is this', key, extra);
                return;
            }
            const results = textKey(extra, latest.current, mods);
            setState({ text: results.text, sel: results.cursor });
        },
        () => {
            setState(null);
        },
    );

    const [drag, setDrag] = useState(false);

    const ref = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (!drag) return;
        const a = () => {
            setDrag(false);
        };
        const b = (evt: MouseEvent) => {
            const state = latest.current;
            const range = new Range();
            const text = state?.text ?? splitGraphemes(node.text);
            const sel = getNewSelection(
                text,
                state,
                ref.current!,
                evt.clientX,
                false,
                range,
            );
            setState({ text, sel: sel.sel, start: state?.start ?? state?.sel });

            resetBlink();
        };
        document.addEventListener('mouseup', a);
        document.addEventListener('mousemove', b);

        return () => {
            document.removeEventListener('mouseup', a);
            document.removeEventListener('mousemove', b);
        };
    }, [drag]);

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
