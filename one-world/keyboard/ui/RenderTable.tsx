import React from 'react';
import { Table, isRich } from '../../shared/cnodes';
import { interleaveF } from '../interleave';
import { ListWhere, Path, SelectionStatuses, Top } from '../utils';
import { lightColor } from './colors';
import { Cursor } from './cursor';
import { RCtx, RenderNode, braceColor, closer, opener } from './RenderNode';
import { posInList } from './selectionPos';

export const RenderTable = (
    status: SelectionStatuses[''],
    readOnly: boolean | undefined,
    node: Table<number>,
    style: React.CSSProperties | undefined,
    ref: (el: HTMLElement) => void,
    ctx: RCtx,
    nextParent: Path,
    top: Top,
    inRich: boolean,
) => {
    const has = (where: ListWhere) => status?.cursors.some((c) => c.type === 'list' && c.where === where);
    const mx = node.rows.reduce((c, r) => Math.max(c, r.length), 0);

    if (status?.highlight?.type === 'list' && status.highlight.opener && status.highlight.closer) {
        if (!style) style = {};
        style.backgroundColor = lightColor;
    }

    // const key = useMemo(() => pathKey(nextParent), [nextParent])
    // const status = ctx.selectionStatuses[key]
    // const cursor = undefined as CollectionCursor | undefined;
    if (isRich(node.kind)) {
        const cols: string[] = [];
        for (let i = 0; i < mx; i++) {
            if (i > 0) cols.push('min-content');
            cols.push('max-content');
        }
        return (
            <span style={{ display: 'inline-flex', flexDirection: 'row' }}>
                {has('before') ? <Cursor /> : null}

                <span
                    ref={ref}
                    style={{
                        ...style,
                        border: '1px solid teal',
                        padding: 8,
                        gridTemplateColumns: cols.join(' '),
                        columnGap: 4,
                        display: 'grid',
                    }}
                >
                    {node.rows.map((row) =>
                        row.map((cell, i) => [
                            i > 0 ? (
                                <span key={cell + ' |'} style={{ gridColumn: i * 2 }}>
                                    {'|'}
                                </span>
                            ) : null,
                            <span key={cell} style={{ gridColumn: row.length === 1 ? `span ${mx * 2 - 1}` : i * 2 + 1 }}>
                                <RenderNode parent={nextParent} ctx={ctx} loc={cell} top={top} inRich={true} readOnly={readOnly} />
                            </span>,
                        ]),
                    )}
                </span>
                {has('after') ? <Cursor /> : null}
            </span>
        );
    }

    const children = node.rows.map((row) => {
        const nodes = row.map((loc) => <RenderNode parent={nextParent} ctx={ctx} key={loc} loc={loc} top={top} inRich={false} readOnly={readOnly} />);
        if (!node.forceMultiline) {
            return interleaveF(nodes, (i) => <span key={`sep${i}`}>: </span>);
        }
        return interleaveF(
            nodes.map((node, i) => (
                <span
                    key={i}
                    style={{
                        gridColumn: row.length === 1 ? `span ${mx * 2 - 1}` : i * 2 + 1,
                    }}
                >
                    {node}
                </span>
            )),
            (i) => (
                <span
                    style={{
                        gridColumn: i * 2 + 2,
                    }}
                    key={`sep${i}`}
                >
                    {': '}
                </span>
            ),
        );
    });

    const cols: string[] = [];
    for (let i = 0; i < mx; i++) {
        if (i > 0) cols.push('min-content');
        cols.push('max-content');
    }

    return (
        <span
            style={style}
            ref={ref}
            onMouseDown={(evt) => {
                evt.stopPropagation();
                evt.preventDefault();
                const sel = posInList(nextParent, { x: evt.clientX, y: evt.clientY }, ctx.refs, top);
                if (sel) {
                    ctx.drag.start(sel);
                    // ctx.dispatch(selUpdate(sel)!);
                }
            }}
            onMouseMove={(evt) => {
                if (ctx.drag.dragging) {
                    evt.stopPropagation();
                    evt.preventDefault();
                    const sel = posInList(nextParent, { x: evt.clientX, y: evt.clientY }, ctx.refs, top);
                    if (sel) {
                        ctx.drag.move(sel, evt.ctrlKey, evt.altKey);
                        // ctx.dispatch(selUpdate(sel)!);
                    }
                }
            }}
        >
            {has('before') ? <Cursor /> : null}
            <span
                style={{
                    backgroundColor: has('start') || (status?.highlight?.type === 'list' && status.highlight.opener) ? lightColor : undefined,
                    color: braceColor,
                    // ...style,
                    // borderRadius: style?.borderRadius,
                }}
            >
                {opener[node.kind]}
                <span style={{ marginLeft: '-0.3em', fontVariantLigatures: 'none' }}>:</span>
            </span>
            {has('inside') ? <Cursor /> : null}

            {node.forceMultiline ? (
                <div
                    style={{
                        ...style,
                        display: 'grid',
                        width: 'fit-content',
                        gridTemplateColumns: cols.join(' '),
                        flexDirection: 'column',
                        marginLeft: 16,
                    }}
                >
                    {children}
                </div>
            ) : (
                interleaveF(children, (i) => [<span key={`row${i}`}>{'; '}</span>])
            )}
            <span
                style={{
                    backgroundColor: has('end') || (status?.highlight?.type === 'list' && status.highlight.closer) ? lightColor : undefined,
                    color: braceColor,
                    // borderRadius: style?.borderRadius,
                }}
            >
                <span style={{ marginRight: '-0.3em', fontVariantLigatures: 'none' }}>:</span>
                {closer[node.kind]}
            </span>
            {has('after') ? <Cursor /> : null}
        </span>
    );
};
