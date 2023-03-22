import React, { useEffect, useRef } from 'react';
import {
    type ClipboardItem,
    clipboardText,
    collectClipboard,
} from '../mods/clipboard';
import { UIState, Action, clipboardPrefix, clipboardSuffix } from './ByHand';

export function HiddenInput({
    state,
    dispatch,
    menuCount,
}: {
    state: UIState;
    dispatch: React.Dispatch<Action>;
    menuCount?: number;
}) {
    useEffect(() => {
        if (document.activeElement !== hiddenInput.current) {
            hiddenInput.current?.focus();
        }
    }, [state.at]);

    useEffect(() => {
        window.addEventListener(
            'blur',
            (evt) => {
                setTimeout(() => {
                    if (document.activeElement === document.body) {
                        hiddenInput.current?.focus();
                    }
                }, 50);
            },
            true,
        );
    }, []);

    const hiddenInput = useRef(null as null | HTMLInputElement);

    return (
        <input
            ref={hiddenInput}
            autoFocus
            value="whaa"
            style={{
                width: 0,
                height: 0,
                opacity: 0,
                position: 'fixed',
                top: 0,
                left: 0,
                border: 'none',
                pointerEvents: 'none',
            }}
            onCopy={(evt) => {
                evt.preventDefault();
                const items = collectClipboard(state.map, state.at);
                if (!items.length) {
                    return;
                }

                dispatch({ type: 'copy', items });

                const text = clipboardText(items);
                navigator.clipboard.write([
                    new ClipboardItem({
                        ['text/plain']: new Blob([text], {
                            type: 'text/plain',
                        }),
                        ['text/html']: new Blob(
                            [
                                clipboardPrefix +
                                    JSON.stringify(items) +
                                    clipboardSuffix +
                                    text,
                            ],
                            { type: 'text/html' },
                        ),
                    }),
                ]);
            }}
            onPaste={(evt) => {
                evt.preventDefault();
                const text = evt.clipboardData.getData('text/html');
                if (text) {
                    const start = text.indexOf(clipboardPrefix);
                    const end = text.indexOf(clipboardSuffix);
                    if (start !== -1 && end !== -1) {
                        const sub = text.slice(
                            start + clipboardPrefix.length,
                            end,
                        );
                        try {
                            const items: ClipboardItem[] = JSON.parse(sub);
                            dispatch({ type: 'paste', items });
                        } catch (err) {
                            console.error(err);
                        }
                    }
                    return;
                }
                const plain = evt.clipboardData.getData('text/plain');
                if (plain) {
                    dispatch({
                        type: 'paste',
                        items: [{ type: 'text', text: plain, trusted: false }],
                    });
                }
            }}
            onKeyDown={(evt) => {
                if (evt.metaKey || evt.ctrlKey || evt.altKey) {
                    return;
                }

                evt.stopPropagation();
                evt.preventDefault();

                if (menuCount != null) {
                    if (evt.key === 'ArrowDown' || evt.key === 'ArrowUp') {
                        dispatch({
                            type: 'menu',
                            selection:
                                ((state.menu?.selection ?? 0) +
                                    (evt.key === 'ArrowDown' ? 1 : -1) +
                                    menuCount) %
                                menuCount,
                        });
                        return;
                    }
                }

                if (evt.key !== 'Unidentified') {
                    dispatch({
                        type: 'key',
                        key: evt.key,
                        mods: {
                            shift: evt.shiftKey,
                            alt: evt.altKey,
                            meta: evt.metaKey,
                        },
                    });
                }
            }}
            onInput={(evt) => {
                if (evt.currentTarget.value) {
                    dispatch({
                        type: 'key',
                        key: evt.currentTarget.value,
                        mods: {},
                    });
                    evt.currentTarget.value = '';
                }
            }}
            onCompositionStart={(evt) => {
                console.log(evt);
            }}
            onCompositionEnd={(evt) => {
                console.log('end', evt);
            }}
            onCompositionUpdate={(evt) => {
                console.log('update', evt);
            }}
        />
    );
}
