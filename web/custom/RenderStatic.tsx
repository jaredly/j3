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

export const RenderStatic = ({ node }: { node: Node }) => {
    const { map, root, top, display } = useMemo(() => {
        const map: Map = {};
        const root = toMCST(node, map);
        const display: Display = {};
        layout(root, 0, map, display, {});
        const top = getDeepNestedNodes(map[root], map, display);
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
            Recurse={() => {
                return (
                    <span>
                        ERROR: shouldnt have any 'ref's after rendering Deep
                        nested nodes
                    </span>
                );
            }}
            hoverPath={[]}
            idx={root}
            path={[]}
        />
    );
};
