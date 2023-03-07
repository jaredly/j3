// Why is this called overheat?
// Well, I was thinking `overhead` for overhead projector,
// for projectional editing.
// but then overhead was taken on npm.

import React from 'react';
import { ListLikeContents, MNode } from '../../src/types/mcst';
import { Blinker } from '../old/Blinker';
import { Top } from '../old/IdentifierLike';
import { sideClick } from '../old/ListLike';
import { Events, rainbow } from '../old/Nodes';
import { Path, Selection, setSelection, useStore } from '../store';
import { ONode } from './types';
import { getNodes, getNodesWithAnnot } from './getNodesWithAnnot';

const select = (
    node: ONode,
    idx: number,
    loc: Selection['loc'],
): Selection | null => {
    switch (node.type) {
        case 'punct':
            return null;
        // case 'atom':
        //     return {idx: node.id, loc}
        case 'blinker':
            return { idx, loc: node.loc };
        case 'ref':
            return { idx: node.id, loc };
        case 'render':
            return { idx, loc };
    }
};

export type RenderProps<Node> = {
    node: Node;
    top: Top;
    events: Events;
    path: Path[];
    idx: number;
};

export const Overheat = ({
    idx,
    top,
    path,
    events,
}: {
    path: Path[];
    top: Top;
    events: Events;
    idx: number;
}) => {
    const mnode = useStore(top.store, idx);
    const nodes = getNodesWithAnnot(mnode, idx === top.store.root);
    if (!nodes) {
        return <span>No overheat for {mnode.type}</span>;
    }
    const dec = top.ctx.report.errors[idx]?.length
        ? 'rgba(255,0,0,0.2)'
        : 'none';
    return (
        <span
            onMouseEnter={(evt) =>
                top.setHover({
                    idx,
                    box: evt.currentTarget.getBoundingClientRect(),
                })
            }
            onMouseLeave={() => top.setHover({ idx, box: null })}
            style={
                path.length === 1
                    ? {
                          display: 'block',
                          cursor: 'text',
                      }
                    : { background: dec }
            }
            onMouseDown={(evt) => {
                evt.stopPropagation();
                evt.preventDefault();
                if (path.length) {
                    setSelection(top.store, { idx, loc: 'end', from: 'right' });
                }
            }}
        >
            {/* <span style={{ fontSize: '50%' }}>{idx}</span> */}
            {nodes.map((node, i) => {
                const childEvents: Events = makeChildEvents(
                    i,
                    nodes,
                    idx,
                    top,
                    events,
                );
                switch (node.type) {
                    case 'punct':
                        return (
                            <span
                                key={'punct:' + i}
                                style={{
                                    whiteSpace: 'pre-wrap',
                                    color:
                                        node.color === 'rainbow'
                                            ? rainbow[
                                                  path.length % rainbow.length
                                              ]
                                            : node.color,
                                    opacity: 0.5,
                                    fontVariationSettings: node.boldSelect
                                        ? top.store.selection?.idx === idx
                                            ? '"wght" 900'
                                            : ''
                                        : undefined,
                                }}
                                onMouseDown={sideClick((left) => {
                                    if (left) {
                                        childEvents.onLeft();
                                    } else {
                                        childEvents.onRight();
                                    }
                                })}
                            >
                                {node.text}
                            </span>
                        );
                    case 'blinker':
                        return top.store.selection?.idx === idx &&
                            top.store.selection.loc === node.loc ? (
                            <Blinker
                                key={idx + ':' + node.loc}
                                idx={idx}
                                store={top.store}
                                ectx={top.ctx}
                                path={path.concat([
                                    { idx, child: { type: node.loc } },
                                ])}
                                events={childEvents}
                            />
                        ) : null;
                    case 'ref':
                        return (
                            <Overheat
                                idx={node.id}
                                key={node.id}
                                top={top}
                                path={path.concat({ idx, child: node.path })}
                                events={childEvents}
                            />
                        );
                    case 'render': {
                        const Component = node.component;
                        return (
                            <Component
                                key={idx}
                                idx={idx}
                                node={mnode}
                                top={top}
                                path={path}
                                events={childEvents}
                                {...(node.props ?? {})}
                            />
                        );
                    }
                }
            })}
        </span>
    );
};

function makeChildEvents(
    i: number,
    nodes: ONode[],
    idx: number,
    top: Top,
    events: Events,
): Events {
    return {
        onLeft() {
            for (let ti = i - 1; ti >= 0; ti--) {
                const sel = select(nodes[ti], idx, 'end');
                if (sel) {
                    console.log('doing a select', ti, i, sel);
                    setSelection(top.store, {
                        ...sel,
                        from: nodes[i].innerLeft ? undefined : 'right',
                    });
                    return;
                }
            }
            events.onLeft();
        },
        onRight() {
            for (let ti = i + 1; ti < nodes.length; ti++) {
                const sel = select(nodes[ti], idx, 'start');
                if (sel) {
                    setSelection(top.store, { ...sel, from: 'left' });
                    return;
                }
            }
            events.onRight();
        },
    };
}
