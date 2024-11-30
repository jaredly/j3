import React, { useMemo } from 'react';
import { splitGraphemes } from '../../../src/parse/splitGraphemes';
import { isRich, Style } from '../../shared/cnodes';
import { cursorSides } from '../cursorSides';
import { interleaveF } from '../interleave';
import { TestState } from '../test-utils';
import { lastChild, Path, pathWithChildren, Update } from '../utils';

import { asStyle } from '../../shared/shape';
import { textCursorSides2 } from '../insertId';
import { Cursor, TextWithCursor } from './cursor';
import { justSel } from '../handleNav';

const hl = 'rgba(100,100,100,0.2)';
const opener = { round: '(', square: '[', curly: '{', angle: '<' };
const closer = { round: ')', square: ']', curly: '}', angle: '>' };
type RCtx = {
    errors: Record<number, string>;
    refs: Record<number, HTMLElement>;
    styles: Record<number, Style>;
    dispatch: (up: Update) => void;
};

const spos = (evt: React.MouseEvent, target: HTMLSpanElement, text: string[]) => {
    const range = new Range();
    let best = null as null | [number, number];
    for (let i = 0; i < text.length; i++) {
        const at = text.slice(0, i).join('').length;
        range.setStart(target.firstChild!, at);
        range.setEnd(target.firstChild!, at);
        const box = range.getBoundingClientRect();
        if (evt.clientY < box.top || evt.clientY > box.bottom) continue;
        const dst = Math.abs(box.left - evt.clientX);
        if (!best || dst < best[0]) best = [dst, i];
    }
    return best ? best[1] : null;
};

export const RenderNode = ({ loc, state, inRich, ctx, parent }: { loc: number; state: TestState; inRich: boolean; ctx: RCtx; parent: Path }) => {
    const node = state.top.nodes[loc];
    const cursor = loc === lastChild(state.sel.start.path) ? state.sel.start.cursor : null;
    const style: React.CSSProperties | undefined = ctx.errors[loc]
        ? { textDecoration: 'underline' }
        : ctx.styles[loc]
        ? asStyle(ctx.styles[loc])
        : undefined;
    const ref = (el: HTMLElement) => {
        ctx.refs[loc] = el;
    };
    const nextParent = useMemo(() => pathWithChildren(parent, loc), [parent, loc]);
    switch (node.type) {
        case 'id':
            if (cursor?.type === 'id') {
                const { left, right } = cursorSides(cursor);
                const text = cursor.text ?? splitGraphemes(node.text);
                return (
                    <span style={style}>
                        <TextWithCursor
                            innerRef={ref}
                            onClick={(evt) => {
                                const pos = spos(evt, evt.currentTarget, text);
                                ctx.dispatch(justSel(nextParent, { type: 'id', end: pos ?? 0 }));
                            }}
                            text={text}
                            left={left}
                            right={right}
                        />
                    </span>
                );
            }
            return (
                <span
                    style={style}
                    ref={ref}
                    onClick={(evt) => {
                        const pos = spos(evt, evt.currentTarget, splitGraphemes(node.text));
                        ctx.dispatch(justSel(nextParent, { type: 'id', end: pos ?? 0 }));
                        // ok I cant dispatch just yet
                    }}
                >
                    {node.text}
                </span>
            );
        case 'list':
            const children = node.children.map((loc) => (
                <RenderNode parent={nextParent} ctx={ctx} key={loc} loc={loc} state={state} inRich={isRich(node.kind)} />
            ));
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
                            <Cursor show={cursor?.type === 'list' && cursor.where === 'before'} />
                            <span
                                style={{
                                    background: cursor?.type === 'list' && cursor.where === 'start' ? hl : undefined,
                                    color: 'orange',
                                }}
                            >
                                {opener[node.kind]}
                            </span>
                            <Cursor show={cursor?.type === 'list' && cursor.where === 'inside'} />
                            {node.forceMultiline ? (
                                <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 16 }}>{children}</div>
                            ) : (
                                interleaveF(children, (i) => <span key={'sep' + i}>,&nbsp;</span>)
                            )}
                            {/* {cursor?.type === 'list' && cursor.where === 'end' ? (
                                <span style={{ background: hl }}>{closer[node.kind]}</span>
                            ) : (
                                closer[node.kind]
                            )} */}
                            <span
                                style={{
                                    background: cursor?.type === 'list' && cursor.where === 'end' ? hl : undefined,
                                    color: 'orange',
                                }}
                            >
                                {closer[node.kind]}
                            </span>
                            <Cursor show={cursor?.type === 'list' && cursor.where === 'after'} />
                        </span>
                    );
            }
        case 'text': {
            const sides = cursor?.type === 'text' ? textCursorSides2(cursor) : null;
            const children = node.spans.map((span, i) => {
                if (span.type === 'text') {
                    const style = { color: 'blue', ...asStyle(span.style) };
                    if (sides && sides.left.index <= i && sides.right.index >= i) {
                        const text = sides.text?.index === i ? sides.text.grems : splitGraphemes(span.text);
                        const left = i === sides.left.index ? sides.left.cursor : 0;
                        const right = i === sides.right.index ? sides.right.cursor : text.length;
                        return (
                            <span key={i} style={style}>
                                <TextWithCursor
                                    onClick={(evt) => {
                                        const pos = spos(evt, evt.currentTarget, text);
                                        ctx.dispatch(justSel(nextParent, { type: 'text', end: { index: i, cursor: pos ?? 0 } }));
                                    }}
                                    text={text}
                                    left={left}
                                    right={right}
                                />
                            </span>
                        );
                    }
                    // TODO show cursor here
                    return (
                        <span
                            key={i}
                            style={style}
                            onClick={(evt) => {
                                const pos = spos(evt, evt.currentTarget, splitGraphemes(span.text));
                                ctx.dispatch(justSel(nextParent, { type: 'text', end: { index: i, cursor: pos ?? 0 } }));
                            }}
                        >
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
                                <Cursor show />
                            ) : null}
                            {'${'}
                            <RenderNode ctx={ctx} parent={nextParent} inRich={false} loc={span.item} state={state} />
                            {'}'}
                            {sides?.left.index === i && sides.right.index === i && sides.left.cursor === 1 && sides.right.cursor === 1 ? (
                                <Cursor show />
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
                        {cursor?.type === 'list' && cursor.where === 'inside' ? <Cursor show /> : null}
                        {children}
                    </span>
                );
            }
            return (
                <span style={{ backgroundColor: 'rgba(255,255,0,0.4)', ...style }} ref={ref}>
                    {cursor?.type === 'list' && cursor.where === 'before' ? <Cursor show /> : null}
                    {cursor?.type === 'list' && cursor.where === 'start' ? <span style={{ background: hl }}>"</span> : '"'}
                    {cursor?.type === 'list' && cursor.where === 'inside' ? <Cursor show /> : null}
                    {children}
                    {cursor?.type === 'list' && cursor.where === 'end' ? <span style={{ background: hl }}>"</span> : '"'}
                    {cursor?.type === 'list' && cursor.where === 'after' ? <Cursor show /> : null}
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
