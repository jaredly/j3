import React from 'react';
import { EditState } from './Id';
import { colors } from './colors';

export const RenderTextAndCursor = ({
    state: { start, sel, text },
    blink,
}: {
    state: EditState;
    blink: boolean;
}) => {
    if (start != null && start !== sel) {
        const [left, right] = start < sel ? [start, sel] : [sel, start];
        return (
            <>
                {text.slice(0, left).join('')}
                {
                    <span style={sel === left ? cursorStyle(blink) : undefined}>
                        {sel === left ? '|' : ''}
                    </span>
                }
                <span
                    style={{
                        backgroundColor: colors.selection,
                    }}
                >
                    {text.slice(left, right).join('')}
                </span>
                {
                    <span
                        style={sel === right ? cursorStyle(blink) : undefined}
                    >
                        {sel === right ? '|' : ''}
                    </span>
                }
                {text.slice(right).join('')}
            </>
        );
    }
    return (
        <>
            {text.slice(0, sel).join('')}
            <span style={cursorStyle(blink)}>|</span>
            {text.slice(sel).join('')}
        </>
    );
};

export const cursorStyle = (blink: boolean) =>
    ({
        pointerEvents: 'none',
        width: 0,
        display: 'inline-block',
        marginLeft: -7,
        marginRight: 7,
        fontSize: 23,
        top: 3,
        position: 'relative',
        marginTop: -7,
        opacity: blink ? 0 : 1,
        lineHeight: '16px',
        // animationDuration: '2s',
        // animationName: blink ? 'blink' : 'unset',
        // animationIterationCount: 'infinite',
    } as const);
