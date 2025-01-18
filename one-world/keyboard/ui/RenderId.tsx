import React from 'react';
import { splitGraphemes } from '../../../src/parse/splitGraphemes';
import { Id } from '../../shared/cnodes';
import { justSel } from '../handleNav';
import { SelectionStatuses, Path, IdCursor, selStart, TmpText } from '../utils';
import { TextWithCursor, Zwd } from './cursor';
import { RCtx, cursorPositionInSpanForEvt } from './RenderNode';

export const RenderId = (
    status: SelectionStatuses[''],
    readOnly: boolean | undefined,
    node: Id<number>,
    tmpText: TmpText,
    style: React.CSSProperties | undefined,
    ref: (el: HTMLElement) => void,
    ctx: RCtx,
    nextParent: Path,
) => {
    if (status?.cursors.length && !readOnly) {
        // STOPSHIP need to render tmpText here
        const cursorText = tmpText[node.loc]; // (status.cursors.find((c) => c.type === 'id' && c.text) as IdCursor)?.text;
        const text = cursorText ?? splitGraphemes(node.text);
        return (
            <span style={{ ...style, position: 'relative' }}>
                <TextWithCursor
                    innerRef={ref}
                    onMouseDown={(evt) => {
                        evt.preventDefault();
                        evt.stopPropagation();
                        const pos = cursorPositionInSpanForEvt(evt, evt.currentTarget, text);
                        ctx.drag.start(selStart(nextParent, { type: 'id', end: pos ?? 0 }), evt.metaKey);
                    }}
                    onMouseMove={(evt) => {
                        if (ctx.drag.dragging) {
                            evt.preventDefault();
                            evt.stopPropagation();
                            const pos = cursorPositionInSpanForEvt(evt, evt.currentTarget, text);
                            ctx.drag.move(selStart(nextParent, { type: 'id', end: pos ?? 0 }));
                        }
                    }}
                    text={text}
                    highlight={status.highlight?.type === 'id' ? status.highlight : undefined}
                    cursors={(status.cursors.filter((c) => c.type === 'id') as IdCursor[]).map((c) => c.end)}
                />
            </span>
        );
    }
    let text = node.text;
    return (
        <span
            style={style}
            ref={ref}
            onMouseDown={(evt) => {
                evt.preventDefault();
                evt.stopPropagation();
                const pos = cursorPositionInSpanForEvt(evt, evt.currentTarget, splitGraphemes(node.text));
                ctx.drag.start(selStart(nextParent, { type: 'id', end: pos ?? 0 }), evt.metaKey);
            }}
            onMouseMove={(evt) => {
                if (ctx.drag.dragging) {
                    evt.preventDefault();
                    evt.stopPropagation();
                    const pos = cursorPositionInSpanForEvt(evt, evt.currentTarget, splitGraphemes(node.text));
                    ctx.drag.move(selStart(nextParent, { type: 'id', end: pos ?? 0 }));
                }
            }}
        >
            {text === '' ? <Zwd /> : text}
        </span>
    );
};
