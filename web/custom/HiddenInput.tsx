import React, { useEffect, useRef } from 'react';
import { AutoCompleteResult, Ctx } from '../../src/to-ast/Ctx';
import {
    type ClipboardItem,
    clipboardText,
    collectClipboard,
} from '../mods/clipboard';
import { Path } from '../mods/path';
import { UIState, Action, clipboardPrefix, clipboardSuffix } from './ByHand';

export function HiddenInput({
    state,
    dispatch,
    menu,
    ctx,
}: {
    state: UIState;
    dispatch: React.Dispatch<Action>;
    menu?: { path: Path[]; items: AutoCompleteResult[] };
    ctx: Ctx;
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
                const items = collectClipboard(
                    state.map,
                    state.at,
                    ctx.display,
                );
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

                if (menu != null) {
                    if (
                        menu.items.length > 1 &&
                        (evt.key === 'ArrowDown' || evt.key === 'ArrowUp')
                    ) {
                        dispatch({
                            type: 'menu',
                            selection:
                                ((state.menu?.selection ?? 0) +
                                    (evt.key === 'ArrowDown' ? 1 : -1) +
                                    menu.items.length) %
                                menu.items.length,
                        });
                        return;
                    }

                    if (evt.key === 'Enter') {
                        const selected = menu.items[state.menu?.selection ?? 0];
                        if (!selected) {
                            console.warn(
                                `selected a menu item that wasn't there`,
                            );
                        } else if (selected.type === 'replace') {
                            dispatch({
                                type: 'menu-select',
                                path: menu.path,
                                item: selected,
                            });
                        }
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
