import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { lightColor } from './colors';

export const Cursor = ({ innerRef, rich }: { rich?: boolean; innerRef?: (node: HTMLSpanElement | null) => void }) => (
    <span
        ref={innerRef}
        style={{
            display: 'inline-block',
            width: 1,
            marginRight: 0,
            marginLeft: -1,
            backgroundColor: 'red',
            position: 'relative',
            pointerEvents: 'none',
        }}
    >
        {rich ? <span style={{ position: 'absolute', top: 0, left: -1, width: 3, height: 3, borderRadius: '50%', backgroundColor: 'red' }} /> : null}
        {rich ? (
            <span style={{ position: 'absolute', bottom: 0, left: -1, width: 3, height: 3, borderRadius: '50%', backgroundColor: 'red' }} />
        ) : null}
        {'\u200B'}
    </span>
);

const useResizeTick = () => {
    const [tick, setTick] = useState(0);
    useEffect(() => {
        const fn = () => setTick((t) => t + 1);
        window.addEventListener('resize', fn);
        return () => window.removeEventListener('resize', fn);
    }, []);
    return tick;
};

export const TextWithCursor = ({
    text,
    // left,
    // right,
    onMouseDown,
    onMouseMove,
    innerRef,
    cursorRef,
    cursors,
    highlight,
    rich,
}: {
    innerRef?: (span: HTMLSpanElement) => void;
    cursorRef?: (span: HTMLSpanElement) => void;
    text: string[];
    cursors: number[];
    highlight?: { start?: number; end?: number }[] | boolean;
    // left: number;
    // right: number;
    rich?: boolean;
    onMouseDown: React.ComponentProps<'span'>['onMouseDown'];
    onMouseMove: React.ComponentProps<'span'>['onMouseMove'];
}) => {
    const ref = useRef<HTMLSpanElement>();
    type Rect = {
        width: number;
        height: number;
        left: number;
        top: number;
    }[];

    const [rects, setRects] = useState(null as null | Rect);
    const tick = useResizeTick();

    useLayoutEffect(() => {
        if (!ref.current) return;

        if (text.length === 0) {
            const box = ref.current.getBoundingClientRect();
            return setRects([{ width: 1, height: box.height, left: 0, top: 0 }]);
        }

        let rects: DOMRect[] = [];

        const range = new Range();

        if (highlight) {
            const hls = highlight === true ? [{}] : highlight;
            const fc = ref.current.firstChild!;
            hls.forEach((highlight) => {
                range.setStart(fc, text.slice(0, highlight.start ?? 0).join('').length);
                range.setEnd(fc, text.slice(0, highlight.end ?? text.length).join('').length);
                rects.push(...range.getClientRects());
            });
        }

        cursors.forEach((at) => {
            const cat = text.slice(0, at).join('').length;
            range.setStart(ref.current!.firstChild!, cat);
            range.setEnd(ref.current!.firstChild!, cat);
            rects.push(...range.getClientRects());
        });

        range.setStart(ref.current.firstChild!, 0);
        range.setEnd(ref.current.firstChild!, 0);
        const rbox = range.getBoundingClientRect();

        setRects(
            rects.map((rect) => ({
                width: Math.max(1, rect.width),
                height: rect.height,
                left: rect.left - rbox.left,
                top: rect.top - rbox.top,
            })),
        );
    }, [text, highlight, tick, cursors]);

    return (
        <span style={{ position: 'relative' }}>
            <span
                ref={(span) => {
                    if (span) {
                        innerRef?.(span);
                        ref.current = span;
                    }
                }}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                style={{ zIndex: 1, position: 'relative' }}
            >
                {text.length ? text.join('') : <Zwd />}
            </span>
            {rects?.length === 1 && rects[0].width === 1 ? (
                <span
                    ref={cursorRef}
                    style={{
                        ...rects[0],
                        position: 'absolute',
                        backgroundColor: rich ? 'teal' : 'red',
                        opacity: 1,
                    }}
                >
                    {rich ? (
                        <span style={{ position: 'absolute', top: 0, left: -1, width: 3, height: 3, borderRadius: '50%', backgroundColor: 'teal' }} />
                    ) : null}
                    {rich ? (
                        <span
                            style={{ position: 'absolute', bottom: 0, left: -1, width: 3, height: 3, borderRadius: '50%', backgroundColor: 'teal' }}
                        />
                    ) : null}
                    {/* {rich ? <span style={{ position: 'absolute', bottom: 0, left: -2, width: 5, height: 1, backgroundColor: 'red' }} /> : null} */}
                    {/* {rich ? <span style={{ position: 'absolute', top: 0, left: -2, width: 5, height: 1, backgroundColor: 'red' }} /> : null}
                    {rich ? <span style={{ position: 'absolute', bottom: 0, left: -2, width: 5, height: 1, backgroundColor: 'red' }} /> : null} */}
                </span>
            ) : (
                rects?.map((rect, i) => (
                    <span
                        key={i}
                        ref={i === 0 && rect.width === 1 ? cursorRef : null}
                        style={{
                            ...rect,
                            position: 'absolute',
                            backgroundColor: rect.width === 1 ? 'red' : lightColor,
                            opacity: 1, // rect.width === 1 ? 1 : 0.2,
                        }}
                    />
                ))
            )}
        </span>
    );
};

export const Zwd = () => {
    // return '\u200B';
    return (
        <span style={{ position: 'relative' }}>
            {'\u200B'}
            <div
                style={{
                    position: 'absolute',
                    top: '50%',
                    backgroundColor: '#ddd',
                    height: 4,
                    width: 4,
                    left: 0,
                    borderRadius: 2,
                    marginLeft: -2,
                    marginTop: -2,
                }}
            />
        </span>
    );
};
