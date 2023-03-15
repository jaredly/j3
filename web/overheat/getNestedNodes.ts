import { idText } from '../../src/parse/parse';
import { Ctx } from '../../src/to-ast/Ctx';
import { Layout, MCString, MNode, MNodeExtra } from '../../src/types/mcst';
import { Path, PathChild } from '../store';

export const stringColor = '#ff9b00';

export type NNode =
    | { type: 'horiz'; children: NNode[] }
    | { type: 'vert'; children: NNode[] }
    | { type: 'pairs'; children: ([NNode] | [NNode, NNode])[] }
    | { type: 'indent'; child: NNode }
    | { type: 'punct'; text: string; color: string }
    | { type: 'text'; text: string }
    | { type: 'brace'; text: string; at: 'start' | 'end'; color?: string }
    | { type: 'ref'; id: number; path: PathChild }
    | { type: 'blinker'; loc: 'start' | 'inside' | 'end' };

export const getNestedNodes = (node: MNode, layout?: Layout): NNode => {
    const nodes = getNodes_(node, layout);
    if (nodes && node.tannot != null) {
        const extra: NNode[] = [
            { type: 'punct', text: ':', color: 'inherit' },
            {
                type: 'ref',
                id: node.tannot,
                path: { type: 'tannot' },
            },
        ];
        if (nodes.type === 'horiz') {
            nodes.children.push(...extra);
        } else {
            return { type: 'horiz', children: [nodes, ...extra] };
        }
    }
    return nodes;
};

export const getNodes_ = (node: MNode, layout?: Layout): NNode => {
    switch (node.type) {
        case 'spread':
            return {
                type: 'horiz',
                children: [
                    { type: 'blinker', loc: 'start' },
                    { type: 'punct', text: '..', color: 'unset' },
                    {
                        type: 'ref',
                        id: node.contents,
                        path: { type: 'spread-contents' },
                    },
                ],
            };
        case 'recordAccess': {
            const target: NNode = {
                type: 'ref',
                id: node.target,
                path: { type: 'record-target' },
            };
            const pairs = node.items.map((id, i): [NNode, NNode] => [
                { type: 'punct', text: '.', color: 'red' },
                {
                    type: 'ref',
                    id,
                    path: { type: 'attribute', at: i + 1 },
                },
            ]);
            if (layout?.type === 'multiline') {
                return {
                    type: 'vert',
                    children: [
                        target,
                        ...pairs.map(
                            (children): NNode => ({ type: 'horiz', children }),
                        ),
                    ],
                };
            } else {
                return {
                    type: 'horiz',
                    children: [target, ...pairs.flat()],
                };
            }
        }
        case 'record':
            return {
                type: 'horiz',
                children: [
                    { type: 'blinker', loc: 'start' },
                    { type: 'brace', text: '{', at: 'start' },
                    ...(layout?.type === 'multiline'
                        ? [
                              {
                                  type: 'punct',
                                  text: ' ',
                                  color: 'white',
                              } satisfies NNode,
                              recordPairs(node.values, layout),
                          ]
                        : withCommas(node.values)),
                    { type: 'brace', text: '}', at: 'end' },
                    { type: 'blinker', loc: 'end' },
                ],
            };
        // return [
        //     ...withCommas(node.values, layout),
        //     { type: 'punct', text: '}', color: 'rainbow' },
        //     { type: 'blinker', loc: 'end' },
        // ];
        case 'list':
            return {
                type: 'horiz',
                children: [
                    { type: 'blinker', loc: 'start' },
                    { type: 'brace', text: '(', at: 'start' },
                    ...(layout?.type === 'multiline'
                        ? [renderList(node, layout?.tightFirst) satisfies NNode]
                        : withCommas(node.values)),
                    { type: 'brace', text: ')', at: 'end' },
                    { type: 'blinker', loc: 'end' },
                ],
            };
        case 'array':
            return {
                type: 'horiz',
                children: [
                    { type: 'blinker', loc: 'start' },
                    { type: 'brace', text: '[', at: 'start' },
                    ...withCommas(node.values),
                    { type: 'brace', text: ']', at: 'end' },
                    { type: 'blinker', loc: 'end' },
                ],
            };
        case 'string':
            return {
                type: 'horiz',
                children: [
                    { type: 'blinker', loc: 'start' },
                    {
                        type: 'brace',
                        at: 'start',
                        text: '"',
                        color: stringColor,
                    },
                    stringContents(node, layout),
                    {
                        type: 'brace',
                        at: 'end',
                        color: stringColor,
                        text: '"',
                    },
                    { type: 'blinker', loc: 'end' },
                ],
            };
        case 'identifier':
        case 'tag':
        case 'comment':
        case 'number':
        case 'unparsed':
        case 'blank':
        case 'accessText':
        case 'stringText':
        case 'attachment':
        case 'rich-text':
            return { type: 'text', text: idText(node) ?? '' };
        default:
            let _: never = node;
            throw new Error(`not handled ${(node as any).type}`);
    }
    // return null;
};

function stringContents(node: MCString & MNodeExtra, layout?: Layout): NNode {
    if (!node.templates.length) {
        return {
            type: 'ref',
            id: node.first,
            path: { type: 'text', at: 0 },
        };
    }
    if (layout?.type !== 'multiline') {
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
                        color: stringColor,
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
                        color: stringColor,
                    },
                    {
                        type: 'ref',
                        id: suffix,
                        path: {
                            type: 'expr',
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
                type: 'horiz',
                children: [
                    {
                        type: 'ref',
                        id: node.first,
                        path: { type: 'text', at: 0 },
                    },
                    {
                        type: 'punct',
                        text: '${',
                        color: stringColor,
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
                    type: 'horiz',
                    children: [
                        {
                            type: 'punct',
                            text: '}',
                            color: stringColor,
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
                                      color: stringColor,
                                  } satisfies NNode,
                              ]
                            : []),
                    ],
                },
            ]),
        ],
    };
}

function renderList(
    node: {
        type: 'list';
        values: number[];
    } & MNodeExtra,
    tightFirst?: number,
): NNode {
    if (tightFirst != null && tightFirst > 0) {
        return {
            type: 'vert',
            children: [
                {
                    type: 'horiz',
                    children: withCommas(node.values.slice(0, tightFirst)),
                },
                {
                    type: 'indent',
                    child: {
                        type: 'vert',
                        children: node.values
                            .slice(tightFirst)
                            .map((id, i) => ({
                                type: 'ref',
                                id,
                                path: { type: 'child', at: i + tightFirst },
                            })),
                    },
                },
            ],
        };
    }
    return {
        type: 'indent',
        child: {
            type: 'vert',
            children: node.values.map((id, i) => ({
                type: 'ref',
                id,
                path: { type: 'child', at: i },
            })),
        },
    };
}

function withCommas(values: number[]): NNode[] {
    if (!values.length) {
        return [{ type: 'blinker', loc: 'inside' }];
    }
    // if (layout?.type === 'multiline') {
    //     layout.tightFirst
    // }
    return values.flatMap((id, i): NNode[] =>
        i === 0
            ? [{ type: 'ref', id, path: { type: 'child', at: i } }]
            : [
                  { type: 'punct', text: ' ', color: 'white' },
                  { type: 'ref', id, path: { type: 'child', at: i } },
              ],
    );
}

const recordPairs = (nodes: number[], layout?: Layout): NNode => {
    if (!nodes.length) {
        return { type: 'blinker', loc: 'inside' };
    }
    const pairs: ([NNode] | [NNode, NNode])[] = [];
    for (let i = 0; i < nodes.length; ) {
        // if this is a single-line thing, +=1, otherwise +=2
        if (i < nodes.length - 1) {
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
    return { type: 'pairs', children: pairs };
};
