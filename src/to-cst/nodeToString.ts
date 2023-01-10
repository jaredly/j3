import { Node } from '../types/cst';

export const nodeToString = (node: Node): string => {
    switch (node.type) {
        case 'array':
            return `[${node.values.map((v) => nodeToString(v)).join(' ')}]`;
        case 'list':
            return `(${node.values.map((v) => nodeToString(v)).join(' ')})`;
        case 'record':
            return `{${node.values.map((v) => nodeToString(v)).join(' ')}}`;
        case 'identifier':
            return `${node.text}${node.hash ? '#' + node.hash : ''}`;
        case 'number':
            return node.raw;
        case 'tag':
            return `\`${node.text}`;
    }
    return `NOP(${node.type})`;
};
