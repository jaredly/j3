import { useMemo } from 'react';
import { Node } from '../../src/types/cst';
import { Map, toMCST } from '../../src/types/mcst';
import { RenderNNode } from './Render';
import {
    getDeepNestedNodes,
    getNestedNodes,
} from '../../src/state/getNestedNodes';
import React from 'react';
import { layout } from '../../src/layout';
import { Display } from '../../src/to-ast/library';
import { Path } from '../store';

export const RenderStatic = ({
    node,
    path,
    display,
}: {
    node: Node;
    path?: Path[];
    display?: Display;
}) => {
    const { map, root, top } = useMemo(() => {
        const map: Map = {};
        const root = toMCST(node, map);
        const myDisplay: Display = display ?? {};
        if (!display) {
            layout(root, 0, map, myDisplay, {});
        }
        const top = getDeepNestedNodes(map[root], map, myDisplay);
        console.log('deep', top);
        return { map, root, top, display };
    }, [node]);

    return (
        <RenderNNode
            nnode={top}
            values={{
                display: {},
                highlight: false,
                meta: {},
                nnode: top,
                node: map[root],
                reg: () => {},
                unused: false,
            }}
            Recurse={({ idx }) => {
                return <span>ref {idx}??</span>;
            }}
            hoverPath={[]}
            idx={root}
            path={[]}
        />
    );
};
