import { useMemo } from 'react';
import { Node } from '../../src/types/cst';
import { Map, toMCST } from '../../src/types/mcst';
import { RenderNNode } from './Render';
import { getNestedNodes } from '../../src/state/nestedNodes/getNestedNodes';
import { getDeepNestedNodes } from '../../src/state/nestedNodes/getNodes';
import React from 'react';
import { layout } from '../../src/layout';
import { Display } from '../../src/to-ast/library';
import { Path } from '../store';
import { useNode } from './store/useNode';

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
        return { map, root, top, display };
    }, [node]);

    return (
        <RenderNNode
            nnode={top}
            values={{
                display: {},
                static: true,
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

export const RenderReadOnly = ({
    idx,
    path,
}: {
    idx: number;
    path: Path[];
}) => {
    const values = useNode(idx, path, true);

    return (
        <RenderNNode
            key={idx}
            nnode={values.nnode}
            values={{
                ...values,
                reg: () => {},
            }}
            Recurse={RenderReadOnly}
            hoverPath={[]}
            idx={idx}
            path={path}
        />
    );
};
