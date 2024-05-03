import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Path } from '../../src/state/path';
// import { ReactCodeJar } from 'react-codejar';
import { CodeJar } from 'codejar';
import { useGetStore, useSubscribe } from './store/StoreCtx';
import { lastPath, useAutoFocus } from './useAutoFocus';
import { newNodeAfter } from '../../src/state/newNodeBefore';
import { NewThing } from '../../src/state/getKeyUpdate';
import { useLatest } from './useLatest';

export const RawCode = ({
    initial,
    lang,
    path,
    idx,
}: {
    initial: string;
    lang: string;
    path: Path[];
    idx: number;
}) => {
    const store = useGetStore();
    const ref = useRef<HTMLDivElement>(null);
    const toplevel = path[path.length - 1].type === 'ns-top';

    const focus = useRef(null as null | (() => void));

    const raw = useSubscribe(
        () => {
            const node = store.getState().map[idx];
            return node?.type === 'raw-code' ? node.raw : null;
        },
        (fn) => store.onChange(idx, fn),
        [idx],
    );

    const jar = useRef<ReturnType<typeof CodeJar>>();
    useEffect(() => {
        if (!jar.current || raw == null) return;
        if (jar.current.toString() !== raw) {
            const pos = jar.current.save();
            jar.current.updateCode(raw);
            jar.current.restore(pos);
        }
    }, [raw]);

    useEffect(() => {
        if (!ref.current) return;
        jar.current = CodeJar(
            ref.current,
            (el) => {
                // @ts-ignore
                const html = Prism.highlight(
                    el.textContent,
                    // @ts-ignore
                    Prism.languages.javascript,
                    'javascript',
                );
                el.innerHTML = html;
            },
            {
                tab: '  ',
                addClosing: false,
                history: false,
            },
        );
        jar.current.updateCode(initial);
        jar.current.onUpdate((code) => {
            const node = store.getState().map[idx];
            if (!node) return;
            if (node.type === 'raw-code' && node.raw === code) return;
            store.dispatch({
                type: 'update',
                map: {
                    [idx]: {
                        type: 'raw-code',
                        lang,
                        raw: code,
                        loc: idx,
                    },
                },
                selection: path.concat([{ type: 'rich-text', idx, sel: null }]),
            });
        });
        focus.current = () => {
            if (document.activeElement === ref.current) return;
            ref.current?.focus();
            setTimeout(() => ref.current?.focus(), 100);
        };
        return () => jar.current?.destroy();
    }, []);

    useAutoFocus(store, idx, 'rich-text', () => {
        if (!focus.current) {
            console.log('dropping a focus');
        }
        focus.current?.();
    });
    console.log(store.getState().at);

    return (
        <div
            style={{
                // backgroundColor: '#224',
                backgroundColor: 'rgb(28 28 28)',
                // padding: 8,
                padding: toplevel ? 8 : '0 8px',
                borderRadius: 4,
            }}
            className="language-javascript"
            onMouseDown={(evt) => evt.stopPropagation()}
            onClick={(evt) => {
                evt.stopPropagation();
                focus.current?.();
            }}
        >
            {/* <textarea defaultValue={initial} /> */}
            <div
                className="editor"
                ref={ref}
                onMouseDown={(evt) => evt.stopPropagation()}
                onClick={(evt) => evt.stopPropagation()}
                onKeyDownCapture={(evt) => {
                    if (evt.key === 'z' && evt.metaKey) {
                        evt.stopPropagation();
                        evt.preventDefault();
                        store.dispatch({
                            type: evt.shiftKey ? 'redo' : 'undo',
                        });
                        return;
                    }
                    if (evt.key === 'Enter' && evt.metaKey) {
                        const state = store.getState();
                        const nidx = state.nidx();
                        const nn: NewThing = {
                            map: {
                                [nidx]: {
                                    type: 'raw-code',
                                    lang: 'javascript',
                                    loc: nidx,
                                    raw: '',
                                },
                            },
                            idx: nidx,
                            selection: [
                                { idx: nidx, type: 'rich-text', sel: null },
                            ],
                        };
                        const up = newNodeAfter(
                            path,
                            state.map,
                            state.nsMap,
                            nn,
                            state.nidx,
                        );
                        if (up) {
                            evt.preventDefault();
                            evt.currentTarget.blur();
                            store.dispatch(up);
                        }
                    }
                }}
                onFocus={() => {
                    // console.log('doing a focus');
                    const last = lastPath(store.getState());
                    if (last?.idx === idx && last.type === 'rich-text') {
                        // console.log('alread focused');
                        return;
                    }
                    // console.log('sleecttt', last);
                    store.dispatch({
                        type: 'select',
                        at: [
                            {
                                start: path.concat([
                                    {
                                        type: 'rich-text',
                                        idx,
                                        sel: null,
                                    },
                                ]),
                            },
                        ],
                    });
                }}
            />
        </div>
    );
};
