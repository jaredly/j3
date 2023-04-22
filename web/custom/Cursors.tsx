import React, { useLayoutEffect, useRef, useState } from 'react';
import { splitGraphemes } from '../../src/parse/parse';
import { Path } from '../mods/path';
import { UIState, RegMap } from './UIState';
import { selectWithin } from './calcOffset';

export const Cursors = ({ state }: { state: UIState }) => {
    const [blink, setBlink] = useState(false);

    const [cursorPos, setCursorPos] = useState(
        [] as ({ x: number; y: number; h: number; color?: string } | null)[],
    );

    const tid = useRef(null as null | NodeJS.Timeout);

    useLayoutEffect(() => {
        if (tid.current != null) {
            clearTimeout(tid.current);
        } else {
            setBlink(false);
        }
        tid.current = setTimeout(() => {
            setBlink(true);
            tid.current = null;
        }, 500);
        setCursorPos(
            state.at.flatMap((at) => {
                // if (at.end) {
                //     return;
                // }
                const res: any = [];
                const box = calcCursorPos(at.start, state.regs, true);
                if (box) {
                    res.push({
                        x: box.left,
                        y: box.top,
                        h: box.height,
                        color: box.color,
                    });
                }
                if (at.end) {
                    const box2 = calcCursorPos(at.end, state.regs, true);
                    if (box2) {
                        res.push({
                            x: box2.left,
                            y: box2.top,
                            h: box2.height,
                            color: box2.color,
                        });
                    }
                }
                return res;
            }),
        );
    }, [state.at]);

    return (
        <div>
            {cursorPos.map((cursorPos, i) =>
                cursorPos ? (
                    <div
                        key={i}
                        style={{
                            position: 'absolute',
                            width: 1,
                            pointerEvents: 'none',
                            backgroundColor: cursorPos.color ?? 'white',
                            left: cursorPos.x,
                            height: cursorPos.h,
                            top: cursorPos.y,
                            animationDuration: '1s',
                            animationName: blink ? 'blink' : 'unset',
                            animationIterationCount: 'infinite',
                        }}
                    />
                ) : null,
            )}
        </div>
    );
};

export const subRect = (
    one: DOMRect,
    two: DOMRect,
    color?: string,
): {
    left: number;
    top: number;
    height: number;
    bottom: number;
    right: number;
    color?: string;
} => {
    return {
        left: one.left - two.left,
        top: one.top - two.top,
        height: one.height,
        bottom: one.top - two.top + one.height,
        right: one.left - two.left + one.width,
        color,
    };
};

export const calcCursorPos = (
    fullPath: Path[],
    regs: RegMap,
    relative?: boolean,
): void | { left: number; top: number; height: number; color?: string } => {
    const last = fullPath[fullPath.length - 1];
    // const loc = pathPos(fullPath)
    const idx = last.idx;
    // const { idx, loc } = sel;
    const nodes = regs[idx];
    if (!nodes) {
        console.error('no nodes, sorry');
        console.log(regs);
        return;
    }
    try {
        switch (last.type) {
            case 'start':
            case 'end':
            case 'inside':
                const blinker = nodes[last.type];
                if (blinker) {
                    return relative
                        ? subRect(
                              blinker.node.getBoundingClientRect(),
                              blinker.node.offsetParent!.getBoundingClientRect(),
                          )
                        : blinker.node.getBoundingClientRect();
                }
            case 'subtext':
                if (nodes.main) {
                    const r = new Range();
                    r.selectNode(nodes.main.node);
                    const textRaw = nodes.main.node.textContent!;
                    const text = splitGraphemes(textRaw);
                    if (!nodes.main.node.firstChild) {
                        // nothing to do here
                    } else if (
                        last.type === 'start' ||
                        (last.type === 'subtext' && last.at === 0)
                    ) {
                        let fc = nodes.main.node.firstChild;
                        if (fc.nodeName !== '#text') {
                            fc = fc.firstChild!;
                        }
                        r.setStart(fc!, 0);
                        r.collapse(true);
                    } else if (
                        last.type === 'end' ||
                        (last.type === 'subtext' && last.at === text.length)
                    ) {
                        let lc = nodes.main.node.lastChild!;
                        if (lc.nodeName !== '#text') {
                            lc = lc.lastChild!;
                        }
                        if (!lc.textContent) {
                            return;
                        }
                        r.setStart(lc, lc.textContent!.length);
                        r.collapse(true);
                    } else if (last.type === 'subtext') {
                        const left = selectWithin(nodes.main.node, last.at, r);
                        if (left !== 0) {
                            console.error(
                                'no select within',
                                nodes.main.node,
                                last.at,
                            );
                            r.setStart(nodes.main.node.firstChild!, 0);
                        }
                        r.collapse(true);
                    } else {
                        return;
                    }
                    const color = getComputedStyle(nodes.main.node).color;
                    return relative
                        ? subRect(
                              r.getBoundingClientRect(),
                              nodes.main.node.offsetParent!.getBoundingClientRect(),
                              color,
                          )
                        : r.getBoundingClientRect();
                } else {
                    console.error('no box', last, nodes);
                    return;
                }
        }
    } catch (err) {
        console.error(err);
        return;
    }
};
