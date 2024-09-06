// It's a parser, that only does formatting!

import { termColors } from '../client/TextEdit/colors';
import { Layout } from '../shared/IR/intermediate';
import { Loc, RecNode, Style } from '../shared/nodes';
import { ParseResult } from './types';

export const parse = (node: RecNode): ParseResult<void> => {
    const ctx: Ctx = { layouts: {}, styles: {}, exports: [], tableHeaders: {} };

    const top = _parse(node, ctx);
    return { top, ...ctx };
};

// type Fmt = { loc: number; info: RenderInfo };
type Ctx = {
    // cursor?: { loc: number; autocomplete?: Autocomplete };
    // errors: ParseError[];
    // fmt: Fmt[];
    layouts: Record<number, Layout>;
    styles: Record<number, Style>;
    tableHeaders: Record<number, string[]>;
    // usages: Usage[];
    exports: { loc: Loc; kind: string }[];
};

// const tights: Record<string, Layout> = {
//     if: {type: 'vert', layout: {tightFirst: 2, indent: 2}},
//     '->': 1,
//     match: 1,
// }

const getLoc = (l: Loc) => l[l.length - 1][1];

const _parse = (node: RecNode, ctx: Ctx) => {
    switch (node.type) {
        case 'list':
            node.items.map((p) => _parse(p, ctx));
            if (node.items.length > 0) {
                const first = node.items[0];
                if (first.type === 'id') {
                    switch (first.text) {
                        case 'if':
                            ctx.layouts[getLoc(node.loc)] = {
                                type: 'vert',
                                layout: { tightFirst: 2, indent: 4 },
                            };
                            ctx.styles[getLoc(first.loc)] = kwdStyle;
                            break;
                        case 'match':
                            ctx.layouts[getLoc(node.loc)] = {
                                type: 'vert',
                                layout: { tightFirst: 2, indent: 2, pairs: [] },
                            };
                            ctx.styles[getLoc(first.loc)] = kwdStyle;
                            const table = node.items[2];
                            if (table && table.type === 'table') {
                                const width = table.rows.reduce(
                                    (m, r) => Math.max(m, r.length),
                                    0,
                                );
                                const headers =
                                    // width === 2
                                    //     ? ['pattern', 'body']
                                    //     :
                                    width === 3
                                        ? ['pattern', 'if', 'body']
                                        : undefined;
                                if (headers) {
                                    ctx.tableHeaders[getLoc(table.loc)] =
                                        headers;
                                }
                            }
                            break;
                        case 'let':
                            ctx.layouts[getLoc(node.loc)] = {
                                type: 'vert',
                                layout: { tightFirst: 2, indent: 2 },
                            };
                            ctx.styles[getLoc(first.loc)] = kwdStyle;
                            if (node.items[1]?.type === 'array') {
                                ctx.layouts[getLoc(node.items[1].loc)] = {
                                    type: 'vert',
                                    layout: {
                                        tightFirst: 0,
                                        indent: 0,
                                        pairs: [],
                                    },
                                };
                            }
                            break;
                        case 'def':
                            ctx.layouts[getLoc(node.loc)] = {
                                type: 'vert',
                                layout: { tightFirst: 2, indent: 2 },
                            };
                            ctx.styles[getLoc(first.loc)] = kwdStyle;
                            break;
                        case 'defn':
                            ctx.layouts[getLoc(node.loc)] = {
                                type: 'vert',
                                layout: { tightFirst: 3, indent: 2 },
                            };
                            const second = node.items[1];
                            if (second.type === 'id') {
                                ctx.exports.push({
                                    loc: second.loc,
                                    kind: 'value',
                                });
                            }
                            ctx.styles[getLoc(first.loc)] = kwdStyle;
                            break;
                    }
                }
            }
            return;
        case 'table':
            node.rows.forEach((row) =>
                row.forEach((cell) => _parse(cell, ctx)),
            );
            return;
        case 'array':
            ctx.layouts[getLoc(node.loc)] = {
                type: 'horiz',
                wrap: 0,
            };
            node.items.map((p) => _parse(p, ctx));
            return;
        case 'record':
            ctx.layouts[getLoc(node.loc)] = {
                type: 'vert',
                layout: { tightFirst: 0, indent: 0, pairs: [] },
            };
            node.items.map((p) => _parse(p, ctx));
            return;
    }
};

const kwdStyle: Style = {
    color: termColors.kwd,
    // fontStyle: 'italic',
    // fontWeight: 'bold'
    // textDecoration: 'underline',
};
