import { MNode } from '../../../src/types/mcst';

export const nodeChildren = (node: MNode): number[] => {
    switch (node.type) {
        case 'list':
        case 'array':
        case 'record':
            return node.values;
        case 'spread':
        case 'comment-node':
            return [node.contents];
        case 'string':
            return [
                node.first,
                ...node.templates.flatMap((t) => [t.expr, t.suffix]),
            ];
    }
    return [];
};
