import { Layout, MCString, MNodeExtra } from '../../types/mcst';
import { stringPunct } from './getNestedNodes';
import { NNode } from './NNode';

export function stringContents(
    node: MCString & MNodeExtra,
    layout?: Layout,
): NNode {
    if (!node.templates.length) {
        return {
            type: 'ref',
            id: node.first,
            path: { type: 'text', at: 0 },
        };
    }
    if (layout?.type !== 'multiline' || true) {
        return {
            type: 'horiz',
            children: [
                {
                    type: 'ref',
                    id: node.first,
                    path: { type: 'text', at: 0 },
                },
                ...node.templates.flatMap(({ expr, suffix }, i): NNode[] => [
                    {
                        type: 'punct',
                        text: '${',
                        color: stringPunct,
                    },
                    {
                        type: 'ref',
                        id: expr,
                        path: {
                            type: 'expr',
                            at: i + 1,
                        },
                    },
                    {
                        type: 'punct',
                        text: '}',
                        color: stringPunct,
                    },
                    {
                        type: 'ref',
                        id: suffix,
                        path: {
                            type: 'text',
                            at: i + 1,
                        },
                    },
                ]),
            ],
        };
    }
    return {
        type: 'vert',
        children: [
            {
                type: 'inline',
                children: [
                    {
                        type: 'ref',
                        id: node.first,
                        path: { type: 'text', at: 0 },
                    },
                    {
                        type: 'punct',
                        text: '${',
                        color: stringPunct,
                    },
                ],
            },
            ...node.templates.flatMap((item, i): NNode[] => [
                {
                    type: 'indent',
                    child: {
                        type: 'ref',
                        id: item.expr,
                        path: {
                            type: 'expr',
                            at: i + 1,
                        },
                    },
                },
                {
                    type: 'inline',
                    children: [
                        {
                            type: 'punct',
                            text: '}',
                            color: stringPunct,
                        },
                        {
                            type: 'ref',
                            id: item.suffix,
                            path: {
                                type: 'text',
                                at: i + 1,
                            },
                        },
                        ...(i < node.templates.length - 1
                            ? [
                                  {
                                      type: 'punct',
                                      text: '${',
                                      color: stringPunct,
                                  } satisfies NNode,
                              ]
                            : []),
                    ],
                },
            ]),
        ],
    };
}
