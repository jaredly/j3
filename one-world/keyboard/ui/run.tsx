import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { splitGraphemes } from '../../../src/parse/splitGraphemes';
import { useLatest } from '../../../web/custom/useLatest';
import { isRich } from '../../shared/cnodes';
import { applyUpdate } from '../applyUpdate';
import { cursorSides } from '../cursorSides';
import { handleDelete } from '../handleDelete';
import { handleKey } from '../handleKey';
import { interleaveF } from '../interleave';
import { init, js, TestState } from '../test-utils';
import { lastChild } from '../utils';

import { useLocalStorage } from '../../../web/Debug';
import { asStyle, shape } from '../../shared/shape';
import { handleNav } from '../handleNav';
import { handleShiftNav, handleSpecial, Mods } from '../handleShiftNav';
import { closerKind, handleClose, handleWrap, wrapKind } from '../handleWrap';
import { textCursorSides2 } from '../insertId';
import { root } from '../root';
import { parse, show } from '../../syntaxes/dsl';
import { kwds, matchers } from '../../syntaxes/gleam2';

const opener = { round: '(', square: '[', curly: '{', angle: '<' };
const closer = { round: ')', square: ']', curly: '}', angle: '>' };

const hl = 'rgba(100,100,100,0.2)';

const Cursor = () => (
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

const TextWithCursor = ({ text, left, right }: { text: string[]; left: number; right: number }) => {
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

type RCtx = {
    errors: Record<number, string>;
    refs: Record<number, HTMLElement>;
};

const RenderNode = ({ loc, state, inRich, ctx }: { loc: number; state: TestState; inRich: boolean; ctx: RCtx }) => {
    const node = state.top.nodes[loc];
    const cursor = loc === lastChild(state.sel.start.path) ? state.sel.start.cursor : null;
    const style: React.CSSProperties | undefined = ctx.errors[loc] ? { textDecoration: 'underline' } : undefined;
    const ref = (el: HTMLElement) => {
        ctx.refs[loc] = el;
    };
    switch (node.type) {
        case 'id':
            if (cursor?.type === 'id') {
                const { left, right } = cursorSides(cursor);
                const text = cursor.text ?? splitGraphemes(node.text);
                return (
                    <span style={style} ref={ref}>
                        <TextWithCursor text={text} left={left} right={right} />
                    </span>
                );
            }
            return <span style={style}>{node.text}</span>;
        case 'list':
            const children = node.children.map((loc) => <RenderNode ctx={ctx} key={loc} loc={loc} state={state} inRich={isRich(node.kind)} />);
            if (typeof node.kind !== 'string') {
                return (
                    <span style={style} ref={ref}>
                        lol
                    </span>
                );
            }
            switch (node.kind) {
                case 'smooshed':
                    return (
                        <span style={style} ref={ref}>
                            {children}
                        </span>
                    );
                case 'spaced':
                    return (
                        <span style={style} ref={ref}>
                            {interleaveF(children, (i) => (
                                <span key={'sep' + i}>&nbsp;</span>
                            ))}
                        </span>
                    );
                default:
                    return (
                        <span style={style} ref={ref}>
                            {cursor?.type === 'list' && cursor.where === 'before' ? <Cursor /> : null}
                            {cursor?.type === 'list' && cursor.where === 'start' ? (
                                <span style={{ background: hl }}>{opener[node.kind]}</span>
                            ) : (
                                opener[node.kind]
                            )}
                            {cursor?.type === 'list' && cursor.where === 'inside' ? <Cursor /> : null}
                            {interleaveF(children, (i) => (
                                <span key={'sep' + i}>,&nbsp;</span>
                            ))}
                            {cursor?.type === 'list' && cursor.where === 'end' ? (
                                <span style={{ background: hl }}>{closer[node.kind]}</span>
                            ) : (
                                closer[node.kind]
                            )}
                            {cursor?.type === 'list' && cursor.where === 'after' ? <Cursor /> : null}
                        </span>
                    );
            }
        case 'text': {
            const sides = cursor?.type === 'text' ? textCursorSides2(cursor) : null;
            const children = node.spans.map((span, i) => {
                if (span.type === 'text') {
                    if (sides && sides.left.index <= i && sides.right.index >= i) {
                        const text = sides.text?.index === i ? sides.text.grems : splitGraphemes(span.text);
                        const left = i === sides.left.index ? sides.left.cursor : 0;
                        const right = i === sides.right.index ? sides.right.cursor : text.length;
                        return (
                            <span key={i} style={asStyle(span.style)}>
                                <TextWithCursor text={text} left={left} right={right} />
                            </span>
                        );
                    }
                    // TODO show cursor here
                    return (
                        <span key={i} style={asStyle(span.style)}>
                            {span.text}
                        </span>
                    );
                } else if (span.type === 'embed') {
                    let selected = false;
                    if (sides && sides.left.index <= i && sides.right.index >= i) {
                        const left = i === sides?.left.index ? sides.left.cursor : 0;
                        const right = i === sides?.right.index ? sides.right.cursor : 1;
                        if (left === 0 && right === 1) selected = true;
                    }
                    return (
                        <span style={{ background: selected ? hl : 'rgba(255,255,255,0.5)' }} key={i}>
                            {sides?.left.index === i && sides.right.index === i && sides.left.cursor === 0 && sides.right.cursor === 0 ? (
                                <Cursor />
                            ) : null}
                            {'${'}
                            <RenderNode ctx={ctx} inRich={false} loc={span.item} state={state} />
                            {'}'}
                            {sides?.left.index === i && sides.right.index === i && sides.left.cursor === 1 && sides.right.cursor === 1 ? (
                                <Cursor />
                            ) : null}
                        </span>
                    );
                } else {
                    return <span key={i}>custom?</span>;
                }
            });
            if (inRich) {
                // no quotes, and like ... some other things
                // are maybe different?
                return (
                    <span ref={ref} style={style}>
                        {cursor?.type === 'list' && cursor.where === 'inside' ? <Cursor /> : null}
                        {children}
                    </span>
                );
            }
            return (
                <span style={{ backgroundColor: 'rgba(255,255,0,0.2)', ...style }} ref={ref}>
                    {cursor?.type === 'list' && cursor.where === 'before' ? <Cursor /> : null}
                    {cursor?.type === 'list' && cursor.where === 'start' ? <span style={{ background: hl }}>"</span> : '"'}
                    {cursor?.type === 'list' && cursor.where === 'inside' ? <Cursor /> : null}
                    {children}
                    {cursor?.type === 'list' && cursor.where === 'end' ? <span style={{ background: hl }}>"</span> : '"'}
                    {cursor?.type === 'list' && cursor.where === 'after' ? <Cursor /> : null}
                </span>
            );
        }
        case 'table':
            return (
                <span style={style} ref={ref}>
                    Table
                </span>
            );
    }
};

const getRoot = (): Root => {
    // @ts-ignore
    return window._root ?? (window._root = createRoot(document.getElementById('root')!));
};

const keyUpdate = (state: TestState, key: string, mods: Mods) => {
    if (key === 'Enter') key = '\n';
    if (key === 'Backspace') {
        return handleDelete(state);
    } else if (key === 'ArrowLeft' || key === 'ArrowRight') {
        return mods.shift ? handleShiftNav(state, key) : handleNav(key, state);
    } else if (splitGraphemes(key).length > 1) {
        console.log('ignoring', key);
    } else if (wrapKind(key)) {
        return handleWrap(state, key);
    } else if (closerKind(key)) {
        return handleClose(state, key);
    } else if (mods.meta || mods.ctrl || mods.alt) {
        return handleSpecial(state, key, mods);
    } else {
        return handleKey(state, key, js);
    }
};

const App = () => {
    const [state, setState] = useLocalStorage('nuniiverse', () => init);

    const cstate = useLatest(state);
    // @ts-ignore
    window.state = state;

    useEffect(() => {
        const f = (evt: KeyboardEvent) => {
            let key = evt.key;
            const up = keyUpdate(cstate.current, evt.key, { meta: evt.metaKey, ctrl: evt.ctrlKey, alt: evt.altKey, shift: evt.shiftKey });
            if (!up) return;
            evt.preventDefault();
            evt.stopPropagation();
            setState(applyUpdate(state, up));
        };
        document.addEventListener('keydown', f);
        return () => document.removeEventListener('keydown', f);
    });

    const gleam = parse(
        matchers.stmt,
        root(state, (idx) => [{ id: '', idx }]),
        { matchers: matchers, kwds: kwds },
    );
    const errors = useMemo(() => {
        const errors: Record<number, string> = {};
        gleam.bads.forEach((bad) => {
            if (bad.type !== 'missing') {
                errors[bad.node.loc[0].idx] = bad.type === 'extra' ? 'Extra node in ' + show(bad.matcher) : 'Mismatch: ' + show(bad.matcher);
            }
        });
        return errors;
    }, [state, gleam.bads]);

    const refs: Record<number, HTMLElement> = useMemo(() => ({}), []);

    return (
        <>
            <div style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', marginBottom: 100 }}>
                <RenderNode loc={state.top.root} state={state} inRich={false} ctx={{ errors, refs }} />
            </div>
            <div>{shape(root(state))}</div>
            <div>
                {state.top.root} : {state.top.nextLoc}
            </div>
            <div>{JSON.stringify(state.sel)}</div>
            <div>{JSON.stringify(gleam.result ?? 'No result')}</div>
            <div>
                {gleam.bads.map((bad, i) => (
                    <div style={{ paddingTop: 16 }}>{JSON.stringify(bad)}</div>
                ))}
            </div>
            <button
                onClick={(evt) => {
                    setState(init);
                    evt.currentTarget.blur();
                }}
            >
                Clear
            </button>
        </>
    );
};

getRoot().render(<App />);
