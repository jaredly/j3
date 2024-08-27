// An intermediate representation

import {
    fasthash,
    getRainbowHashColor,
    parseHex,
    rainbow,
    rgbRainbow,
} from '../../../web/custom/rainbow';
import { termColors } from '../../client/TextEdit/colors';
import {
    Nodes,
    Node,
    Style,
    Path,
    pathWithChildren,
    keyForLoc,
} from '../nodes';
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
          placeholder?: string;
          wrap?: number;
          style?: Style;
          index: number;
          path: Path;
          link?: string;
      }
    | { type: 'control'; path: Path; control: Control; index: number }
    | { type: 'table'; rows: IR[][]; style?: Style }
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
    | { type: 'loc'; path: Path }
    | { type: 'punct'; text: string; style?: Style; brace?: Path }
    | { type: 'cursor'; side: 'start' | 'inside' | 'end' | string; path: Path };

export type IRSelection = {
    start: { path: Path; key: string; cursor: IRCursor };
    // for multi-node selections.
    // NOTE that we normalize this so that start & end have the
    // same parent, before displaying / working with it at all.
    // but we hang on to the base paths.
    end?: { path: Path; key: string };
    // IFF end is a /parent/ of /start/, that means we did a
    // shift-up
};

export type IRCursor =
    | {
          type: 'text';
          start?: { index: number; cursor: number };
          end: { index: number; cursor: number; text?: string[] };
      }
    | { type: 'side'; side: 'start' | 'inside' | 'end' | string }
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

export const updateNodeText = (
    node: Node,
    index: number,
    text: string,
): Node | void => {
    switch (node.type) {
        case 'id':
            if (node.text === text) return;
            return { ...node, text };
        case 'string':
            if (index === 0) {
                if (node.first === text) return;
                return { ...node, first: text };
            } else if (index <= node.templates.length) {
                if (node.templates[index - 1].suffix === text) return;
                const templates = node.templates.slice();
                templates[index - 1] = {
                    ...templates[index - 1],
                    suffix: text,
                };
                return { ...node, templates };
            }
            return;
        case 'rich-inline':
            const span = node.spans[index];
            if (span.type !== 'text') return;
            const spans = node.spans.slice();
            spans[index] = { ...span, text };
            return { ...node, spans };
    }
};

const braceStyle = (depth: number): Style => {
    return {
        color: rgbRainbow[depth % rgbRainbow.length],
    };
};

export const nodeToIR = (
    node: Node,
    path: Path,
    styles: Record<number, Format> = {},
    layouts: Record<number, Layout> = {},
    names: Record<string, string> = {},
): IR => {
    switch (node.type) {
        case 'table':
            const columns = node.rows.reduce(
                (c, row) => Math.max(c, row.length),
                0,
            );
            return {
                type: 'horiz',
                pullLast: true,
                items: [
                    { type: 'cursor', path, side: 'start' },
                    { type: 'punct', text: '⦇' },
                    {
                        type: 'table',
                        rows: node.rows.map((row, r) => {
                            const res: IR[] = row.map((loc, c) =>
                                loc != null
                                    ? {
                                          type: 'loc',
                                          path: pathWithChildren(path, loc),
                                      }
                                    : {
                                          type: 'cursor',
                                          path,
                                          side: `${r},${c}`,
                                      },
                            );

                            // Sooo how do I know that a given row is allowed to do a
                            // "merge across"?
                            // Like ... if the left-most thing is a Spread or Comment,
                            // then it is allowed. BUT this is like a second-order issue.
                            // The parent needs to recalc if the child changes.
                            // Which, honestly, is fine, right?
                            // Hrmmm I mean maybe this is the only place that would happen.
                            // Alternatives inlclude:
                            // - everything is merged-across but we check on `space` whether
                            //   to create a new cell for you, based on the type of the current
                            //   thing. Honestly probably not the worst
                            // - punt on merging, just do normal tables for the moment.
                            // for (let c = res.length; c < columns; c++) {
                            //     res.push({
                            //         type: 'cursor',
                            //         path,
                            //         side: `${r},${c}`,
                            //     });
                            // }
                            return res;
                        }),
                    },
                    {
                        type: 'horiz',
                        items: [
                            { type: 'punct', text: '⦈' },
                            { type: 'cursor', path, side: 'end' },
                        ],
                    },
                ],
            };
        case 'rich-inline':
            // TODO: show header stuff
            return {
                type: 'inline',
                wrap: 0,
                items: node.spans.map((span, i) =>
                    span.type === 'embed'
                        ? {
                              type: 'loc',
                              path: pathWithChildren(path, span.item),
                          }
                        : {
                              type: 'text',
                              text: span.text,
                              style: span.style,
                              wrap: i + 1,
                              path,
                              index: i,
                              link:
                                  span.type === 'link' ? span.link : undefined,
                          },
                ),
            };
        case 'rich-block':
            if (!node.kind) {
                return {
                    type: 'horiz',
                    items: [
                        { type: 'cursor', path, side: 'start' },
                        { type: 'punct', text: '“' },
                        {
                            type: 'vert',
                            items: node.items.map((loc) => ({
                                type: 'loc',
                                path: pathWithChildren(path, loc),
                            })),
                        },
                        { type: 'punct', text: '”' },
                        { type: 'cursor', path, side: 'end' },
                    ],
                };
            }
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
                    const isChecks = node.kind.type === 'checks';
                    return {
                        type: 'vert',
                        items: node.items.map((loc, i) => ({
                            type: 'horiz',
                            items: [
                                {
                                    type: 'control',
                                    path,
                                    index: i,
                                    control: {
                                        type: isChecks ? 'check' : 'radio',
                                        checked: isChecked(loc),
                                        loc,
                                    },
                                },
                                {
                                    type: 'loc',
                                    path: pathWithChildren(path, loc),
                                },
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
                                    path,
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
                                {
                                    type: 'loc',
                                    path: pathWithChildren(path, loc),
                                },
                            ],
                        })),
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

            if (node.items.length < 2) {
                return {
                    type: 'horiz',
                    pullLast: true,
                    items: [
                        { type: 'cursor', path, side: 'start' },
                        {
                            type: 'punct',
                            text: lr[0],
                            brace: path,
                            style: braceStyle(path.children.length),
                        },
                        node.items.length
                            ? {
                                  type: 'loc',
                                  path: pathWithChildren(path, node.items[0]),
                              }
                            : { type: 'cursor', path, side: 'inside' },
                        {
                            type: 'punct',
                            text: lr[1],
                            brace: path,
                            style: braceStyle(path.children.length),
                        },
                        { type: 'cursor', path, side: 'end' },
                    ],
                };
            }

            const l = layouts[node.loc] ?? { type: 'horiz', wrap: 3 };

            const items = node.items.map(
                (loc): IR => ({
                    type: 'loc',
                    path: pathWithChildren(path, loc),
                }),
            );

            switch (l.type) {
                case 'switch':
                    return {
                        type: 'horiz',
                        pullLast: true,
                        items: [
                            { type: 'cursor', path, side: 'start' },
                            {
                                type: 'punct',
                                text: lr[0],
                                brace: path,
                                style: braceStyle(path.children.length),
                            },
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
                                    {
                                        type: 'punct',
                                        text: lr[1],
                                        brace: path,
                                        style: braceStyle(path.children.length),
                                    },
                                    {
                                        type: 'cursor',
                                        path,
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
                                    path,
                                    side: 'start',
                                },
                                {
                                    type: 'punct',
                                    text: lr[0],
                                    brace: path,
                                    style: braceStyle(path.children.length),
                                },
                                ...items,
                                {
                                    type: 'horiz',
                                    items: [
                                        {
                                            type: 'punct',
                                            text: lr[1],
                                            brace: path,
                                            style: braceStyle(
                                                path.children.length,
                                            ),
                                        },
                                        {
                                            type: 'cursor',
                                            path,
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
                                        path,
                                        side: 'start',
                                    },
                                    {
                                        type: 'punct',
                                        text: lr[0],
                                        brace: path,
                                        style: braceStyle(path.children.length),
                                    },
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
                                            {
                                                type: 'punct',
                                                text: lr[1],
                                                brace: path,
                                                style: braceStyle(
                                                    path.children.length,
                                                ),
                                            },
                                            {
                                                type: 'cursor',
                                                path,
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
                                                        path: pathWithChildren(
                                                            path,
                                                            node.items[i],
                                                        ),
                                                    }
                                                  : {
                                                        type: 'squish',
                                                        item: {
                                                            type: 'loc',
                                                            path: pathWithChildren(
                                                                path,
                                                                node.items[i],
                                                            ),
                                                        },
                                                    },
                                              {
                                                  type: 'loc',
                                                  path: pathWithChildren(
                                                      path,
                                                      node.items[i + 1],
                                                  ),
                                              },
                                          ],
                                      }
                                    : {
                                          type: 'loc',
                                          path: pathWithChildren(
                                              path,
                                              node.items[i],
                                          ),
                                      },
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
                            { type: 'cursor', path, side: 'start' },
                            {
                                type: 'punct',
                                text: lr[0],
                                brace: path,
                                style: braceStyle(path.children.length),
                            },
                            mid,
                            {
                                type: 'horiz',
                                items: [
                                    {
                                        type: 'punct',
                                        text: lr[1],
                                        brace: path,
                                        style: braceStyle(path.children.length),
                                    },
                                    {
                                        type: 'cursor',
                                        path,
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
            const text =
                node.ref?.type === 'toplevel'
                    ? names[keyForLoc(node.ref.loc)]
                    : node.text;

            return {
                type: 'text',
                text,
                placeholder:
                    node.ref?.type === 'placeholder'
                        ? node.ref.text
                        : undefined,
                style:
                    styles[node.loc] ??
                    (node.ref
                        ? refStyle
                        : {
                              color: parseHex(
                                  getRainbowHashColor(fasthash(text)),
                              ),
                          }),
                path,
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
                    { type: 'loc', path: pathWithChildren(path, node.tag) },
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
                                        path,
                                        index: 0,
                                    },
                                    ...node.templates.flatMap((t, i): IR[] => [
                                        {
                                            pullLast: true,
                                            type: 'horiz',
                                            items: [
                                                { type: 'punct', text: '${' },
                                                {
                                                    type: 'loc',
                                                    path: pathWithChildren(
                                                        path,
                                                        t.expr,
                                                    ),
                                                },
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
                                            path,
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
                                        path,
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
                    { type: 'loc', path: pathWithChildren(path, node.target) },
                    ...node.items.map(
                        (loc): IR => ({
                            type: 'horiz',
                            items: [
                                { type: 'punct', text: '.' },
                                {
                                    type: 'loc',
                                    path: pathWithChildren(path, loc),
                                },
                            ],
                        }),
                    ),
                ],
            };
        case 'annot':
            return {
                type: 'horiz',
                items: [
                    {
                        type: 'loc',
                        path: pathWithChildren(path, node.contents),
                    },
                    { type: 'punct', text: ':' },
                    { type: 'loc', path: pathWithChildren(path, node.annot) },
                ],
            };
        case 'comment':
        case 'spread':
            return {
                type: 'horiz',
                items: [
                    { type: 'cursor', path, side: 'start' },
                    {
                        type: 'punct',
                        text: node.type === 'spread' ? '..' : ';',
                    },
                    {
                        type: 'loc',
                        path: pathWithChildren(path, node.contents),
                    },
                ],
            };
        default:
            const _: never = node;
            throw new Error('not a thing');
    }
};
