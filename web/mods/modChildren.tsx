import { MNodeContents } from '../../src/types/mcst';

export const modChildren = (
    node: MNodeContents,
    fn: (children: number[]) => void,
) => {
    switch (node.type) {
        case 'array':
        case 'list':
        case 'record':
        case 'tapply':
            const values = node.values.slice();
            fn(values);
            return { ...node, values };
    }
    return node;
};
