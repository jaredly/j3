import * as React from 'react';
import { parse } from '../../src/grammar';
import { nodeToType } from '../../src/to-ast/nodeToType';
import { newCtx } from '../../src/to-ast/to-ast';
import { Render } from './type';

export const SvgRender: Render = {
    id: 'svg',
    expected: nodeToType(
        parse('{pos {x int y int} size {x int y int}}')[0],
        newCtx(),
    ),
    render(node: {
        pos: { x: number; y: number };
        size: { x: number; y: number };
    }) {
        return (
            <svg width="200" height="200" style={{ backgroundColor: '#666' }}>
                <rect
                    x={node.pos.x}
                    y={node.pos.y}
                    width={node.size.x}
                    height={node.size.y}
                    fill="black"
                />
            </svg>
        );
    },
};
