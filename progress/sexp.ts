import { Node } from '../src/types/cst';

export const sexp = (node: Node): string => {
    switch (node.type) {
        case 'identifier':
            return 'id';
        case 'hash':
            return (node.hash + '').slice(0, 10);
        case 'list':
        case 'array':
        case 'record':
            return `(${node.type + (node.values.length ? ' ' : '')}${node.values
                .map(sexp)
                .join(' ')})`;
        case 'blank':
            return 'blank';
        case 'stringText':
            return 'stringText??';
        case 'accessText':
            return 'accessText??';
        case 'recordAccess':
            return `(access ${node.target.type === 'blank' ? '' : 'id '}${
                node.items.length
            })`;
        case 'annot':
            return `(annot ${sexp(node.target)} ${sexp(node.annot)})`;
        case 'spread':
            if (node.contents.type === 'blank') {
                return `(spread)`;
            }
            return `(spread ${sexp(node.contents)})`;
        case 'string':
            if (node.templates.length) {
                return `(string ${node.templates
                    .map((t) => sexp(t.expr))
                    .join(' ')})`;
            }
            return 'string';
        case 'tapply':
            return `(tapply ${sexp(node.target)} ${node.values
                .map(sexp)
                .join(' ')})`;
        case 'comment-node':
            return `(comment ${sexp(node.contents)})`;
        case 'comment':
            return 'comment';
        case 'raw-code':
            return 'raw-code';
        case 'rich-text':
            return 'rich-text';
        case 'attachment':
            return 'attachment';
        case 'unparsed':
            return 'unparsed';
        default:
            let _: never = node;
            return 'AA' + (node as any).type;
    }
};
