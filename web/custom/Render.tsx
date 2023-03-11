import React from 'react';
import { getNodes } from '../overheat/getNodes';
import { ONodeOld } from '../overheat/types';
import { Path, Selection } from '../store';
import { State } from './ByHand';

type Reg = (
    node: HTMLSpanElement | null,
    idx: number,
    loc?: 'start' | 'end' | 'inside',
) => void;

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
                                    color: 'gray',
                                }}
                            >
                                {onode.text}
                            </span>
                        );
                    case 'render':
                        return (
                            <span key={i} ref={(node) => reg(node, idx)}>
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
