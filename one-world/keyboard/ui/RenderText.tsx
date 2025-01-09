import React from 'react';
import { splitGraphemes } from '../../../src/parse/splitGraphemes';
import { Text } from '../../shared/cnodes';
import { asStyle } from '../../shared/shape';
import { justSel, spanEnd, spanStart } from '../handleNav';
import { TestState } from '../test-utils';
import { SelectionStatuses, Path, ListWhere, TextCursor, selStart } from '../utils';
import { lightColor } from './colors';
import { TextWithCursor, Cursor, Zwd } from './cursor';
import { RCtx, textColor, cursorPositionInSpanForEvt, RenderNode } from './RenderNode';

export const RenderText = (
    status: SelectionStatuses[''],
    readOnly: boolean | undefined,
    node: Text<number>,
    style: React.CSSProperties | undefined,
    ref: (el: HTMLElement) => void,
    ctx: RCtx,
    nextParent: Path,
    state: TestState,
    inRich: boolean,
) => {
    const has = (where: ListWhere) => status?.cursors.some((c) => c.type === 'list' && c.where === where);
    // const cursor = undefined as undefined | TextCursor | CollectionCursor; //  current?.cursor;
    // const sides = cursor?.type === 'text' ? textCursorSides2(cursor) : null;
    const children = node.spans.map((span, i) => {
        if (span.type === 'text') {
            const style = inRich ? asStyle(span.style) : { color: textColor, ...asStyle(span.style) };
            const sc = status?.cursors.filter((c) => c.type === 'text' && c.end.index === i);
            if (sc?.length) {
                const cursorText = (sc.find((c) => c.type === 'text' && c.end.index === i && c.end.text) as TextCursor)?.end.text;
                const text = cursorText ?? splitGraphemes(span.text);
                // const text = sides.text?.index === i ? sides.text.grems : splitGraphemes(span.text);
                // const left = i === sides.left.index ? sides.left.cursor : 0;
                // const right = i === sides.right.index ? sides.right.cursor : text.length;
                const hl = status?.highlight?.type === 'text' ? status.highlight.spans[i] : undefined;
                return (
                    <span key={i} style={style} data-index={i}>
                        <TextWithCursor
                            rich
                            onMouseDown={(evt) => {
                                evt.stopPropagation();
                                evt.preventDefault();
                                const pos = cursorPositionInSpanForEvt(evt, evt.currentTarget, text);
                                ctx.drag.start(
                                    selStart(nextParent, {
                                        type: 'text',
                                        end: { index: i, cursor: pos ?? 0, text: cursorText },
                                    }),
                                );
                            }}
                            onMouseMove={(evt) => {
                                if (ctx.drag.dragging) {
                                    evt.stopPropagation();
                                    evt.preventDefault();
                                    const pos = cursorPositionInSpanForEvt(evt, evt.currentTarget, text);
                                    ctx.drag.move(
                                        selStart(nextParent, {
                                            type: 'text',
                                            end: { index: i, cursor: pos ?? 0, text: cursorText },
                                        }),
                                    );
                                }
                            }}
                            text={text}
                            highlight={hl}
                            cursors={sc.map((s) => (s.type === 'text' ? s.end.cursor : 0))}
                        />
                    </span>
                );
            }
            const hl = status?.highlight?.type === 'text' ? status.highlight.spans[i] : undefined;
            // TODO show cursor here
            return (
                <span
                    key={i}
                    data-index={i}
                    style={hl ? { ...style, backgroundColor: lightColor } : style}
                    // style={style}
                    // style={{ backgroundColor: 'red' }}
                    onMouseDown={(evt) => {
                        evt.stopPropagation();
                        evt.preventDefault();
                        const pos = cursorPositionInSpanForEvt(evt, evt.currentTarget, splitGraphemes(span.text));
                        ctx.drag.start(selStart(nextParent, { type: 'text', end: { index: i, cursor: pos ?? 0 } }));
                    }}
                    onMouseMove={(evt) => {
                        if (ctx.drag.dragging) {
                            evt.stopPropagation();
                            evt.preventDefault();
                            const pos = cursorPositionInSpanForEvt(evt, evt.currentTarget, splitGraphemes(span.text));
                            ctx.drag.move(selStart(nextParent, { type: 'text', end: { index: i, cursor: pos ?? 0 } }));
                        }
                    }}
                >
                    {span.text === '' ? '\u200B' : span.text}
                </span>
            );
        } else if (span.type === 'embed') {
            const spa = status?.highlight?.type === 'text' ? status.highlight.spans[i] : null;
            const selected = spa === true || (spa && (spa.start == null || spa.start === 0) && (spa.end == null || spa.end >= 1));
            return (
                <span
                    style={{
                        fontFamily: 'Jet Brains',
                        backgroundColor: selected ? lightColor : 'rgba(255,255,255,0.5)',
                    }}
                    data-index={i}
                    key={i}
                >
                    {status?.cursors.some((c) => c.type === 'text' && c.end.index === i && c.end.cursor === 0) ? <Cursor /> : null}
                    <span style={{ color: 'rgb(248 136 0)' }}>{'${'}</span>
                    <RenderNode ctx={ctx} parent={nextParent} inRich={false} loc={span.item} state={state} readOnly={readOnly} />
                    <span style={{ color: 'rgb(248 136 0)' }}>{'}'}</span>
                    {status?.cursors.some((c) => c.type === 'text' && c.end.index === i && c.end.cursor === 1) ? <Cursor /> : null}
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
            <span ref={ref} style={{ ...style, fontFamily: 'Merriweather' }}>
                {has('inside') ? <Cursor rich /> : null}
                {children}
                {!children.length ? <Zwd /> : null}
            </span>
        );
    }
    return (
        <span
            style={style}
            ref={ref}
            onMouseMove={(evt) => {
                evt.stopPropagation();
            }}
        >
            {has('before') ? <Cursor /> : null}
            <span
                style={{
                    backgroundColor: has('start') || (status?.highlight?.type === 'text' && status.highlight.opener) ? lightColor : undefined,
                    color: textColor,
                }}
                onMouseMove={(evt) => {
                    if (ctx.drag.dragging) {
                        evt.stopPropagation();
                        evt.preventDefault();
                        if (!evtRight(evt)) {
                            ctx.drag.move(selStart(nextParent, { type: 'list', where: 'before' }));
                        } else {
                            if (node.spans.length) {
                                const sel = spanStart(node.spans[0], 0, nextParent, state.top, false);
                                if (sel) {
                                    ctx.drag.move(sel);
                                }
                            }
                        }
                    }
                }}
                onMouseDown={(evt) => {
                    evt.stopPropagation();
                    evt.preventDefault();
                    if (!evtRight(evt)) {
                        ctx.drag.start(selStart(nextParent, { type: 'list', where: 'before' }));
                    } else {
                        if (node.spans.length) {
                            const sel = spanStart(node.spans[0], 0, nextParent, state.top, false);
                            if (sel) {
                                ctx.drag.start(sel);
                            }
                        }
                    }
                }}
            >
                "
            </span>
            {has('inside') ? <Cursor /> : null}
            {children}
            {!children.length ? <Zwd /> : null}
            <span
                style={{
                    backgroundColor: has('end') || (status?.highlight?.type === 'text' && status.highlight.closer) ? lightColor : undefined,
                    color: textColor,
                }}
                onMouseMove={(evt) => {
                    if (ctx.drag.dragging) {
                        evt.stopPropagation();
                        evt.preventDefault();
                        if (evtRight(evt)) {
                            ctx.drag.move(selStart(nextParent, { type: 'list', where: 'after' }));
                        } else {
                            if (node.spans.length) {
                                const sel = spanEnd(node.spans[node.spans.length - 1], nextParent, node.spans.length - 1, state.top, false);
                                if (sel) {
                                    ctx.drag.move(sel);
                                }
                            }
                        }
                    }
                }}
                onMouseDown={(evt) => {
                    evt.stopPropagation();
                    evt.preventDefault();
                    if (evtRight(evt)) {
                        ctx.drag.start(selStart(nextParent, { type: 'list', where: 'after' }));
                    } else {
                        if (node.spans.length) {
                            const sel = spanEnd(node.spans[node.spans.length - 1], nextParent, node.spans.length - 1, state.top, false);
                            if (sel) {
                                ctx.drag.start(sel);
                            }
                        }
                    }
                }}
            >
                "
            </span>
            {has('after') ? <Cursor /> : null}
        </span>
    );
};

const evtRight = (evt: React.MouseEvent) => {
    const box = evt.currentTarget.getBoundingClientRect();
    return (box.left + box.right) / 2 < evt.clientX;
};
