// An intermediate representation

import {
    fasthash,
    getRainbowHashColor,
    parseHex,
} from '../../../web/custom/rainbow';
import { termColors } from '../../client/TextEdit/colors';
import { Nodes, Node, Style, Path } from '../nodes';
import { ListDisplay, RenderInfo } from '../renderables';

type Format = Style;

const refStyle: Style = {
    fontWeight: 'bold',
    // type: 'text', style: { fontWeight: 'bold' }
};

export type Control =
    | {
          type: 'check' | 'radio';
          checked: boolean;
          loc: number;
      }
    | { type: 'bullet' }
    | { type: 'number'; num: number; width: number };

export type IR =
    // TODO allow wrapping text
    | {
          type: 'text';
          text: string;
          wrap?: number;
          style?: Style;
          index: number;
          loc: number;
          link?: string;
      }
    | { type: 'control'; loc: number; control: Control; index: number }
    | {
          type: 'vert';
          items: IR[];
          style?: Style;
          //   layout?: { tightFirst: number; pairs?: number[]; indent: number };
          pairs?: number[];
      }
    | { type: 'squish'; item: IR }
    | { type: 'inline'; items: IR[]; wrap: number; style?: Style }
    | {
          type: 'horiz';
          items: IR[];
          spaced?: boolean;
          pullLast?: boolean;
          style?: Style;
          wrap?: { indent: number; id: number };
      }
    | { type: 'indent'; item: IR; amount?: number; style?: Style }
    | { type: 'switch'; options: IR[]; id: number }
    | { type: 'loc'; loc: number }
    | { type: 'punct'; text: string; style?: Style }
    | { type: 'cursor'; side: 'start' | 'inside' | 'end'; loc: number };

export type IRSelection = {
    start: { path: Path; cursor: IRCursor };
    // for multi-node selections.
    // NOTE that we normalize this so that start & end have the
    // same parent, before displaying / working with it at all.
    // but we hang on to the base paths.
    end?: Path;
};

export type IRCursor =
    | {
          type: 'text';
          start?: { index: number; cursor: number };
          end: { index: number; cursor: number };
      }
    | { type: 'side'; side: 'start' | 'inside' | 'end' }
    | { type: 'control'; index: number };

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
            switch (node.kind.type) {
                case 'image':
                    return { type: 'punct', text: '🖼️' };
                default:
                    return {
                        type: 'text',
                        text: node.text,
                        style: node.style,
                        wrap: 0,
                        loc: node.loc,
                        index: 0,
                        link:
                            node.kind.type === 'link'
                                ? node.kind.url
                                : undefined,
                    };
            }
        case 'rich-block':
            switch (node.kind.type) {
                case 'checks':
                case 'opts':
                    let isChecked;
                    if (node.kind.type === 'checks') {
                        const c = node.kind.checked;
                        isChecked = (m: number) => c[m];
                    } else {
                        const which = node.kind.which;
                        isChecked = (m: number) => m === which;
                    }
                    return {
                        type: 'vert',
                        items: node.items.map((loc, i) => ({
                            type: 'horiz',
                            items: [
                                {
                                    type: 'control',
                                    loc: node.loc,
                                    index: i,
                                    control: {
                                        type:
                                            node.kind.type === 'checks'
                                                ? 'check'
                                                : 'radio',
                                        checked: isChecked(loc),
                                        loc,
                                    },
                                },
                                { type: 'loc', loc },
                            ],
                        })),
                    };
                case 'list':
                    const o = node.kind.ordered;
                    return {
                        type: 'vert',
                        items: node.items.map((loc, i) => ({
                            type: 'horiz',
                            items: [
                                {
                                    type: 'control',
                                    loc: node.loc,
                                    index: i,
                                    control: o
                                        ? {
                                              type: 'number',
                                              num: i + 1,
                                              width: node.items.length.toString()
                                                  .length,
                                          }
                                        : { type: 'bullet' },
                                },
                                { type: 'loc', loc },
                            ],
                        })),
                    };
                case 'paragraph':
                    return {
                        type: 'inline',
                        wrap: 0,
                        items: node.items.map((loc) => ({ type: 'loc', loc })),
                    };
            }
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
                        { type: 'cursor', loc: node.loc, side: 'start' },
                        { type: 'punct', text: lr[0] },
                        { type: 'cursor', loc: node.loc, side: 'inside' },
                        { type: 'punct', text: lr[1] },
                        { type: 'cursor', loc: node.loc, side: 'end' },
                    ],
                };
            }

            const l = layouts[node.loc] ?? { type: 'horiz', wrap: 3 };

            const items = node.items.map((loc): IR => ({ type: 'loc', loc }));

            switch (l.type) {
                case 'switch':
                    return {
                        type: 'horiz',
                        pullLast: true,
                        items: [
                            { type: 'cursor', loc: node.loc, side: 'start' },
                            { type: 'punct', text: lr[0] },
                            items.length === 1
                                ? items[0]
                                : {
                                      type: 'switch',
                                      options: [
                                          {
                                              type: 'horiz',
                                              spaced: true,
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
                            {
                                type: 'horiz',
                                items: [
                                    { type: 'punct', text: lr[1] },
                                    {
                                        type: 'cursor',
                                        loc: node.loc,
                                        side: 'end',
                                    },
                                ],
                            },
                        ],
                    };
                case 'horiz':
                    if (items.length < 2) {
                        return {
                            type: 'horiz',
                            pullLast: true,
                            items: [
                                {
                                    type: 'cursor',
                                    loc: node.loc,
                                    side: 'start',
                                },
                                { type: 'punct', text: lr[0] },
                                ...items,
                                {
                                    type: 'horiz',
                                    items: [
                                        { type: 'punct', text: lr[1] },
                                        {
                                            type: 'cursor',
                                            loc: node.loc,
                                            side: 'end',
                                        },
                                    ],
                                },
                            ],
                        };
                    }
                    return {
                        type: 'horiz',
                        pullLast: true,
                        wrap:
                            l.wrap != null ? { indent: l.wrap, id: 0 } : l.wrap,
                        spaced: true,
                        items: [
                            {
                                type: 'horiz',
                                items: [
                                    {
                                        type: 'cursor',
                                        loc: node.loc,
                                        side: 'start',
                                    },
                                    { type: 'punct', text: lr[0] },
                                    items[0],
                                ],
                            },
                            ...items.slice(1, -1),
                            {
                                type: 'horiz',
                                pullLast: true,
                                items: [
                                    items[items.length - 1],
                                    {
                                        type: 'horiz',
                                        items: [
                                            { type: 'punct', text: lr[1] },
                                            {
                                                type: 'cursor',
                                                loc: node.loc,
                                                side: 'end',
                                            },
                                        ],
                                    },
                                ],
                            },
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
                                          spaced: true,
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
                                        spaced: true,
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
                                                      pairs: l.layout.pairs,
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
                                pairs: l.layout.pairs,
                            };
                        }
                    } else {
                        mid = {
                            type: 'vert',
                            items: [
                                {
                                    type: 'horiz',
                                    items: items.slice(0, l.layout.tightFirst),
                                    spaced: true,
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
                            { type: 'cursor', loc: node.loc, side: 'start' },
                            { type: 'punct', text: lr[0] },
                            mid,
                            {
                                type: 'horiz',
                                items: [
                                    { type: 'punct', text: lr[1] },
                                    {
                                        type: 'cursor',
                                        loc: node.loc,
                                        side: 'end',
                                    },
                                ],
                            },
                        ],
                    };
                }
            }
            throw new Error('unknown layout');
        }

        // case 'rich-text':
        //     return { type: 'text', text: 'rich' };

        case 'id': {
            const text = node.ref
                ? names[node.ref.toplevel][node.ref.loc]
                : node.text;

            return {
                type: 'text',
                text,
                style:
                    styles[node.loc] ?? node.ref
                        ? refStyle
                        : {
                              color: parseHex(
                                  getRainbowHashColor(fasthash(text)),
                              ),
                          },
                loc: node.loc,
                index: 0,
            };
        }

        case 'string': {
            const multi =
                node.first.includes('\n') ||
                node.templates.some((t) => t.suffix.includes('\n'));
            return {
                type: 'horiz',
                items: [
                    { type: 'loc', loc: node.tag },
                    {
                        type: 'horiz',
                        pullLast: true,
                        style: { background: termColors.stringBg },
                        items: [
                            {
                                type: 'punct',
                                text: '"',
                                style: { color: termColors.string },
                            },
                            {
                                type: 'inline',
                                wrap: 0,
                                items: [
                                    {
                                        type: 'text',
                                        text: node.first,
                                        style: {
                                            color: { r: 100, g: 100, b: 0 },
                                        },
                                        wrap: 1,
                                        loc: node.loc,
                                        index: 0,
                                    },
                                    ...node.templates.flatMap((t, i): IR[] => [
                                        {
                                            pullLast: true,
                                            type: 'horiz',
                                            items: [
                                                { type: 'punct', text: '${' },
                                                // {
                                                //     type: 'horiz',
                                                //     items: [
                                                {
                                                    type: 'loc',
                                                    loc: t.expr,
                                                },
                                                //     ],
                                                //     style: {
                                                //         background: false,
                                                //     },
                                                // },
                                                { type: 'punct', text: '}' },
                                            ],
                                        },
                                        {
                                            type: 'text',
                                            text: t.suffix,
                                            style: {
                                                color: { r: 100, g: 100, b: 0 },
                                            },
                                            wrap: i + 2,
                                            loc: node.loc,
                                            index: i + 1,
                                        },
                                    ]),
                                ],
                            },
                            {
                                type: 'horiz',
                                items: [
                                    {
                                        type: 'punct',
                                        text: '"',
                                        style: {
                                            color: { r: 100, g: 100, b: 0 },
                                        },
                                    },
                                    {
                                        type: 'cursor',
                                        loc: node.loc,
                                        side: 'end',
                                    },
                                ],
                            },
                        ],
                    },
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
                    { type: 'cursor', loc: node.loc, side: 'start' },
                    {
                        type: 'punct',
                        text: node.type === 'spread' ? '..' : ';',
                    },
                    { type: 'loc', loc: node.contents },
                ],
            };
    }
};
