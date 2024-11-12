import { splitGraphemes } from '../../src/parse/splitGraphemes';
import { Collection, Id, List, Node, Nodes, Text } from '../shared/cnodes';
import { addBlankAfter } from './addBlankAfter';
import { splitInList } from './splitInList';
import { wrapId } from './wrapId';

export const replaceIn = (node: Node, old: number, loc: number): Node => {
    if (node.type === 'id') {
        throw new Error(`no children of id`);
    }
    if (node.type === 'text') {
        const at = node.spans.findIndex(
            (span) => span.type === 'embed' && span.item === old,
        );
        if (at === -1)
            throw new Error(`cant find ${old} child of text ${node.loc}`);
        const spans = node.spans.slice();
        spans[at] = { type: 'embed', item: loc };
        return { ...node, spans };
    }
    if (node.type === 'list') {
        const at = node.children.indexOf(old);
        if (at === -1)
            throw new Error(`cant find ${old} child of list ${node.loc}`);
        const children = node.children.slice();
        children[at] = loc;
        return { ...node, children };
    }
    if (node.type === 'table') {
        const rows = node.rows.slice();
        let found = false;
        for (let i = 0; i < rows.length; i++) {
            const at = rows[i].indexOf(old);
            if (at !== -1) {
                found = true;
                rows[i] = rows[i].slice();
                rows[i][at] = loc;
                break;
            }
        }
        if (!found)
            throw new Error(`cant find ${old} child of table ${node.loc}`);
        return { ...node, rows };
    }
    throw new Error(`unexpected node type ${(node as any).type}`);
};
