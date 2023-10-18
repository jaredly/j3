import { Display } from '../../../src/to-ast/library';
import { Map } from '../../../src/types/mcst';
import { NNode, getNestedNodes } from '../../../src/state/getNestedNodes';
import { white } from './GroundUp';

export const renderNodeToString = (
    top: number,
    map: Map,
    left: number,
    display: Display,
) => {
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
            return nnode.text.replaceAll(/(?:[^\\])"/g, '\\"');
        case 'ref':
            return renderNodeToString(nnode.id, map, left, display);
        case 'pairs':
            return (
                nnode.firstLine
                    .map((c) => renderNNode(c, map, left, display))
                    .join('') +
                '\n' +
                white(left) +
                nnode.children
                    .map((c) =>
                        c
                            .map((c) => renderNNode(c, map, left + 4, display))
                            .join(' '),
                    )
                    .join('\n' + white(left))
            );
    }
};
