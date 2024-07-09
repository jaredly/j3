import React, { useRef, useState } from 'react';
import { splitGraphemes } from '../../src/parse/splitGraphemes';
import { useLatest } from '../../web/custom/useLatest';
import { useKeyListener } from './HiddenInput';
import { specials, textKey } from './keyboard';

export type EditState = {
    text: string[];
    sel: number;
    start?: number;
};

export const Id = ({
    node,
}: {
    node: {
        type: 'id' | 'stringText' | 'accessText';
        text: string;
        loc: number;
    };
}) => {
    const [state, setState] = useState(null as null | EditState);
    // const [text, setText] = useState(null as null | string[]);
    // const [sel, setSel] = useState(null as null | number);
    const [blink, setBlink] = useState(true);
    const bid = useRef(null as null | Timer);

    const latest = useLatest(state);

    useKeyListener(state != null, (key, mods) => {
        if (!latest.current) return;
        const { text, sel } = latest.current;
        if (sel == null) return;

        setBlink(false);
        clearTimeout(bid.current!);
        bid.current = setTimeout(() => setBlink(true), 200);

        if (specials[key]) {
            const action = specials[key](
                sel === text.length ? 'end' : sel === 0 ? 'start' : 'middle',
                latest.current,
                mods,
            );
            if (action?.type === 'update') {
                setState({
                    text: action.text,
                    sel: action.cursor,
                    start: action.cursorStart,
                });
            }
            return;
        }
        const extra = splitGraphemes(key);
        if (extra.length > 1) {
            console.log('Too many graphemes? What is this', key, extra);
            return;
        }
        const results = textKey(extra, latest.current, mods);
        setState({ text: results.text, sel: results.cursor });
    });

    return (
        <span
            onMouseDown={(evt) => {
                const text = state?.text ?? splitGraphemes(node.text);
                const range = new Range();

                let { sel, start } = getNewSelection(text, state, evt, range);

                setState({ sel, start, text });

                setBlink(false);
                clearTimeout(bid.current!);
                bid.current = setTimeout(() => setBlink(true), 200);
            }}
            style={{
                padding: 4,
                backgroundColor: '#222',
                boxSizing: 'border-box',
            }}
        >
            {state != null ? show(state, blink) : node.text}
        </span>
    );
};

const show = ({ start, sel, text }: EditState, blink: boolean) => {
    if (start != null) {
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
                        backgroundColor: 'rgba(100,0,0,0.4)',
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

const cursorStyle = (blink: boolean) =>
    ({
        width: 0,
        display: 'inline-block',
        marginLeft: -7,
        marginRight: 7,
        fontSize: 23,
        top: 3,
        position: 'relative',
        marginTop: -7,
        animationDuration: '1s',
        animationName: blink ? 'blink' : 'unset',
        animationIterationCount: 'infinite',
    } as const);

function getNewSelection(
    text: string[],
    state: EditState | null,
    evt: React.MouseEvent<HTMLSpanElement, MouseEvent>,
    range: Range,
) {
    let sel = text.length;

    if (state) {
        if (state.start != null) {
            const mid =
                evt.currentTarget.firstElementChild!.nextElementSibling!;
            const box = mid.getBoundingClientRect();
            const [left, right] =
                state.start < state.sel
                    ? [state.start, state.sel]
                    : [state.sel, state.start];
            if (evt.clientX < box.left) {
                sel = offsetInNode(
                    range,
                    evt.currentTarget.firstChild!,
                    text.slice(0, left),
                    evt.clientX,
                );
            } else if (evt.clientX < box.right) {
                sel =
                    offsetInNode(
                        range,
                        mid.firstChild!,
                        text.slice(left, right),
                        evt.clientX,
                    ) + left;
            } else {
                sel =
                    offsetInNode(
                        range,
                        evt.currentTarget.lastChild!,
                        text.slice(right),
                        evt.clientX,
                    ) + right;
            }
        } else {
            const one = evt.currentTarget.firstChild!;
            const mid = evt.currentTarget.firstElementChild!;
            const ob = mid.getBoundingClientRect();
            if (ob.right > evt.clientX) {
                sel = offsetInNode(range, one, text.slice(0, sel), evt.clientX);
            } else {
                sel =
                    offsetInNode(
                        range,
                        evt.currentTarget.lastChild!,
                        text.slice(state.sel),
                        evt.clientX,
                    ) + state.sel;
            }
        }
    } else {
        sel = offsetInNode(range, evt.currentTarget, text, evt.clientX);
    }
    return {
        sel,
        start: evt.shiftKey ? state?.start ?? state?.sel : undefined,
    };
}

const offsetInNode = (
    range: Range,
    node: ChildNode,
    text: string[],
    x: number,
) => {
    let offset = 0;
    for (let i = 0; i < text.length; i++) {
        range.setStart(node, offset);
        range.setEnd(node, offset);
        offset += text[i].length;
        const rb = range.getBoundingClientRect();
        // console.log(rb.left)
        if (Math.abs(rb.left - x) < 5 || rb.left > x) {
            return i;
        }
    }
    return text.length;
};
