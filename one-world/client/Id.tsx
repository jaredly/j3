import React, { useEffect, useRef, useState } from 'react';
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
        let { text, sel } = latest.current;
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

    const [drag, setDrag] = useState(false);

    const ref = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (!drag) return;
        const a = () => {
            setDrag(false);
        };
        const b = (evt: MouseEvent) => {
            const state = latest.current;
            const range = new Range();
            const text = state?.text ?? splitGraphemes(node.text);
            const sel = getNewSelection(
                text,
                state,
                ref.current!,
                evt.clientX,
                false,
                range,
            );
            setState({ text, sel: sel.sel, start: state?.start ?? state?.sel });

            setBlink(false);
            clearTimeout(bid.current!);
            bid.current = setTimeout(() => setBlink(true), 200);
        };
        document.addEventListener('mouseup', a);
        document.addEventListener('mousemove', b);

        return () => {
            document.removeEventListener('mouseup', a);
            document.removeEventListener('mousemove', b);
        };
    }, [drag]);

    return (
        <span
            ref={ref}
            onMouseDown={(evt) => {
                const text = state?.text ?? splitGraphemes(node.text);
                const range = new Range();

                let { sel, start } = getNewSelection(
                    text,
                    state,
                    evt.currentTarget,
                    evt.clientX,
                    evt.shiftKey,
                    range,
                );

                setState({ sel, start, text });

                setBlink(false);
                clearTimeout(bid.current!);
                bid.current = setTimeout(() => setBlink(true), 200);

                setDrag(true);
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
        animationDuration: '2s',
        animationName: blink ? 'blink' : 'unset',
        animationIterationCount: 'infinite',
    } as const);

function getNewSelection(
    text: string[],
    state: EditState | null,
    // evt: React.MouseEvent<HTMLSpanElement, MouseEvent>,
    node: HTMLSpanElement,
    x: number,
    shift: boolean,
    range: Range,
) {
    let sel = text.length;

    if (state) {
        if (state.start != null && state.start !== state.sel) {
            const mid = node.firstElementChild!.nextElementSibling!;
            const box = mid.getBoundingClientRect();
            const [left, right] =
                state.start < state.sel
                    ? [state.start, state.sel]
                    : [state.sel, state.start];
            if (x < box.left) {
                sel = offsetInNode(
                    range,
                    node.firstChild!,
                    text.slice(0, left),
                    x,
                );
            } else if (x < box.right) {
                sel =
                    offsetInNode(
                        range,
                        mid.firstChild!,
                        text.slice(left, right),
                        x,
                    ) + left;
            } else {
                sel =
                    offsetInNode(range, node.lastChild!, text.slice(right), x) +
                    right;
            }
        } else {
            const one = node.firstChild!;
            const mid = node.firstElementChild!;
            const ob = mid.getBoundingClientRect();
            if (ob.right > x) {
                sel = offsetInNode(range, one, text.slice(0, sel), x);
            } else {
                sel =
                    offsetInNode(
                        range,
                        node.lastChild!,
                        text.slice(state.sel),
                        x,
                    ) + state.sel;
            }
        }
    } else {
        sel = offsetInNode(range, node, text, x);
    }
    return {
        sel,
        start: shift ? state?.start ?? state?.sel : undefined,
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
