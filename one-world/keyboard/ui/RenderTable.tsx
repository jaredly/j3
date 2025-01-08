import React from 'react';
import { Table, isRich } from '../../shared/cnodes';
import { selUpdate } from '../handleNav';
import { interleaveF } from '../interleave';
import { TestState } from '../test-utils';
import { CollectionCursor, Path, SelectionStatuses } from '../utils';
import { Cursor } from './cursor';
import { RCtx, RenderNode, braceColor, closer, hlColor, opener } from './RenderNode';
import { posInList } from './selectionPos';

export const RenderTable = (
    status: SelectionStatuses[''],
    readOnly: boolean | undefined,
    node: Table<number>,
    style: React.CSSProperties | undefined,
    ref: (el: HTMLElement) => void,
    ctx: RCtx,
    nextParent: Path,
    state: TestState,
    inRich: boolean,
) => {
    const mx = node.rows.reduce((c, r) => Math.max(c, r.length), 0);
    const cursor = undefined as CollectionCursor | undefined;
    if (isRich(node.kind)) {
        const cols: string[] = [];
        for (let i = 0; i < mx; i++) {
            if (i > 0) cols.push('min-content');
            cols.push('max-content');
        }
        return (
            <span style={{ display: 'inline-flex', flexDirection: 'row' }}>
                {cursor?.type === 'list' && cursor.where === 'before' ? <Cursor /> : null}

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
                                <RenderNode parent={nextParent} ctx={ctx} loc={cell} state={state} inRich={true} readOnly={readOnly} />
                            </span>,
                        ]),
                    )}
                </span>
                {cursor?.type === 'list' && cursor.where === 'after' ? <Cursor /> : null}
            </span>
        );
    }

    const children = node.rows.map((row) => {
        const nodes = row.map((loc) => (
            <RenderNode parent={nextParent} ctx={ctx} key={loc} loc={loc} state={state} inRich={false} readOnly={readOnly} />
        ));
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
                    backgroundColor: cursor?.type === 'list' && cursor.where === 'start' ? hlColor : undefined,
                    color: braceColor,
                    // ...style,
                    // borderRadius: style?.borderRadius,
                }}
            >
                {opener[node.kind]}
                <span style={{ marginLeft: '-0.3em', fontVariantLigatures: 'none' }}>:</span>
            </span>
            {cursor?.type === 'list' && cursor.where === 'inside' ? <Cursor /> : null}

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
                    backgroundColor: cursor?.type === 'list' && cursor.where === 'end' ? hlColor : undefined,
                    color: braceColor,
                    // borderRadius: style?.borderRadius,
                }}
            >
                <span style={{ marginRight: '-0.3em', fontVariantLigatures: 'none' }}>:</span>
                {closer[node.kind]}
            </span>
            {cursor?.type === 'list' && cursor.where === 'after' ? <Cursor /> : null}
        </span>
    );
};
