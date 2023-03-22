import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { splitGraphemes } from '../../src/parse/parse';
import { Ctx } from '../../src/to-ast/Ctx';
import { nodeForType } from '../../src/to-cst/nodeForType';
import { nodeToString } from '../../src/to-cst/nodeToString';
import { Path } from '../mods/path';
import { UIState, RegMap } from './ByHand';
import { selectWithin } from './calcOffset';

export const Menu = ({ state, ctx }: { state: UIState; ctx: Ctx }) => {
    const menu = useMemo(() => {
        if (state.at.length > 1 || state.at[0].end) return;
        const path = state.at[0].start;
        const last = path[path.length - 1];
        return { idx: last.idx, items: ctx.display[last.idx]?.autoComplete };
    }, [state.map, state.at, ctx]);

    if (!menu || !menu.items) return null;

    const node = state.regs[menu.idx]?.main?.node;
    if (!node) return null;

    const box = node.getBoundingClientRect();

    return (
        <div
            style={{
                position: 'absolute',
                top: box.bottom,
                left: box.left,
                gap: '0px 8px',
                padding: 8,
                maxHeight: 500,
                overflow: 'auto',
                zIndex: 1000,
                backgroundColor: 'black',
                border: '1px solid #ccc',
                display: 'grid',
                gridTemplateColumns: 'max-content max-content',
            }}
        >
            {menu.items?.map((item, i) => (
                <React.Fragment key={i}>
                    <div style={{ gridColumn: 1, padding: 4 }}>{item.text}</div>
                    <div style={{ gridColumn: 2, padding: 4 }}>
                        {item.type === 'replace'
                            ? nodeToString(nodeForType(item.ann, ctx))
                            : null}
                    </div>
                </React.Fragment>
            ))}
        </div>
    );
};

// const [menuPos, setMenuPos] = useState(
//     [] as ({ x: number; y: number; h: number; color?: string } | null)[],
// );
// useLayoutEffect(() => {
//     setMenuPos(
//         state.at.flatMap((at) => {
//             // if (at.end) {
//             //     return;
//             // }
//             const res: any = [];
//             const box = calcCursorPos(at.start, state.regs);
//             if (box) {
//                 const offsetY = document.body.scrollTop;
//                 const offsetX = document.body.scrollLeft;
//                 res.push({
//                     x: box.left - offsetX,
//                     y: box.top - offsetY,
//                     h: box.height,
//                     color: box.color,
//                 });
//             }
//             if (at.end) {
//                 const box2 = calcCursorPos(at.end, state.regs);
//                 if (box2) {
//                     const offsetY = document.body.scrollTop;
//                     const offsetX = document.body.scrollLeft;
//                     res.push({
//                         x: box2.left - offsetX,
//                         y: box2.top - offsetY,
//                         h: box2.height,
//                         color: box2.color,
//                     });
//                 }
//             }
//             return res;
//         }),
//     );
// }, [state.at]);

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
                if (at.end) {
                    const box2 = calcCursorPos(at.end, state.regs);
                    if (box2) {
                        const offsetY = document.body.scrollTop;
                        const offsetX = document.body.scrollLeft;
                        res.push({
                            x: box2.left - offsetX,
                            y: box2.top - offsetY,
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
        switch (last.type) {
            case 'start':
            case 'end':
            case 'inside':
                const blinker = nodes[last.type];
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
