import React, { useEffect, useRef, useState } from 'react';

const hl = 'rgba(100,100,100,0.2)';

export const Cursor = () => (
    <span
        style={{
            display: 'inline-block',
            width: 1,
            marginRight: 0,
            marginLeft: -1,
            marginBottom: -4,
            height: '1em',
            backgroundColor: 'red',
            // zIndex: -1,
            position: 'relative',
        }}
    />
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

export const TextWithCursor = ({ text, left, right }: { text: string[]; left: number; right: number }) => {
    const ref = useRef<HTMLSpanElement>(null);
    const [rects, setRects] = useState(null as null | { width: number; height: number; left: number; top: number }[]);
    const tick = useResizeTick();

    useEffect(() => {
        if (!ref.current) return;
        const range = new Range();
        range.setStart(ref.current.firstChild!, text.slice(0, left).join('').length);
        range.setEnd(ref.current.firstChild!, text.slice(0, right).join('').length);
        const rects = [...range.getClientRects()];

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
    }, [text, left, right, tick]);

    return (
        <span style={{ position: 'relative' }}>
            <span ref={ref}>{text.length ? text.join('') : '\u200B'}</span>
            {rects?.map((rect, i) => (
                <div
                    key={i}
                    style={{
                        ...rect,
                        position: 'absolute',
                        backgroundColor: 'red',
                        opacity: rect.width === 1 ? 1 : 0.2,
                    }}
                />
            ))}
        </span>
    );
};
