import { lastName } from '../db/hash-tree';
import { Map, MNode } from '../types/mcst';

export const idText = (node: MNode, map: Map) => {
    switch (node.type) {
        case 'identifier':
            if (!node.text) {
                console.log('empty node text', node);
            }
        case 'comment':
            return node.text;
        case 'unparsed':
            return node.raw;
        case 'accessText':
        case 'stringText':
            return node.text;
        case 'blank':
            return '';
        case 'hash':
            if (
                typeof node.hash === 'string' &&
                node.hash.startsWith(':builtin:')
            ) {
                return lastName(node.hash.slice(':builtin:'.length));
            }
            if (typeof node.hash === 'number') {
                const ref = map[node.hash];
                if (ref?.type === 'identifier') {
                    return ref.text;
                }
            }
            return '🚨';
    }
};
