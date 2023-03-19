import React, { useLayoutEffect, useRef, useState } from 'react';
import { splitGraphemes } from '../../src/parse/parse';
import { Path } from '../store';
import { UIState, RegMap } from './ByHand';

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
                if (at.end) {
                    return;
                }
                const res: any = [];
                const box = calcCursorPos(at.start, state.regs);
                if (box) {
                    const offsetY = document.body.scrollTop;
                    const offsetX = document.body.scrollLeft;
                    res.push({
                        x: box.left - offsetX,
                        y: box.top - offsetY,
                        h: box.height,
                        color: box.color,
                    });
                }
                // if (at.end) {
                //     const box2 = calcCursorPos(at.end, state.regs);
                //     if (box2) {
                //         const offsetY = document.body.scrollTop;
                //         const offsetX = document.body.scrollLeft;
                //         res.push({
                //             x: box2.left - offsetX,
                //             y: box2.top - offsetY,
                //             h: box2.height,
                //             color: box2.color,
                //         });
                //     }
                // }
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
const subRect = (
    one: DOMRect,
    two: DOMRect,
    color?: string,
): { left: number; top: number; height: number; color?: string } => {
    return {
        left: one.left - two.left,
        top: one.top - two.top,
        height: one.height,
        color,
    };
};

export const calcCursorPos = (
    fullPath: Path[],
    regs: RegMap,
): void | { left: number; top: number; height: number; color?: string } => {
    const last = fullPath[fullPath.length - 1];
    // const loc = pathPos(fullPath)
    const idx = last.idx;
    // const { idx, loc } = sel;
    const nodes = regs[idx];
    if (!nodes) {
        console.error('no nodes, sorry');
        return;
    }
    try {
        switch (last.child.type) {
            case 'start':
            case 'end':
            case 'inside':
                const blinker = nodes[last.child.type];
                if (blinker) {
                    return subRect(
                        blinker.node.getBoundingClientRect(),
                        blinker.node.offsetParent!.getBoundingClientRect(),
                    );
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
                        last.child.type === 'start' ||
                        (last.child.type === 'subtext' && last.child.at === 0)
                    ) {
                        r.setStart(nodes.main.node.firstChild!, 0);
                        r.collapse(true);
                    } else if (
                        last.child.type === 'end' ||
                        (last.child.type === 'subtext' &&
                            last.child.at === text.length)
                    ) {
                        r.setStart(nodes.main.node.firstChild!, textRaw.length);
                        r.collapse(true);
                    } else if (last.child.type === 'subtext') {
                        r.setStart(
                            nodes.main.node.firstChild!,
                            text.slice(0, last.child.at).join('').length,
                        );
                        r.collapse(true);
                    } else {
                        // console.log('dunno loc', loc, nodes.main);
                        return;
                    }
                    const color = getComputedStyle(nodes.main.node).color;
                    return subRect(
                        r.getBoundingClientRect(),
                        nodes.main.node.offsetParent!.getBoundingClientRect(),
                        color,
                    );
                } else {
                    console.error('no box', last, nodes);
                    return;
                }
        }
    } catch (err) {
        return;
    }
};
