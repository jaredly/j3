import * as React from 'react';
import { MCRecordAccess, MCSpread, MCString } from '../../src/types/mcst';
import { EvalCtx, Path, setSelection, Store } from '../store';
import { Events, Node, rainbow } from './Nodes';
import { Blinker } from './Blinker';
import { SetHover } from './Doc';
import { sideClick } from './ListLike';
import { StringText } from './StringText';
import { Top } from './IdentifierLike';
import { RecordText } from './RecordText';

export const Spread = ({
    node,
    path,
    top,
    // layout,
    idx,
    events,
}: {
    node: MCSpread;
    path: Path[];
    events: Events;
    idx: number;
    top: Top;
}) => {
    const { store, ctx, setHover } = top;

    return (
        <span>
            {top.store.selection?.idx === idx &&
            top.store.selection.loc === 'start' ? (
                <Blinker
                    idx={idx}
                    store={top.store}
                    ectx={top.ctx}
                    path={path.concat([{ idx, child: { type: 'start' } }])}
                    events={{
                        onLeft() {
                            events.onLeft();
                        },
                        onRight() {
                            setSelection(store, {
                                idx: node.contents,
                                loc: 'start',
                                from: 'left',
                            });
                        },
                    }}
                />
            ) : null}
            <span
                style={{
                    color: '#00ff58',
                    // fontVariationSettings:
                    //     store.selection?.idx === idx ? '"wght" 900' : '',
                }}
                onMouseDown={sideClick((left) => {
                    if (left) {
                        setSelection(store, { idx, loc: 'start' });
                    } else {
                        setSelection(store, {
                            idx: node.contents,
                            loc: 'start',
                            from: 'left',
                        });
                    }
                })}
            >
                ...
            </span>
            <Node
                idx={node.contents}
                top={top}
                path={path.concat([
                    { idx, child: { type: 'spread-contents' } },
                ])}
                events={{
                    onLeft() {
                        setSelection(store, { idx, loc: 'start' });
                    },
                    onRight() {
                        return events.onRight();
                    },
                }}
            />
        </span>
    );
};
