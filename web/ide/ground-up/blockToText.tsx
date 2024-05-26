import { Block } from '@blocknote/core';

export const blockToHtml = (block: Block<any>): string => {
    let children = block.children.map(blockToText).join('\n');
    if (children.length) {
        children = `<div>${children}</div>`;
    }
    const c = block.content;
    const content = Array.isArray(c)
        ? c.map(styledToText).join('')
        : `[paragraph content ${JSON.stringify(c)}]`;
    switch (block.type) {
        case 'paragraph':
            return `<p style="margin: 0; padding: 0">${content}</p>` + children;
        case 'heading':
            return `<h1>${content}</h1>` + children;
        case 'numberedListItem':
            return `<li>${content}</li>` + children;
        case 'bulletListItem':
            return `<li>${content}</li>` + children;
        default:
            return `TY ${block.type}<br>${content}` + children;
    }
};

export const blockToText = (block: Block<any>): string => {
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
