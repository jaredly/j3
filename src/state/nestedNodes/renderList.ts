import { MNodeExtra, Map } from '../../types/mcst';
import { withCommas } from './getNestedNodes';
import { NNode } from './NNode';

export function renderList(
    node: {
        values: number[];
    } & MNodeExtra,
    map: Map,
    tightFirst?: number,
): NNode {
    if (tightFirst != null && tightFirst > 0) {
        const firstNode = node.values.length > 0 ? map[node.values[0]] : null;
        const [doc, first, rest] =
            firstNode?.type === 'rich-text' ||
            firstNode?.type === 'comment' ||
            firstNode?.type === 'blank'
                ? [
                      node.values[0],
                      node.values.slice(1, tightFirst + 1),
                      node.values.slice(tightFirst + 1),
                  ]
                : [
                      null,
                      node.values.slice(0, tightFirst),
                      node.values.slice(tightFirst),
                  ];
        return {
            type: 'vert',
            children: [
                ...(doc != null
                    ? [
                          {
                              type: 'ref',
                              id: doc,
                              path: { type: 'child', at: 0 },
                          } as const,
                      ]
                    : []),
                {
                    type: 'horiz',
                    children: withCommas(first, doc != null ? 1 : 0),
                },
                {
                    type: 'indent',
                    child: {
                        type: 'vert',
                        children: rest.map((id, i) => ({
                            type: 'ref',
                            id,
                            path: {
                                type: 'child',
                                at: i + tightFirst + (doc != null ? 1 : 0),
                            },
                        })),
                    },
                },
            ],
        };
    }
    return {
        type: 'vert',
        children: node.values.map((id, i) => ({
            type: 'ref',
            id,
            path: { type: 'child', at: i },
        })),
    };
}
