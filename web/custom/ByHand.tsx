import React, { useCallback, useEffect, useRef, useState } from 'react';
import { idText, parseByCharacter, selPos } from '../../src/parse/parse';
import { newCtx } from '../../src/to-ast/Ctx';
import { nodeToExpr } from '../../src/to-ast/nodeToExpr';
import {
    nodeToString,
    remapPos,
    SourceMap,
} from '../../src/to-cst/nodeToString';
import { fromMCST, ListLikeContents, Map } from '../../src/types/mcst';
import { layout } from '../layout';
import { getKeyUpdate } from '../mods/getKeyUpdate';
import { PathSel, selectEnd } from '../mods/navigate';
import { Selection } from '../store';
import { Render } from './Render';

const initialText =
    '(fn [one:two three:(four five)]:six {10 20 yes "ok ${(some [2 3 "inner" ..more] ..things)} and ${a}"})';

export type State = {
    map: Map;
    root: number;
    at: PathSel;
};

type RegMap = {
    [key: number]: {
        main?: HTMLSpanElement | null;
        start?: HTMLSpanElement | null;
        end?: HTMLSpanElement | null;
        inside?: HTMLSpanElement | null;
    };
};

export const ByHand = () => {
    const [state, setState] = React.useState(() => {
        const map = parseByCharacter(initialText).map;
        const idx = (map[-1] as ListLikeContents).values[0];
        const at = selectEnd(
            idx,
            [{ idx: -1, child: { type: 'child', at: 0 } }],
            map,
        )!;
        return { map, root: -1, at } as State;
    });

    const { back, sourceMap } = React.useMemo(() => {
        const sourceMap: SourceMap = { map: {}, cur: 0 };
        const back = nodeToString(fromMCST(state.root, state.map), sourceMap);
        return { back, sourceMap };
    }, [state.root, state.map]);

    const pos = remapPos(state.at.sel, sourceMap);

    const [blink, setBlink] = useState(false);

    const tops = (state.map[state.root] as ListLikeContents).values;

    const ctx = React.useMemo(() => {
        const ctx = newCtx();
        nodeToExpr(fromMCST(state.root, state.map), ctx);
        tops.forEach((top) => {
            layout(top, 0, state.map, ctx.display, true);
        });
        return ctx;
    }, [state.map]);

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
                    const newState = handleKey(state, evt.key);
                    if (newState) {
                        evt.preventDefault();
                        return newState;
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

    const regs = React.useMemo(() => ({} as RegMap), []);

    const reg = useCallback(
        (
            node: HTMLSpanElement | null,
            idx: number,
            loc?: 'start' | 'end' | 'inside',
        ) => {
            if (!regs[idx]) {
                regs[idx] = {};
            }
            regs[idx][loc ?? 'main'] = node;
        },
        [],
    );

    useEffect(() => {
        const box = calcCursorPos(state.at.sel, regs);
        if (box) {
            setCursorPos({ x: box.left, y: box.top, h: box.height });
        }
    }, [state.at.sel]);

    return (
        <div style={{ padding: 16 }}>
            {tops.map((top, i) => (
                <div key={top}>
                    <Render
                        idx={top}
                        state={state}
                        reg={reg}
                        display={ctx.display}
                        path={[
                            {
                                idx: state.root,
                                child: { type: 'child', at: i },
                            },
                        ]}
                    />
                </div>
            ))}
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
            {/* <div>{JSON.stringify(state.at)}</div>
            <div style={{ whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(ctx.display, null, 2)}
            </div> */}
        </div>
    );
};

export const calcCursorPos = (sel: Selection, regs: RegMap): void | DOMRect => {
    const { idx, loc } = sel;
    const nodes = regs[idx];
    if (!nodes) {
        console.error('no nodes, sorry');
        return;
    }
    const blinker = nodes[loc as 'start'];
    if (blinker) {
        return blinker.getBoundingClientRect();
    } else if (nodes.main) {
        const r = new Range();
        r.selectNode(nodes.main);
        const text = nodes.main.textContent!;
        if (!nodes.main.firstChild) {
            // nothing to do here
        } else if (loc === 'start' || loc === 0) {
            r.setStart(nodes.main.firstChild!, 0);
            r.collapse(true);
        } else if (loc === 'end' || loc === text.length) {
            r.setStart(nodes.main.firstChild!, text.length);
            r.collapse(true);
        } else if (typeof loc === 'number') {
            r.setStart(nodes.main.firstChild!, loc);
            r.collapse(true);
        } else {
            console.log('dunno loc', loc, nodes.main);
            return;
        }
        return r.getBoundingClientRect();
    } else {
        console.error('no box', loc, nodes);
        return;
    }
};

export const handleKey = (state: State, key: string): State | void => {
    const curText = idText(state.map[state.at.sel.idx]) ?? '';
    const pos = selPos(state.at.sel, curText);

    const update = getKeyUpdate(
        key,
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
        return {
            ...state,
            at: { sel: update.selection, path: update.path },
        };
    }
};
