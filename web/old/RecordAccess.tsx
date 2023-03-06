import * as React from 'react';
import { MCRecordAccess, MCString } from '../../src/types/mcst';
import { EvalCtx, Path, setSelection, Store } from '../store';
import { Events, Node, rainbow } from './Nodes';
import { Blinker } from './Blinker';
import { SetHover } from './Doc';
import { sideClick } from './ListLike';
import { StringText } from './StringText';
import { Top } from './IdentifierLike';
import { RecordText } from './RecordText';

export const RecordAccess = ({
    node,
    path,
    top,
    // layout,
    idx,
    events,
}: {
    node: MCRecordAccess;
    path: Path[];
    // layout: Map[0]['layout'];
    events: Events;
    idx: number;
    top: Top;
}) => {
    const { store, ctx, setHover } = top;

    return (
        <span>
            <Node
                idx={node.target}
                top={top}
                path={path.concat([{ idx, child: { type: 'record-target' } }])}
                events={{
                    onLeft() {
                        return events.onLeft();
                    },
                    onRight() {
                        if (node.items.length) {
                            setSelection(store, {
                                idx: node.items[0],
                                loc: 'start',
                            });
                        } else {
                            console.error(`A RecordAccess with no children??`);
                            return events.onRight();
                        }
                    },
                }}
            />
            {node.items.map((item, i) => (
                <React.Fragment key={item}>
                    <span
                        style={{
                            color: '#00ff58',
                            fontVariationSettings:
                                store.selection?.idx === idx
                                    ? '"wght" 900'
                                    : '',
                        }}
                        onMouseDown={sideClick((left) => {
                            if (left) {
                                if (i === 0) {
                                    setSelection(store, {
                                        idx: node.target,
                                        loc: 'end',
                                        from: 'right',
                                    });
                                } else {
                                    const next = node.items[i - 1];
                                    setSelection(store, {
                                        idx: next,
                                        loc: 'end',
                                        from: 'right',
                                    });
                                }
                            } else {
                                setSelection(store, {
                                    idx: item,
                                    loc: 'start',
                                    from: 'left',
                                });
                            }
                        })}
                    >
                        .
                    </span>
                    <RecordText
                        idx={item}
                        top={top}
                        path={path.concat([
                            { idx, child: { type: 'attribute', at: i + 1 } },
                        ])}
                        events={{
                            onLeft() {
                                if (i === 0) {
                                    setSelection(store, {
                                        idx: node.target,
                                        loc: 'end',
                                    });
                                } else {
                                    setSelection(store, {
                                        idx: node.items[i - 1],
                                        loc: 'end',
                                    });
                                }
                            },
                            onRight() {
                                if (i < node.items.length - 1) {
                                    setSelection(store, {
                                        idx: node.items[i + 1],
                                        loc: 'start',
                                    });
                                } else {
                                    events.onRight();
                                }
                            },
                        }}
                    />
                </React.Fragment>
            ))}
        </span>
    );
};
