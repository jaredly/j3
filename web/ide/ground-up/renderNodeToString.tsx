import { Display } from '../../../src/to-ast/library';
import { Map } from '../../../src/types/mcst';
import { getNestedNodes } from '../../../src/state/nestedNodes/getNestedNodes';
import { NNode } from '../../../src/state/nestedNodes/NNode';
import { white } from './reduce';
import { Block, StyledText } from '@blocknote/core';
import { filterNulls } from '../../custom/old-stuff/filterNulls';

export const renderNodeToString = (
    top: number,
    map: Map,
    left: number,
    display: Display,
) => {
    if (!map[top]) {
        return `MISSING NODE`;
    }
    const nnode = getNestedNodes(
        map[top],
        map,
        undefined,
        display[top]?.layout,
    );
    return renderNNode(nnode, map, left, display);
};

const styledToText = (
    st: Extract<
        Extract<Block, { type: 'paragraph' }>['content'],
        { concat: any }
    >[0],
): string => {
    switch (st.type) {
        case 'text':
            return st.text;
        case 'link':
            return `[${st.content.map(styledToText).join('')}](${st.href})`;
    }
};

const blockToText = (block: Block<any>): string => {
    switch (block.type) {
        case 'paragraph':
        case 'heading':
        case 'bulletListItem':
            const prefix =
                block.type === 'heading'
                    ? '## '
                    : block.type === 'bulletListItem'
                    ? '- '
                    : '';
            const children = block.children.map(blockToText).join('\n');
            const suffix = children ? '\n\n' + children : '';
            const c = block.content;
            if (Array.isArray(c)) {
                return prefix + c.map(styledToText).join('') + suffix;
            }
            return prefix + `[paragraph content ${JSON.stringify(c)}]${suffix}`;
    }
    return `cannot convert ${JSON.stringify(block)}`;
};

export const renderNNode = (
    nnode: NNode,
    map: Map,
    left: number,
    display: Display,
): string => {
    switch (nnode.type) {
        case 'nest':
            return renderNNode(nnode.inner, map, left, display);
        case 'dom':
            return '<dom node>';
        case 'rich-text':
            // return JSON.stringify(nnode.contents);
            return (
                '(** ' +
                nnode.contents
                    .map(blockToText)
                    .join('\n')
                    .replace(/\n/g, '\n'.padEnd(left + 5, ' ')) +
                ' **)'
            );
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
            const indent = Math.max(
                ...firsts.flatMap((f, i) =>
                    nnode.children[i].length === 2
                        ? f.split('\n').map((l) => l.length)
                        : 0,
                ),
            );
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
