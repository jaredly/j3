import { Node } from '../types/cst';

export type SourceMap = {
    map: { [idx: number]: { start: number; end: number } };
    cur: number;
};

export const nodeToString = (
    node: Node,
    sm: SourceMap = { map: {}, cur: 0 },
    addBefore = 0,
): string => {
    sm.cur += addBefore;
    const start = sm.cur;
    let body = nodeToString_(node, sm);
    sm.cur = start + body.length;
    sm.map[node.loc.idx] = { start, end: sm.cur };
    if (node.tannot) {
        body += ':' + nodeToString(node.tannot, sm);
    }
    return body;
};

export const nodeToString_ = (
    node: Node,
    sm: SourceMap = { map: {}, cur: 0 },
): string => {
    switch (node.type) {
        case 'array':
            return `[${node.values
                .map((v) => nodeToString(v, sm, 1))
                .join(' ')}]`;
        case 'list':
            return `(${node.values
                .map((v) => nodeToString(v, sm, 1))
                .join(' ')})`;
        case 'record':
            return `{${node.values
                .map((v) => nodeToString(v, sm, 1))
                .join(' ')}}`;
        case 'identifier':
            return `${node.text}${node.hash ? '#' + node.hash : ''}`;
        case 'number':
            return node.raw;
        case 'blank':
            return '';
        case 'tag':
            return `'${node.text}`;
        case 'recordAccess':
            return `${nodeToString(node.target, sm)}${node.items
                .map((item) => '.' + item.text)
                .join('')}`;
        case 'spread':
            return `..${nodeToString(node.contents, sm, 3)}`;
        case 'stringText':
            return node.text;
        case 'string':
            return `"${nodeToString(node.first, sm, 1)}${node.templates
                .map(
                    (item) =>
                        `\${${nodeToString(item.expr, sm, 2)}}${nodeToString(
                            item.suffix,
                            sm,
                            1,
                        )}`,
                )
                .join('')}"`;
        case 'unparsed':
            return node.raw;
    }
    return `NOP(${node.type})`;
};
