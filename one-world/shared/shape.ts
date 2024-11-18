import { RecNodeT } from './cnodes';

export const shape = (node: RecNodeT<unknown>): string => {
    switch (node.type) {
        case 'id':
            if (node.ref) {
                return 'REF';
            }
            return `id(${node.text}${node.ccls != null ? '/' + node.ccls : ''})`;
        case 'list':
            if (node.kind === 'round') {
                return `(${node.children.map(shape).join(' ')})`;
            }
            if (node.kind === 'square') {
                return `[${node.children.map(shape).join(' ')}]`;
            }
            if (typeof node.kind === 'string') {
                return `list[${node.kind}](${node.children.map(shape).join(' ')})`;
            }
            return `list[${node.kind.type}](${node.children.map(shape).join(' ')})`;
        case 'table':
            return `table...`;
        case 'text':
            return `text(${node.spans.map((span) => {
                switch (span.type) {
                    case 'text':
                        return span.text;
                    case 'embed':
                        return `\${${shape(span.item)}}`;
                    default:
                        throw new Error('not shaping a ' + span.type);
                }
            })})`;
    }
};
