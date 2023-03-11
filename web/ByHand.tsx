import React, { useEffect, useRef, useState } from 'react';
import { idText, parseByCharacter, selPos } from '../src/parse/parse';
import { nodeToString, remapPos, SourceMap } from '../src/to-cst/nodeToString';
import { fromMCST, ListLikeContents } from '../src/types/mcst';
import { getKeyUpdate } from './mods/getKeyUpdate';
import { selectEnd } from './mods/navigate';

const initialText =
    '(fn [one:two three:(four five)]:six {10 20 yes "ok ${(some [2 3 "inner" ..more] ..things)} and ${a}"})';

export const ByHand = () => {
    const [state, setState] = React.useState(() => {
        const map = parseByCharacter(initialText).map;
        const idx = (map[-1] as ListLikeContents).values[0];
        const at = selectEnd(
            idx,
            [{ idx: -1, child: { type: 'child', at: 0 } }],
            map,
        )!;
        return { map, root: idx, at };
    });

    const { back, sourceMap } = React.useMemo(() => {
        const sourceMap: SourceMap = { map: {}, cur: 0 };
        const back = nodeToString(fromMCST(state.root, state.map), sourceMap);
        return { back, sourceMap };
    }, [state.root, state.map]);

    const pos = remapPos(state.at.sel, sourceMap);
    console.log(state);

    const [blink, setBlink] = useState(false);

    React.useEffect(() => {
        let tid: null | NodeJS.Timeout = null;
        const fn = (evt: KeyboardEvent) => {
            if (evt.ctrlKey || evt.metaKey || evt.altKey) {
                return;
            }

            if (tid != null) {
                clearTimeout(tid);
            }
            setBlink(false);
            tid = setTimeout(() => setBlink(true), 500);

            setState((state) => {
                try {
                    const curText = idText(state.map[state.at.sel.idx]) ?? '';
                    const pos = selPos(state.at.sel, curText);

                    const update = getKeyUpdate(
                        evt.key,
                        pos,
                        curText,
                        state.at.sel.idx,
                        state.at.path,
                        state.map,
                    );
                    if (update?.type === 'update' && update?.update) {
                        console.log('wat');
                        const map = { ...state.map };
                        Object.keys(update.update.map).forEach((key) => {
                            if (update.update!.map[+key] == null) {
                                delete map[+key];
                            } else {
                                map[+key] = update.update!.map[+key]!;
                            }
                        });
                        return {
                            ...state,
                            map,
                            at: {
                                sel: update.update.selection,
                                path: update.update.path,
                            },
                        };
                        // selection = update.update.selection;
                        // path = update.update.path;
                    } else if (update?.type === 'select') {
                        console.log('settings');
                        return {
                            ...state,
                            at: { sel: update.selection, path: update.path },
                        };
                    }
                } catch (err) {
                    console.log(err);
                }
                return state;
            });
        };
        document.addEventListener('keydown', fn);
        return () => document.removeEventListener('keydown', fn);
    }, []);

    const [cursorPos, setCursorPos] = useState(
        null as null | { x: number; y: number; h: number },
    );

    const ref = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (!ref.current) {
            return;
        }
        const r = new Range();
        r.setStart(ref.current.firstChild!, pos);
        r.setEnd(ref.current.firstChild!, pos);
        const box = r.getBoundingClientRect();
        setCursorPos({
            x: box.left,
            y: box.top,
            h: box.height,
        });
    }, [pos]);

    return (
        <div style={{ padding: 16 }}>
            <span ref={ref} style={{ whiteSpace: 'pre' }}>
                {back}
            </span>
            {cursorPos ? (
                <div
                    style={{
                        position: 'absolute',
                        width: 1,
                        backgroundColor: 'white',
                        left: cursorPos.x,
                        height: cursorPos.h,
                        top: cursorPos.y,
                        animationDuration: '1s',
                        animationName: blink ? 'blink' : 'unset',
                        animationIterationCount: 'infinite',
                    }}
                />
            ) : null}
            <div>{JSON.stringify(state.at)}</div>
        </div>
    );
};
