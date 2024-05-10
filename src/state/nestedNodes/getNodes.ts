import { Display } from '../../to-ast/library';
import { MNode, Map } from '../../types/mcst';
import { ONode } from '../types';
import { NNode } from './NNode';
import { getNestedNodes } from './getNestedNodes';
import { transformNode } from './NNode';

export const getNodes = (node: MNode, map: Map, text?: string) =>
    unnestNodes(getNestedNodes(node, map, text));

export const unnestNodes = (node: NNode): ONode[] => {
    switch (node.type) {
        case 'nest':
            return unnestNodes(node.inner);
        case 'horiz':
        case 'vert':
        case 'inline':
            return node.children.flatMap(unnestNodes);
        case 'pairs':
            return node.firstLine
                .flatMap(unnestNodes)
                .concat(
                    node.children.flatMap((nodes) =>
                        nodes.flatMap(unnestNodes),
                    ),
                );
        case 'indent':
            // STOPSHIP: this might mess with things
            // as I'm losing the subpath dealio
            // case 'sub-path':
            return unnestNodes(node.child);
        case 'punct':
            return [
                {
                    type: 'punct',
                    text: node.text,
                    color: node.color,
                },
            ];
        case 'text':
            return [{ type: 'render', text: node.text }];
        case 'brace':
            return [
                {
                    type: 'punct',
                    text: node.text,
                    color: node.color ?? 'rainbow',
                },
            ];
        case 'dom':
        case 'rich-text':
        case 'raw-code':
            return [];
        case 'ref':
        case 'blinker':
            return [node];
    }
};

export const getDeepNestedNodes = (
    node: MNode,
    map: Map,
    display: Display,
): NNode => {
    const base = getNestedNodes(
        node,
        map,
        undefined,
        display[node.loc]?.layout,
    );

    return transformNode(base, (node) => {
        if (node.type === 'ref') {
            return {
                type: 'nest',
                inner: getDeepNestedNodes(map[node.id], map, display),
                node: map[node.id],
            };
        }
        return node;
    });
};
