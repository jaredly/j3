import React, { useEffect, useMemo, useRef } from 'react';
import { Path } from '../../src/state/path';
// import { ReactCodeJar } from 'react-codejar';
import { CodeJar } from 'codejar';
import { useGetStore } from './store/StoreCtx';
import { lastPath, useAutoFocus } from './useAutoFocus';
import { newNodeAfter } from '../../src/state/newNodeBefore';
import { NewThing } from '../../src/state/getKeyUpdate';

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

    const focus = useRef(null as null | (() => void));

    useEffect(() => {
        if (!ref.current) return;
        const jar = CodeJar(ref.current, () => {}, {
            tab: '  ',
            addClosing: false,
        });
        jar.updateCode(initial);
        jar.onUpdate((code) => {
            const node = store.getState().map[idx];
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
        };
        return () => jar.destroy();
    }, []);

    useAutoFocus(store, idx, 'raw-code', () => focus.current?.());

    return (
        <div
            style={{
                backgroundColor: '#224',
                padding: 8,
            }}
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
                onKeyDown={(evt) => {
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
                    console.log('doing a focus');
                    const last = lastPath(store.getState());
                    if (last?.idx === idx && last.type === 'rich-text') {
                        console.log('alread focused');
                        return;
                    }
                    console.log('sleecttt', last);
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
