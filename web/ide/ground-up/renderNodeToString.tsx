import { Display } from '../../../src/to-ast/library';
import { Map } from '../../../src/types/mcst';
import { NNode, getNestedNodes } from '../../../src/state/getNestedNodes';
import { white } from './reduce';

export const renderNodeToString = (
    top: number,
    map: Map,
    left: number,
    display: Display,
) => {
    if (!map[top]) {
        return `MISSING NODE`;
    }
    const nnode = getNestedNodes(map[top], map, undefined, display[top].layout);
    return renderNNode(nnode, map, left, display);
};

export const renderNNode = (
    nnode: NNode,
    map: Map,
    left: number,
    display: Display,
): string => {
    switch (nnode.type) {
        case 'dom':
            return '<dom node>';
        case 'horiz':
        case 'inline':
            return nnode.children
                .map((c) => renderNNode(c, map, left, display))
                .join('');
        case 'vert':
            return nnode.children
                .map((c) => renderNNode(c, map, left, display))
                .join('\n' + white(left + 4));
        case 'blinker':
            return '';
        case 'brace':
            return nnode.text;
        case 'indent':
            return renderNNode(nnode.child, map, left + 4, display);
        case 'punct':
            return nnode.text;
        case 'text':
            return JSON.stringify(
                nnode.text.replace(/\\./g, (matched) => {
                    if (matched[1] === 'n') {
                        return '\n';
                    }
                    return matched[1];
                }),
            ).slice(1, -1);
        case 'ref':
            return renderNodeToString(nnode.id, map, left, display);
        case 'pairs': {
            const firsts = nnode.children.map((child) =>
                renderNNode(child[0], map, left + 4, display),
            );
            const indent = Math.max(...firsts.map((f) => f.length));
            return (
                nnode.firstLine
                    .map((c) => renderNNode(c, map, left, display))
                    .join('') +
                '\n' +
                white(left + 4) +
                nnode.children
                    .map((c, i) => {
                        if (c.length === 1) return firsts[i];
                        return `${firsts[i].padEnd(indent, ' ')} ${renderNNode(
                            c[1],
                            map,
                            left + 5 + indent,
                            display,
                        )}`;
                    })
                    .join('\n' + white(left + 4))
            );
        }
    }
};
