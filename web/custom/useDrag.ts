import equal from 'fast-deep-equal';
import React, { useEffect, useRef, useState } from 'react';
import { Action, NUIState } from './UIState';
import { closestSelection } from './closestSelection';
import { selectEnd } from '../../src/state/navigate';
import { Path } from '../store';

export function useDrag(dispatch: React.Dispatch<Action>, state: NUIState) {
    const [drag, setDrag] = useState(
        null as null | 'select' | { type: 'move'; path: Path[]; idx: number },
    );
    const currentState = useRef(state);
    currentState.current = state;

    useEffect(() => {
        if (!drag) {
            return;
        }
        const up = (evt: MouseEvent) => {
            setDrag(null);
            if (drag === 'select') {
            } else if (drag.type === 'move') {
                const state = currentState.current;
                const sel = closestSelection(state.regs, {
                    x: evt.clientX,
                    y: evt.clientY,
                });
                const { idx, path } = drag;

                if (!sel) {
                    dispatch({
                        type: 'select',
                        at: [
                            {
                                start: [...path, { type: 'start', idx }],
                                end: [...path, { type: 'end', idx }],
                            },
                        ],
                    });
                    return;
                }

                // setTimeout(() => {
                dispatch({
                    type: 'move',
                    source: { idx, path },
                    dest: sel,
                });
                // }, 500);

                // if (sel) {
                //     if (pathStartsWith(sel, path)) {
                //         // bad news
                //         console.log('invalid drop location');
                //     }
                // }

                // OK so now we do the moveroo.
            }
        };
        const move = (evt: MouseEvent) => {
            const state = currentState.current;
            const sel = closestSelection(state.regs, {
                x: evt.clientX,
                y: evt.clientY,
            });
            if (sel) {
                if (drag === 'select') {
                    const at = state.at.slice();
                    const idx = at.length - 1;
                    if (equal(sel, at[idx].start)) {
                        at[idx] = { start: sel };
                        dispatch({ type: 'select', at });
                    } else {
                        at[idx] = { ...at[idx], end: sel };
                        dispatch({ type: 'select', at });
                    }
                } else {
                    const { idx, path } = drag;
                    dispatch({
                        type: 'select',
                        at: [
                            {
                                start: [...path, { type: 'start', idx }],
                                end: [...path, { type: 'end', idx }],
                            },
                            {
                                start: sel,
                            },
                        ],
                    });
                }
            }
        };
        document.addEventListener('mouseup', up, { capture: true });
        document.addEventListener('mousemove', move);
        return () => {
            document.removeEventListener('mousemove', move);
            document.removeEventListener('mouseup', up, { capture: true });
        };
    }, [drag]);
    return {
        onMouseDownCapture: (evt: React.MouseEvent) => {
            let current = evt.target as HTMLElement;
            while (current && current !== document.body) {
                if (current.classList.contains('rich-text')) return;
                if (current.getAttribute('data-handle')) return;
                current = current.parentElement!;
            }
            if (evt.metaKey) {
                let current = evt.target as HTMLElement;
                while (current && current !== document.body) {
                    const raw = current.getAttribute('data-path');
                    if (raw != null) {
                        const path = JSON.parse(raw);
                        const idx = +current.getAttribute('data-idx')!;
                        dispatch({
                            type: 'select',
                            at: [
                                {
                                    start: [...path, { type: 'start', idx }],
                                    end: [...path, { type: 'end', idx }],
                                },
                            ],
                        });
                        evt.stopPropagation();
                        evt.preventDefault();
                        setDrag({ type: 'move', path, idx });
                        return;
                    }
                    current = current.parentElement!;
                }
                return;
            }

            setDrag('select');
        },
    };
}

// const;
