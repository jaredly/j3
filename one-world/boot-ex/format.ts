// It's a parser, that only does formatting!

import { termColors } from '../client/TextEdit/colors';
import { Layout } from '../shared/IR/intermediate';
import { Loc, RecNode, Style } from '../shared/nodes';

export const parse = (node: RecNode) => {
    const ctx: Ctx = { layouts: {}, styles: {} };

    const result = _parse(node, ctx);
    return { result, ...ctx };
};

// type Fmt = { loc: number; info: RenderInfo };
type Ctx = {
    // cursor?: { loc: number; autocomplete?: Autocomplete };
    // errors: ParseError[];
    // fmt: Fmt[];
    layouts: Record<number, Layout>;
    styles: Record<number, Style>;
    // usages: Usage[];
    // exports: { loc: number; kind: string }[];
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
                                layout: { tightFirst: 2, indent: 2 },
                            };
                            ctx.styles[getLoc(first.loc)] = kwdStyle;
                            break;
                        case 'let':
                            ctx.layouts[getLoc(node.loc)] = {
                                type: 'vert',
                                layout: { tightFirst: 2, indent: 2 },
                            };
                            ctx.styles[getLoc(first.loc)] = kwdStyle;
                            // if (node.items[1]?.type === 'array') {
                            //     ctx.layouts[getLoc(node.items[1].loc)] = {
                            //         type: 'vert',
                            //         layout: { tightFirst: 0, indent: 0 },
                            //     };
                            // }
                            break;
                        case 'defn':
                            ctx.layouts[getLoc(node.loc)] = {
                                type: 'vert',
                                layout: { tightFirst: 3, indent: 6 },
                            };
                            ctx.styles[getLoc(first.loc)] = kwdStyle;
                            break;
                    }
                }
            }
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
                layout: { tightFirst: 0, indent: 0 },
            };
            node.items.map((p) => _parse(p, ctx));
            return;
        // case 'id':
        //     if (node.text)
    }
};

const kwdStyle: Style = {
    color: termColors.kwd,
    // fontStyle: 'italic',
    // fontWeight: 'bold'
    // textDecoration: 'underline',
};
