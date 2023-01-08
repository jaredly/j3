import { Node } from '../types/cst';

export const nodeToString = (node: Node): string => {
    switch (node.contents.type) {
        case 'array':
            return `[${node.contents.values
                .map((v) => nodeToString(v))
                .join(' ')}]`;
        case 'list':
            return `(${node.contents.values
                .map((v) => nodeToString(v))
                .join(' ')})`;
        case 'record':
            return `{${node.contents.values
                .map((v) => nodeToString(v))
                .join(' ')}}`;
        case 'identifier':
            return `${node.contents.text}${
                node.contents.hash ? '#' + node.contents.hash : ''
            }`;
        case 'number':
            return node.contents.raw;
        case 'tag':
            return `\`${node.contents.text}`;
    }
    return `NOP(${node.contents.type})`;
};
