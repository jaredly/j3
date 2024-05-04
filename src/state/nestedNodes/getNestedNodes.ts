import { idText } from '../../parse/parse';
import { Layout, MNode, Map } from '../../types/mcst';
import { NNode } from './NNode';
import { recordPairs } from './recordPairs';
import { renderList } from './renderList';
import { stringContents } from './stringContents';

export const stringColor = '#ff9b00';
export const stringPunct = 'yellow';
export const stringBgColor = 'rgba(255,200,0,0.1)';

export const getNestedNodes = (
    node: MNode,
    map: Map,
    text?: string,
    layout?: Layout,
): NNode => {
    if (!node) debugger;
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
                        ? [recordPairs(node.values, layout, map)]
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
                        ? layout.pairs
                            ? [
                                  recordPairs(
                                      node.values,
                                      layout,
                                      map,
                                  ) satisfies NNode,
                              ]
                            : [
                                  renderList(
                                      node,
                                      map,
                                      layout?.tightFirst,
                                  ) satisfies NNode,
                              ]
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
                    // ...withCommas(node.values),
                    ...(layout?.type === 'multiline'
                        ? layout.pairs
                            ? [recordPairs(node.values, layout, map)]
                            : [
                                  renderList(
                                      node,
                                      map,
                                      layout?.tightFirst,
                                  ) satisfies NNode,
                              ]
                        : withCommas(node.values)),
                    { type: 'brace', text: ']', at: 'end' },
                    { type: 'blinker', loc: 'end' },
                ],
            };
        case 'tapply':
            return {
                type: 'horiz',
                children: [
                    {
                        type: 'ref',
                        id: node.target,
                        path: { type: 'tapply-target' },
                    },
                    { type: 'brace', text: '<', at: 'start' },
                    ...withCommas(node.values),
                    { type: 'brace', text: '>', at: 'end' },
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
                        bgColor: stringBgColor,
                    },
                    stringContents(node, layout),
                    {
                        type: 'brace',
                        at: 'end',
                        color: stringColor,
                        text: '”',
                        bgColor: stringBgColor,
                    },
                    { type: 'blinker', loc: 'end' },
                ],
            };
        case 'comment-node':
            return {
                type: 'horiz',
                children: [
                    { type: 'blinker', loc: 'start' },
                    { type: 'punct', color: '#4eb94e', text: ';' },
                    {
                        type: 'ref',
                        id: node.contents,
                        path: { type: 'spread-contents' },
                        style: { fontStyle: 'italic', opacity: 0.6 },
                    },
                ],
            };
        case 'comment':
            return {
                type: 'horiz',
                style: {
                    fontFamily:
                        'Inter, "SF Pro Display", -apple-system, "system-ui"',
                    fontStyle: 'italic',
                },
                children: [
                    { type: 'blinker', loc: 'start' },
                    { type: 'punct', color: '#4eb94e', text: '; ' },
                    {
                        type: 'text',
                        text: text ?? idText(node, map) ?? '🚨',
                    },
                ],
            };
        case 'identifier':
        case 'unparsed':
        case 'blank':
        case 'accessText':
        case 'stringText':
        case 'attachment':
        case 'hash':
            return {
                type: 'text',
                text:
                    text ??
                    idText(node, map) ??
                    '🚨 getNestedNodes cant find text',
            };
        case 'raw-code':
            return {
                type: 'horiz',
                children: [
                    { type: 'blinker', loc: 'start' },
                    { type: 'raw-code', raw: node.raw, lang: node.lang },
                    { type: 'blinker', loc: 'end' },
                ],
            };
        case 'rich-text':
            return {
                type: 'horiz',
                children: [
                    { type: 'blinker', loc: 'start' },
                    { type: 'rich-text', contents: node.contents },
                    { type: 'blinker', loc: 'end' },
                ],
            };
        default:
            let _: never = node;
            throw new Error(`not handled ${(node as any).type}`);
    }
};

export function withCommas(values: number[], offset = 0): NNode[] {
    if (!values.length) {
        return [{ type: 'blinker', loc: 'inside' }];
    }
    // if (layout?.type === 'multiline') {
    //     layout.tightFirst
    // }
    return values.flatMap((id, i): NNode[] =>
        i === 0
            ? [{ type: 'ref', id, path: { type: 'child', at: i + offset } }]
            : [
                  { type: 'punct', text: ' ', color: 'white' },
                  { type: 'ref', id, path: { type: 'child', at: i + offset } },
              ],
    );
}
