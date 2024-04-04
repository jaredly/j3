import React, { useEffect, useRef } from 'react';
import { AutoCompleteResult, Ctx } from '../../src/to-ast/Ctx';
import {
    type ClipboardItem,
    clipboardText,
    collectClipboard,
} from '../../src/state/clipboard';
import { Path } from '../../src/state/path';
import { clipboardPrefix, clipboardSuffix } from './ByHand';
import { UIState, Action, NUIState } from './UIState';
import { getRegNode } from './Hover';
import equal from 'fast-deep-equal';
import { splitGraphemes } from '../../src/parse/parse';
import { goRight } from '../../src/state/navigate';
// import { Ctx } from '../../src/to-ast/library';

export function HiddenInput({
    state,
    dispatch,
    menu,
    display,
    hashNames,
}: {
    state: NUIState;
    dispatch: React.Dispatch<Action>;
    menu?: { path: Path[]; items: AutoCompleteResult[] };
    hashNames: { [hash: string]: string };
    display: Ctx['display'];
}) {
    useEffect(() => {
        if (
            document.activeElement !== hiddenInput.current &&
            !document.activeElement?.classList.contains('bn-editor')
        ) {
            // console.log(document.activeElement);
            hiddenInput.current?.focus();
        }
    }, [state.at]);

    useEffect(() => {
        const key = (evt: KeyboardEvent) => {
            if (evt.key === 'd' && evt.metaKey) {
                evt.preventDefault();
            }
        };
        window.addEventListener('keydown', key);
        const fn = () => {
            setTimeout(() => {
                if (document.activeElement === document.body) {
                    hiddenInput.current?.focus();
                }
            }, 50);
        };
        window.addEventListener('blur', fn, true);
        return () => {
            window.removeEventListener('keydown', key);
            window.removeEventListener('blur', fn, true);
        };
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
                const items = collectClipboard(state, hashNames);
                if (!items.length) {
                    return;
                }

                dispatch({ type: 'copy', items });

                const text = clipboardText(items, display);
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
                // TODO: We should do rich copy/paste!
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
                if (evt.key === 'z' && (evt.metaKey || evt.ctrlKey)) {
                    evt.preventDefault();
                    evt.stopPropagation();
                    return dispatch({ type: evt.shiftKey ? 'redo' : 'undo' });
                }

                if (evt.key === 'Escape' && state.at.length > 0) {
                    return dispatch({
                        type: 'select',
                        at: [
                            {
                                start: state.at[0].start,
                            },
                        ],
                    });
                }

                if (evt.metaKey && evt.key === 'd') {
                    evt.preventDefault();
                    const sel = state.at[0];
                    if (!sel) return;
                    const last = sel.start[sel.start.length - 1];
                    if (last.type !== 'subtext') return;
                    if (sel.end) {
                        if (last.at !== 0) return;
                        if (sel.end.length !== sel.start.length) return;
                        const lend = sel.end[sel.end.length - 1];
                        if (lend.type !== 'subtext') return;
                        if (
                            !equal(sel.start.slice(0, -1), sel.end.slice(0, -1))
                        )
                            return;
                        const node = state.map[last.idx];
                        if (node.type !== 'identifier') return;
                        const eme = splitGraphemes(node.text);
                        if (lend.at !== eme.length) return;
                        // TODO do another sel
                        // let next = sel.start
                        let current = state.at[state.at.length - 1].start;
                        for (let i = 0; i < 10000; i++) {
                            const next = goRight(
                                current,
                                state.map,
                                state.nsMap,
                                state.cards,
                            );
                            if (!next) return;
                            const last =
                                next.selection[next.selection.length - 1];
                            const candidate = state.map[last.idx];
                            if (
                                candidate.type === 'identifier' &&
                                candidate.text === node.text
                            ) {
                                return dispatch({
                                    type: 'select',
                                    at: state.at.concat([
                                        {
                                            start: next.selection
                                                .slice(0, -1)
                                                .concat([
                                                    {
                                                        type: 'subtext',
                                                        idx: candidate.loc,
                                                        at: 0,
                                                    },
                                                ]),
                                            end: next.selection
                                                .slice(0, -1)
                                                .concat([
                                                    {
                                                        type: 'subtext',
                                                        idx: candidate.loc,
                                                        at: eme.length,
                                                    },
                                                ]),
                                        },
                                    ]),
                                });
                            }
                            current = next.selection;
                        }
                    }

                    const node = state.map[last.idx];
                    if (node.type === 'identifier') {
                        const text = node.text;
                        const eme = splitGraphemes(text);
                        return dispatch({
                            type: 'select',
                            at: [
                                {
                                    start: sel.start.slice(0, -1).concat([
                                        {
                                            type: 'subtext',
                                            idx: node.loc,
                                            at: 0,
                                        },
                                    ]),
                                    end: sel.start.slice(0, -1).concat([
                                        {
                                            type: 'subtext',
                                            idx: node.loc,
                                            at: eme.length,
                                        },
                                    ]),
                                },
                            ],
                        });
                    }
                }

                if (evt.key === 'Alt') {
                    const sel = state.hover[state.hover.length - 1]?.idx;
                    const node = sel ? state.map[sel] : null;
                    if (node?.type === 'identifier') {
                        const num = +node.text;
                        const got = state.regs[num];
                        const n =
                            got?.main?.node ??
                            got?.outside?.node ??
                            got?.start?.node;

                        if (n) {
                            n.style.backgroundColor = 'rgba(255,0,0,0.9)';
                            setTimeout(() => {
                                n.style.backgroundColor = 'unset';
                            }, 5000);
                        }
                    }
                }

                if (evt.key === 'Backspace' && evt.metaKey) {
                    // it's fine
                } else if (evt.metaKey || evt.ctrlKey || evt.altKey) {
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
                        } else if (selected.type === 'update') {
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
