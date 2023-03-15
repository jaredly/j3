import React from 'react';
import { Ctx } from '../../src/to-ast/Ctx';
import { MNode } from '../../src/types/mcst';
import { rainbow } from '../old/Nodes';
import { getNodes } from '../overheat/getNodes';
import { ONodeOld } from '../overheat/types';
import { Path, Selection } from '../store';
import { Action, State } from './ByHand';
import { RenderONode } from './RenderONode';

type Reg = (
    node: HTMLSpanElement | null,
    idx: number,
    path: Path[],
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
    number: '#8585ff', //'#4848a5',
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
            return { color: color, whiteSpace: 'pre' };
    }
};

export const Render = (props: RenderProps) => {
    const { idx, state, display } = props;
    const node = state.map[idx];
    const onodes = getNodes(node, display[idx]?.layout);

    return (
        <span>
            {onodes.map((onode, i) => (
                <RenderONode
                    i={i}
                    onodes={onodes}
                    onode={onode}
                    key={onode.type === 'ref' ? onode.id : i}
                    props={props}
                />
            ))}
        </span>
    );
};
