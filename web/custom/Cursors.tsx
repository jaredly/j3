import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { splitGraphemes } from '../../src/parse/splitGraphemes';
import { Path } from '../../src/state/path';
import { UIState, RegMap } from './UIState';
import { selectWithin } from './calcOffset';
import { State } from '../../src/state/getKeyUpdate';
import { useGetStore } from './store/StoreCtx';

export const Cursors = ({
    at,
    regs,
}: {
    at: State['at'];
    regs: UIState['regs'];
}) => {
    const [blink, setBlink] = useState(false);

    const [cursorPos, setCursorPos] = useState(
        [] as ({ x: number; y: number; h: number; color?: string } | null)[],
    );

    const store = useGetStore();

    const tid = useRef(null as null | Timer);

    useEffect(() => {
        if (!at.length) return;
        const first = at[0].start;
        const got = first[first.length - 1].idx;
        const node = store.getState().map[got];
        if (node?.type === 'rich-text' || node?.type === 'raw-code') {
            return; // don't jump around for rich text
        }
        const found = regs[got]?.main ?? regs[got]?.outside;
        if (found) {
            const headerHeight =
                document
                    .getElementById('sticky-header')!
                    ?.getBoundingClientRect().height ?? 0;

            const box = found.node.getBoundingClientRect();
            if (box.top < headerHeight || box.bottom > window.innerHeight) {
                const dist =
                    box.top < 0 ? -box.top : box.bottom - window.innerHeight;
                found.node.style.scrollMarginTop = headerHeight + 'px';
                found.node.scrollIntoView({
                    behavior: dist > 300 ? 'smooth' : 'instant',
                    block: 'nearest',
                });
            }
        }
    }, [at]);

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
            at.flatMap((at) => {
                // if (at.end) {
                //     return;
                // }
                const res: any = [];
                const box = calcCursorPos(at.end ?? at.start, regs, true);
                if (box) {
                    res.push({
                        x: box.left,
                        y: box.top,
                        h: box.height,
                        color: box.color,
                    });
                }
                // if (at.end) {
                //     const box2 = calcCursorPos(at.end, regs, true);
                //     if (box2) {
                //         res.push({
                //             x: box2.left,
                //             y: box2.top,
                //             h: box2.height,
                //             color: box2.color,
                //         });
                //     }
                // }
                return res;
            }),
        );
    }, [at]);

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

export type CursorRect = {
    left: number;
    top: number;
    height: number;
    bottom: number;
    right: number;
    color?: string;
};

export const subRect = (
    one: DOMRect,
    two: DOMRect,
    color?: string,
): CursorRect => {
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
    if (last.type === 'rich-text') return;
    // const loc = pathPos(fullPath)
    const idx = last.idx;
    // const { idx, loc } = sel;
    const nodes = regs[idx];
    if (!nodes) {
        console.error('no nodes, sorry');
        // console.log(regs);
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
                            r.collapse(true);
                        }
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
