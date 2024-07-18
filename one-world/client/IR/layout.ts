import { Style } from '../../shared/nodes';
import { IR } from './intermediate';

// type LayoutCache = Record<number, any>
type IRCache = Record<number, IR>;

type LayoutResult = {
    maxWidth: number;
    inlineWidth: number;
    height: number;
    groups?: number[];
};

export const space = 8;

export const layoutIR = (
    x: number,
    ir: IR,
    ctx: {
        maxWidth: number;
        // width for LHSs
        leftWidth: number;
        irs: IRCache;
        // layouts: LayoutCache,
        textLayout: (text: string, style?: Style) => { w: number; h: number };
    },
): LayoutResult => {
    switch (ir.type) {
        case 'loc':
            return layoutIR(x, ctx.irs[ir.loc], ctx);
        case 'punct':
        case 'text':
            const { w, h } = ctx.textLayout(ir.text, ir.style);
            return { maxWidth: w, inlineWidth: w, height: h };
        case 'horiz': {
            let lineWidth = 0;
            let lineHeight = 0;
            let maxWidth = 0;
            let height = 0;
            const groups: number[] = [0];

            ir.items.forEach((item, i) => {
                if (i > 0) lineWidth += space;
                const w = layoutIR(x + lineWidth, item, ctx);
                lineWidth += w.maxWidth;

                if (ir.wrap != null && lineWidth + x > ctx.maxWidth && i > 0) {
                    maxWidth = Math.max(
                        maxWidth,
                        lineWidth - w.maxWidth - space,
                    );
                    height += lineHeight;

                    groups.push(i);
                    const w2 = layoutIR(x + ir.wrap * space, item, ctx);
                    lineWidth = ir.wrap * space + w2.maxWidth;
                    lineHeight = w2.height;
                } else {
                    lineHeight = Math.max(lineHeight, w.height);
                }
            });

            maxWidth = Math.max(maxWidth, lineWidth);
            height += lineHeight;

            return { maxWidth, inlineWidth: lineWidth, groups, height };
        }
        case 'indent': {
            const indent = space * (ir.amount ?? 1);
            const width = layoutIR(x + indent, ir.item, ctx);
            return {
                maxWidth: width.maxWidth + indent,
                inlineWidth: width.inlineWidth + indent,
            };
        }
        case 'inline': {
        }
    }
};
