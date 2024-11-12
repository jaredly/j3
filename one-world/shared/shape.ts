import { Node, RecNode } from './cnodes';

export const shape = (node: RecNode): string => {
    switch (node.type) {
        case 'id':
            if (node.ref) {
                return 'REF';
            }
            return `id(${node.text})`;
        case 'list':
            if (node.kind === 'round') {
                return `(${node.children.map(shape).join(' ')})`;
            }
            if (node.kind === 'square') {
                return `[${node.children.map(shape).join(' ')}]`;
            }
            if (typeof node.kind === 'string') {
                return `list[${node.kind}](${node.children
                    .map(shape)
                    .join(' ')})`;
            }
            return `list[${node.kind.type}](${node.children
                .map(shape)
                .join(' ')})`;
        case 'table':
            return `table...`;
        case 'text':
            return `text...`;
    }
};
