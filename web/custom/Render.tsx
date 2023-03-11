import React from 'react';
import { MNode } from '../../src/types/mcst';
import { rainbow } from '../old/Nodes';
import { getNodes } from '../overheat/getNodes';
import { ONodeOld } from '../overheat/types';
import { Path, Selection } from '../store';
import { State } from './ByHand';

type Reg = (
    node: HTMLSpanElement | null,
    idx: number,
    loc?: 'start' | 'end' | 'inside',
) => void;

export const textStyle = (node: MNode) => {
    switch (node.type) {
        case 'identifier':
            return { color: 'blue' };
        case 'stringText':
            return { color: 'yellow', whiteSpace: 'pre-wrap' };
    }
};

export const Render = ({
    idx,
    state,
    reg,
    path,
}: {
    idx: number;
    state: State;
    reg: Reg;
    path: Path[];
}) => {
    const node = state.map[idx];
    const onodes = getNodes(node);

    return (
        <span>
            {onodes.map((onode, i) => {
                switch (onode.type) {
                    case 'blinker':
                        return (
                            <span
                                key={i}
                                ref={(node) => reg(node, idx, onode.loc)}
                            />
                        );
                    case 'punct':
                        return (
                            <span
                                key={i}
                                style={{
                                    // color: 'gray',
                                    whiteSpace: 'pre-wrap',
                                    color:
                                        onode.color === 'rainbow'
                                            ? rainbow[
                                                  path.length % rainbow.length
                                              ]
                                            : onode.color,
                                }}
                            >
                                {onode.text}
                            </span>
                        );
                    case 'render':
                        return (
                            <span
                                key={i}
                                ref={(node) => reg(node, idx)}
                                style={textStyle(node)}
                            >
                                {onode.text}
                            </span>
                        );
                    case 'ref':
                        return (
                            <Render
                                key={onode.id}
                                state={state}
                                reg={reg}
                                idx={onode.id}
                                path={path.concat([{ idx, child: onode.path }])}
                            />
                        );
                }
            })}
        </span>
    );
};
