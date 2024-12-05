import React, { useMemo } from 'react';
import { splitGraphemes } from '../../../src/parse/splitGraphemes';
import { isRich, Style } from '../../shared/cnodes';
import { cursorSides } from '../cursorSides';
import { interleaveF } from '../interleave';
import { TestState } from '../test-utils';
import { lastChild, Path, pathKey, pathWithChildren, Update } from '../utils';

import { asStyle } from '../../shared/shape';
import { textCursorSides2 } from '../insertId';
import { Cursor, TextWithCursor } from './cursor';
import { justSel, selUpdate } from '../handleNav';
import { posInList } from './selectionPos';

const hl = 'rgba(100,100,100,0.2)';
const opener = { round: '(', square: '[', curly: '{', angle: '<' };
const closer = { round: ')', square: ']', curly: '}', angle: '>' };
const braceColor = 'rgb(100, 200, 200)';
type RCtx = {
    errors: Record<number, string>;
    refs: Record<number, HTMLElement>; // -1 gets you 'cursor' b/c why not
    styles: Record<number, Style>;
    placeholders: Record<number, string>;
    dispatch: (up: Update) => void;
    msel: null | string[];
    mhover: null | string[];
};

const cursorPositionInSpanForEvt = (evt: React.MouseEvent, target: HTMLSpanElement, text: string[]) => {
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

const shadow = (x: number, y: number, color: string) => {
    return `${x}px ${y}px 0 ${color},-${x}px ${y}px 0 ${color},-${x}px -${y}px 0 ${color},6px -${y}px 0 ${color},0 ${y}px 0 ${color}, 0 -${y}px 0 ${color}`;
};

// const msk = 'rgb(255,100,100)'

const phBg = 'rgb(240,240,240)';
const placeholderStyle: React.CSSProperties = {
    backgroundColor: phBg,
    fontStyle: 'italic',
    color: 'rgb(100,100,100)',
    borderRadius: 4,
    outline: '2px solid ' + phBg,
    width: 'min-content',
};

export const RenderNode = ({ loc, state, inRich, ctx, parent }: { loc: number; state: TestState; inRich: boolean; ctx: RCtx; parent: Path }) => {
    const node = state.top.nodes[loc];
    const cursor = loc === lastChild(state.sel.start.path) ? state.sel.start.cursor : null;
    let style: React.CSSProperties | undefined = ctx.errors[loc]
        ? { textDecoration: 'underline' }
        : ctx.styles[loc]
        ? asStyle(ctx.styles[loc])
        : undefined;

    const nextParent = useMemo(() => pathWithChildren(parent, loc), [parent, loc]);
    const key = useMemo(() => pathKey(nextParent), [nextParent]);

    const lightColor = 'rgb(255,200,200)';
    if (ctx.msel?.includes(key)) {
        if (!style) style = {};
        style.borderRadius = '2px';
        // const lightColor = 'rgb(255,100,100,0.5)';
        style.background = lightColor;
        style.outline = `2px solid ${lightColor}`;
    }

    if (state.sel.multi?.end?.key === key) {
        if (!style) style = {};
        style.borderRadius = '2px';
        const color = 'rgb(255,100,100)';
        style.background = lightColor;
        style.outline = `2px solid ${color}`;
        style.position = 'relative';
    }

    const hoverColor = 'rgb(200,230,255)';
    if (ctx.mhover?.includes(key)) {
        if (!style) style = {};
        style.borderRadius = '2px';
        // const lightColor = 'rgb(255,100,100,0.5)';
        style.background = hoverColor;
        style.outline = `2px solid ${hoverColor}`;
    }

    const ref = (el: HTMLElement) => {
        ctx.refs[loc] = el;
    };

    switch (node.type) {
        case 'id':
            const plh = ctx.placeholders[loc];
            if (cursor?.type === 'id') {
                const { left, right } = cursorSides(cursor);
                let text = cursor.text ?? splitGraphemes(node.text);
                if (text.length === 0 && plh) {
                    if (!style) style = {};
                    Object.assign(style, placeholderStyle);
                    text = splitGraphemes(plh);
                }
                return (
                    <span style={style}>
                        <TextWithCursor
                            innerRef={ref}
                            // cursorRef={cursorRef}
                            onClick={(evt) => {
                                evt.stopPropagation();
                                const pos = cursorPositionInSpanForEvt(evt, evt.currentTarget, text);
                                ctx.dispatch(justSel(nextParent, { type: 'id', end: pos ?? 0, text: cursor.text }));
                            }}
                            text={text}
                            left={left}
                            right={right}
                        />
                    </span>
                );
            }
            if (node.text === '' && plh != null) {
                if (!style) style = {};
                Object.assign(style, placeholderStyle);
            }
            return (
                <span
                    style={style}
                    ref={ref}
                    onClick={(evt) => {
                        evt.stopPropagation();
                        const pos = cursorPositionInSpanForEvt(evt, evt.currentTarget, splitGraphemes(node.text));
                        ctx.dispatch(justSel(nextParent, { type: 'id', end: pos ?? 0 }));
                        // ok I cant dispatch just yet
                    }}
                >
                    {node.text === '' ? plh ?? '\u200B' : node.text}
                </span>
            );
        case 'list':
            const children = node.children.map((loc) => (
                <RenderNode parent={nextParent} ctx={ctx} key={loc} loc={loc} state={state} inRich={isRich(node.kind)} />
            ));
            // if (style) {
            //     style.display = 'inline-block';
            // }
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
                        <span
                            style={{ ...style, display: 'inline-block' }}
                            ref={ref}
                            data-yes="yes"
                            onClick={(evt) => {
                                evt.stopPropagation();
                                const sel = posInList(nextParent, { x: evt.clientX, y: evt.clientY }, ctx.refs, state.top);
                                if (sel) {
                                    ctx.dispatch(selUpdate(sel)!);
                                }
                            }}
                        >
                            {interleaveF(children, (i) => (
                                <span key={'sep' + i}>&nbsp;</span>
                            ))}
                        </span>
                    );
                default:
                    return (
                        <span
                            style={style}
                            ref={ref}
                            onClick={(evt) => {
                                evt.stopPropagation();
                                const sel = posInList(nextParent, { x: evt.clientX, y: evt.clientY }, ctx.refs, state.top);
                                if (sel) {
                                    ctx.dispatch(selUpdate(sel)!);
                                }
                            }}
                        >
                            {cursor?.type === 'list' && cursor.where === 'before' ? <Cursor /> : null}
                            <span
                                style={{
                                    background: cursor?.type === 'list' && cursor.where === 'start' ? hl : undefined,
                                    color: braceColor,
                                    // ...style,
                                    // borderRadius: style?.borderRadius,
                                }}
                            >
                                {opener[node.kind]}
                            </span>
                            {cursor?.type === 'list' && cursor.where === 'inside' ? <Cursor /> : null}
                            {node.forceMultiline ? (
                                <div style={{ ...style, display: 'flex', width: 'fit-content', flexDirection: 'column', marginLeft: 16 }}>
                                    {children}
                                </div>
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
                                    color: braceColor,
                                    // borderRadius: style?.borderRadius,
                                }}
                            >
                                {closer[node.kind]}
                            </span>
                            {cursor?.type === 'list' && cursor.where === 'after' ? <Cursor /> : null}
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
                            <span key={i} style={style} data-index={i}>
                                <TextWithCursor
                                    onClick={(evt) => {
                                        const pos = cursorPositionInSpanForEvt(evt, evt.currentTarget, text);
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
                            data-index={i}
                            style={style}
                            onClick={(evt) => {
                                const pos = cursorPositionInSpanForEvt(evt, evt.currentTarget, splitGraphemes(span.text));
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
                        <span style={{ background: selected ? hl : 'rgba(255,255,255,0.5)' }} data-index={i} key={i}>
                            {sides?.left.index === i && sides.right.index === i && sides.left.cursor === 0 && sides.right.cursor === 0 ? (
                                <Cursor />
                            ) : null}
                            <span style={{ color: 'rgb(248 136 0)' }}>{'${'}</span>
                            <RenderNode ctx={ctx} parent={nextParent} inRich={false} loc={span.item} state={state} />
                            <span style={{ color: 'rgb(248 136 0)' }}>{'}'}</span>
                            {sides?.left.index === i && sides.right.index === i && sides.left.cursor === 1 && sides.right.cursor === 1 ? (
                                <Cursor />
                            ) : null}
                        </span>
                    );
                } else {
                    return (
                        <span data-index={i} key={i}>
                            custom?
                        </span>
                    );
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
                <span style={{ backgroundColor: 'rgba(255,255,0,0.4)', ...style }} ref={ref}>
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
