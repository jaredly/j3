// An intermediate representation

import { Nodes, Node, Style } from '../../shared/nodes';
import { ListDisplay, RenderInfo } from '../../shared/renderables';

type Format = Style;

const refStyle: Style = {
    fontWeight: 'bold',
    // type: 'text', style: { fontWeight: 'bold' }
};

export type IR =
    | { type: 'text'; text: string; style?: Style }
    | {
          type: 'vert';
          items: IR[];
          style?: Style;
          layout?: { tightFirst: number; pairs?: number[]; indent: number };
      }
    // | { type: 'squish'; item: IR; maxWidth: number }
    | { type: 'inline'; items: IR[]; style?: Style }
    | { type: 'horiz'; items: IR[]; style?: Style; wrap?: number } // number indicates indent amount
    | { type: 'indent'; item: IR; amount?: number; style?: Style }
    | { type: 'switch'; options: IR[] }
    | { type: 'loc'; loc: number }
    | { type: 'punct'; text: string; style?: Style };

export type Layout =
    | { type: 'horiz'; wrap?: number }
    | {
          type: 'vert';
          layout: {
              tightFirst: number;
              // This is funny, because it's a list of the LHS locs that shouldn't be squished.
              pairs?: number[];
              indent: number;
          };
      }
    | { type: 'pairs' }
    | { type: 'switch' };

export const nodeToIR = (
    node: Node,
    styles: Record<number, Format>,
    layouts: Record<number, Layout>,
    names: Record<string, Record<number, string>>,
): IR => {
    switch (node.type) {
        case 'array':
        case 'list':
        case 'record': {
            const lr = {
                array: '[]',
                list: '()',
                record: '{}',
            }[node.type];

            const l = layouts[node.loc] ?? { type: 'switch' };

            const items = node.items.map((loc): IR => ({ type: 'loc', loc }));

            switch (l.type) {
                case 'switch':
                    return {
                        type: 'horiz',
                        items: [
                            { type: 'punct', text: lr[0] },
                            {
                                type: 'switch',
                                options: [
                                    { type: 'horiz', items },
                                    {
                                        type: 'vert',
                                        items,
                                        layout: { tightFirst: 1, indent: 2 },
                                    },
                                ],
                            },
                            { type: 'punct', text: lr[1] },
                        ],
                    };
                case 'horiz':
                    return {
                        type: 'horiz',
                        wrap: l.wrap,
                        items: [
                            { type: 'punct', text: lr[0] },
                            ...items,
                            { type: 'punct', text: lr[1] },
                        ],
                    };
                case 'vert':
                    return {
                        type: 'horiz',
                        items: [
                            { type: 'punct', text: lr[0] },
                            { type: 'vert', items: items, layout: l.layout },
                            { type: 'punct', text: lr[1] },
                        ],
                    };
            }
            throw new Error('unknown layout');
        }

        // case 'rich-text':
        //     return { type: 'text', text: 'rich' };

        case 'id':
            return {
                type: 'text',
                text: node.ref
                    ? names[node.ref.toplevel][node.ref.loc]
                    : node.text,
                style: styles[node.loc] ?? node.ref ? refStyle : undefined,
            };

        case 'string': {
            const multi =
                node.first.includes('\n') ||
                node.templates.some((t) => t.suffix.includes('\n'));
            return {
                type: 'horiz',
                items: [
                    { type: 'loc', loc: node.tag },
                    { type: 'punct', text: '"' },
                    {
                        type: multi ? 'inline' : 'horiz',
                        style: multi
                            ? {
                                  background: 'red',
                              }
                            : undefined,
                        items: [
                            { type: 'text', text: node.first },
                            ...node.templates.flatMap((t): IR[] => [
                                { type: 'punct', text: '${' },
                                { type: 'loc', loc: t.expr },
                                { type: 'punct', text: '}' },
                                { type: 'text', text: t.suffix },
                            ]),
                        ],
                    },
                    { type: 'punct', text: '"' },
                ],
            };
        }

        case 'record-access':
            return {
                type: 'horiz',
                wrap: 2,
                items: [
                    { type: 'loc', loc: node.target },
                    ...node.items.map(
                        (loc): IR => ({
                            type: 'horiz',
                            items: [
                                { type: 'punct', text: '.' },
                                { type: 'loc', loc },
                            ],
                        }),
                    ),
                ],
            };
        case 'annot':
            return {
                type: 'horiz',
                items: [
                    { type: 'loc', loc: node.contents },
                    { type: 'punct', text: ':' },
                    { type: 'loc', loc: node.annot },
                ],
            };
        case 'comment':
        case 'spread':
            return {
                type: 'horiz',
                items: [
                    {
                        type: 'punct',
                        text: node.type === 'spread' ? '..' : ';',
                    },
                    { type: 'loc', loc: node.contents },
                ],
            };
    }
};
