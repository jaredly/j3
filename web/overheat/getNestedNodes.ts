import { idText } from '../../src/parse/parse';
import { Ctx, NodeStyle } from '../../src/to-ast/Ctx';
import { Layout, MCString, MNode, MNodeExtra } from '../../src/types/mcst';
import { Path, PathChild } from '../store';
import { ONode } from './types';

export const stringColor = '#ff9b00';
export const stringPunct = 'yellow';

export type NNode =
    | { type: 'horiz' | 'vert' | 'inline'; children: NNode[] }
    | { type: 'pairs'; children: ([NNode] | [NNode, NNode])[] }
    | { type: 'indent'; child: NNode }
    | { type: 'punct'; text: string; color: string }
    | { type: 'text'; text: string }
    | { type: 'brace'; text: string; at: 'start' | 'end'; color?: string }
    | { type: 'ref'; id: number; path: PathChild }
    | { type: 'blinker'; loc: 'start' | 'inside' | 'end' };

export const getNodes = (node: MNode, text?: string) =>
    unnestNodes(getNestedNodes(node, text));

export const unnestNodes = (node: NNode): ONode[] => {
    switch (node.type) {
        case 'horiz':
        case 'vert':
        case 'inline':
            return node.children.flatMap(unnestNodes);
        case 'pairs':
            return node.children.flatMap((nodes) => nodes.flatMap(unnestNodes));
        case 'indent':
            return unnestNodes(node.child);
        case 'punct':
            return [
                {
                    type: 'punct',
                    text: node.text,
                    color: node.color,
                },
            ];
        case 'text':
            return [{ type: 'render', text: node.text }];
        case 'brace':
            return [
                {
                    type: 'punct',
                    text: node.text,
                    color: node.color ?? 'rainbow',
                },
            ];
        case 'ref':
            return [node];
        case 'blinker':
            return [node];
    }
};

export const getNestedNodes = (
    node: MNode,
    text?: string,
    layout?: Layout,
): NNode => {
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
        case 'annot':
            return {
                type: 'horiz',
                children: [
                    {
                        type: 'ref',
                        id: node.target,
                        path: { type: 'annot-target' },
                    },
                    { type: 'punct', text: ':', color: '#666' },
                    {
                        type: 'ref',
                        id: node.annot,
                        path: { type: 'annot-annot' },
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
                        text: '“',
                        color: stringColor,
                    },
                    stringContents(node, layout),
                    {
                        type: 'brace',
                        at: 'end',
                        color: stringColor,
                        text: '”',
                    },
                    { type: 'blinker', loc: 'end' },
                ],
            };
        case 'identifier':
        case 'comment':
        case 'unparsed':
        case 'blank':
        case 'accessText':
        case 'stringText':
        case 'attachment':
        case 'rich-text':
        case 'hash':
            return { type: 'text', text: text ?? idText(node) ?? '' };
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
