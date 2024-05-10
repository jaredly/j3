import { Layout, Map } from '../../types/mcst';
import { NNode } from './NNode';

export const recordPairs = (
    nodes: number[],
    layout: Layout,
    map: Map,
): NNode => {
    if (!nodes.length) {
        return { type: 'blinker', loc: 'inside' };
    }
    const firstLine: NNode[] = [];
    const pairs: ([NNode] | [NNode, NNode])[] = [];
    for (let i = 0; i < nodes.length; ) {
        if (
            layout?.type === 'multiline' &&
            layout.tightFirst > 0 &&
            i < layout.tightFirst
        ) {
            firstLine.push({
                type: 'ref',
                id: nodes[i],
                path: { type: 'child', at: i },
            });
            if (i < layout.tightFirst - 1) {
                firstLine.push({ type: 'punct', text: ' ', color: 'white' });
            }

            i++;
            continue;
        }
        // if this is a single-line thing, +=1, otherwise +=2
        const next = map[nodes[i]];
        if (
            next?.type === 'comment' ||
            next?.type === 'rich-text' ||
            next?.type === 'comment-node'
        ) {
            pairs.push([
                { type: 'ref', id: nodes[i], path: { type: 'child', at: i } },
            ]);
            i += 1;
        } else if (i < nodes.length - 1) {
            pairs.push([
                { type: 'ref', id: nodes[i], path: { type: 'child', at: i } },
                {
                    type: 'ref',
                    id: nodes[i + 1],
                    path: { type: 'child', at: i + 1 },
                },
            ]);
            i += 2;
        } else {
            pairs.push([
                { type: 'ref', id: nodes[i], path: { type: 'child', at: i } },
            ]);
            i += 1;
        }
    }
    return { type: 'pairs', firstLine, children: pairs };
};
