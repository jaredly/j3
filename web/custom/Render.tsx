import React from 'react';
import { Ctx } from '../../src/to-ast/Ctx';
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

export function getRainbowHashColor(hash: string) {
    const idx = hash.startsWith(':')
        ? +hash.slice(1) * (rainbow.length / 5 - 1)
        : parseInt(hash, 16);
    const color = rainbow[idx % rainbow.length];
    return color;
}

const nodeColor = (type: MNode['type']) => {
    return colors[type];
};

export const colors: {
    [key: string]: string;
} = {
    identifier: '#5bb6b7',
    comment: '#616162',
    tag: '#82f682',
    number: '#4848a5',
    string: 'yellow',
    stringText: 'yellow',
    unparsed: 'red',
};

export const textStyle = (
    node: MNode,
    display?: Ctx['display'][0],
): React.CSSProperties | undefined => {
    const color = nodeColor(node.type);
    if (display?.style) {
        switch (display.style.type) {
            case 'record-attr':
                return {
                    fontStyle: 'italic',
                    fontFamily: 'serif',
                    color: '#84a4a5',
                };
            case 'number':
                return { color: colors['number'] };
            case 'tag':
                return {
                    fontVariationSettings: '"wght" 500',
                    color,
                };
            case 'id':
            case 'id-decl': {
                const color = getRainbowHashColor(display.style.hash);
                return { fontStyle: 'normal', color };
            }
        }
        return { fontStyle: 'normal' };
    }
    switch (node.type) {
        case 'identifier':
            return { color: color };
        case 'stringText':
            return { color: color, whiteSpace: 'pre-wrap' };
    }
};

export const Render = ({
    idx,
    state,
    reg,
    path,
    display,
}: {
    idx: number;
    state: State;
    reg: Reg;
    path: Path[];
    display: Ctx['display'];
}) => {
    const node = state.map[idx];
    const onodes = getNodes(node, display[idx]?.layout);

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
                                style={textStyle(node, display[idx])}
                            >
                                {onode.text}
                            </span>
                        );
                    case 'ref':
                        return (
                            <Render
                                key={onode.id}
                                state={state}
                                display={display}
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
