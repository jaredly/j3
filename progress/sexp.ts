import { Node } from '../src/types/cst';

export const sexp = (node: Node): string => {
    const res = sexp_(node);
    if (node.tannot) {
        return `(tannot ${res} ${sexp(node.tannot)})`;
    }
    return res;
};
const sexp_ = (node: Node): string => {
    switch (node.type) {
        case 'identifier':
            return 'id';
        case 'number':
            return 'NOPE';
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
        default:
            return 'AA' + node.type;
    }
};
