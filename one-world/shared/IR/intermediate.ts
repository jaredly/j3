// An intermediate representation

import { Nodes, Node, Style } from '../nodes';
import { ListDisplay, RenderInfo } from '../renderables';

type Format = Style;

const refStyle: Style = {
    fontWeight: 'bold',
    // type: 'text', style: { fontWeight: 'bold' }
};

export type IR =
    // TODO allow wrapping text
    | { type: 'text'; text: string; style?: Style }
    | {
          type: 'vert';
          items: IR[];
          style?: Style;
          //   layout?: { tightFirst: number; pairs?: number[]; indent: number };
          pairs?: number[];
      }
    | { type: 'squish'; item: IR }
    | { type: 'inline'; items: IR[]; style?: Style }
    | {
          type: 'horiz';
          items: IR[];
          spaced?: 'all' | 'braced';
          pullLast?: boolean;
          style?: Style;
          wrap?: { indent: number; id: number };
      }
    | { type: 'indent'; item: IR; amount?: number; style?: Style }
    | { type: 'switch'; options: IR[]; id: number }
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

// const spaced = (items: IR[], space = ' '): IR[] =>
//     items.flatMap((item, i) =>
//         i === 0
//             ? [item]
//             : [{ type: 'punct', text: space, kind: 'space' }, item],
//     );

export const nodeToIR = (
    node: Node,
    styles: Record<number, Format>,
    layouts: Record<number, Layout>,
    names: Record<string, Record<number, string>>,
): IR => {
    switch (node.type) {
        case 'rich-inline':
        case 'rich-block':
            throw new Error('not impl yet');
        case 'array':
        case 'list':
        case 'record': {
            const lr = {
                array: '[]',
                list: '()',
                record: '{}',
            }[node.type];

            if (!node.items.length) {
                return {
                    type: 'horiz',
                    items: [
                        { type: 'punct', text: lr[0] },
                        { type: 'punct', text: lr[1] },
                    ],
                };
            }

            const l = layouts[node.loc] ?? { type: 'horiz', wrap: 2 };

            const items = node.items.map((loc): IR => ({ type: 'loc', loc }));

            switch (l.type) {
                case 'switch':
                    return {
                        type: 'horiz',
                        pullLast: true,
                        items: [
                            { type: 'punct', text: lr[0] },
                            items.length === 1
                                ? items[0]
                                : {
                                      type: 'switch',
                                      options: [
                                          {
                                              type: 'horiz',
                                              spaced: 'all',
                                              items: items,
                                          },
                                          {
                                              type: 'vert',
                                              items: [
                                                  items[0],
                                                  {
                                                      type: 'indent',
                                                      amount: 2,
                                                      item: {
                                                          type: 'vert',
                                                          items: items.slice(1),
                                                      },
                                                  },
                                              ],
                                          },
                                      ],
                                      id: 0,
                                  },
                            { type: 'punct', text: lr[1] },
                        ],
                    };
                case 'horiz':
                    return {
                        type: 'horiz',
                        pullLast: true,
                        wrap:
                            l.wrap != null ? { indent: l.wrap, id: 0 } : l.wrap,
                        spaced: 'braced',
                        items: [
                            { type: 'punct', text: lr[0] },
                            ...items,
                            // ...spaced(items, space),
                            { type: 'punct', text: lr[1] },
                        ],
                    };
                case 'vert': {
                    let mid: IR;
                    if (l.layout.pairs) {
                        const pairs: IR[] = [];
                        for (
                            let i = l.layout.tightFirst;
                            i < node.items.length;
                            i += 2
                        ) {
                            pairs.push(
                                i < node.items.length - 1
                                    ? {
                                          type: 'horiz',
                                          spaced: 'all',
                                          items: [
                                              l.layout.pairs.includes(
                                                  node.items[i],
                                              )
                                                  ? {
                                                        type: 'loc',
                                                        loc: node.items[i],
                                                    }
                                                  : {
                                                        type: 'squish',
                                                        item: {
                                                            type: 'loc',
                                                            loc: node.items[i],
                                                        },
                                                    },
                                              //   {
                                              //       type: 'punct',
                                              //       text: space,
                                              //       kind: 'space',
                                              //   },
                                              {
                                                  type: 'loc',
                                                  loc: node.items[i + 1],
                                              },
                                          ],
                                      }
                                    : { type: 'loc', loc: node.items[i] },
                            );
                        }
                        if (l.layout.tightFirst) {
                            mid = {
                                type: 'vert',
                                items: [
                                    {
                                        type: 'horiz',
                                        spaced: 'all',
                                        items: items.slice(
                                            0,
                                            l.layout.tightFirst,
                                        ),
                                    },
                                    ...(l.layout.indent
                                        ? [
                                              {
                                                  type: 'indent',
                                                  amount: l.layout.indent,
                                                  item: {
                                                      type: 'vert',
                                                      items: pairs,
                                                  },
                                              } satisfies IR,
                                          ]
                                        : pairs),
                                ],
                            };
                        } else {
                            mid = {
                                type: 'vert',
                                items: pairs,
                            };
                        }
                    } else {
                        mid = {
                            type: 'vert',
                            items: [
                                {
                                    type: 'horiz',
                                    items: items.slice(0, l.layout.tightFirst),
                                    spaced: 'all',
                                },
                                ...(l.layout.indent
                                    ? [
                                          {
                                              type: 'indent',
                                              amount: l.layout.indent,
                                              item: {
                                                  type: 'vert',
                                                  items: items.slice(
                                                      l.layout.tightFirst,
                                                  ),
                                              },
                                          } satisfies IR,
                                      ]
                                    : items),
                            ],
                        };
                    }
                    return {
                        type: 'horiz',
                        pullLast: true,
                        items: [
                            { type: 'punct', text: lr[0] },
                            mid,
                            { type: 'punct', text: lr[1] },
                        ],
                    };
                }
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
                wrap: { indent: 2, id: 0 },
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
