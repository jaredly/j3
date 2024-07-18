import { Style } from '../../shared/nodes';
import { IR } from './intermediate';

// type LayoutCache = Record<number, any>
type IRForLoc = Record<number, IR>;

type LayoutResult = {
    maxWidth: number;
    inlineWidth: number;
    inlineHeight: number;
    height: number;
};

export const space = 8;

export type LayoutChoices = Record<
    number,
    | { type: 'hwrap'; groups: number[] }
    | { type: 'switch'; which: number }
    | { type: 'text-wrap'; splits: number[] }
>;

export const layoutIR = (
    x: number,
    dedent: number,
    ir: IR,
    choices: LayoutChoices,
    ctx: {
        maxWidth: number;
        // width for LHSs
        leftWidth: number;
        irs: IRForLoc;
        layouts: Record<
            number,
            { result: LayoutResult; choices: LayoutChoices }
        >;
        // layouts: LayoutCache,
        textLayout: (
            text: string,
            dedent: number,
            style?: Style,
        ) => LayoutResult;
    },
): LayoutResult => {
    switch (ir.type) {
        case 'switch': {
            let res: LayoutResult;
            let which = ir.options.length - 1;
            for (let i = 0; i < ir.options.length; i++) {
                res = layoutIR(x, dedent, ir.options[i], choices, ctx);
                if (res.maxWidth + x <= ctx.maxWidth) {
                    which = i;
                    break;
                    // ir.which = i;
                    // return res;
                }
            }
            choices[ir.id] = { type: 'switch', which };
            return res!;
        }

        case 'loc': {
            const choices: LayoutChoices = {};
            const result = layoutIR(x, dedent, ctx.irs[ir.loc], choices, ctx);
            ctx.layouts[ir.loc] = { result, choices };
            return result;
        }
        case 'punct':
        case 'text':
            return ctx.textLayout(ir.text, dedent, ir.style);

        case 'inline': {
            let maxWidth = 0;
            let inlineWidth = 0;
            let height = 0;
            let inlineHeight = 0;
            ir.items.forEach((item, i) => {
                let next = layoutIR(
                    x + inlineWidth,
                    inlineWidth,
                    item,
                    choices,
                    ctx,
                );
                if (next.inlineHeight < next.height) {
                    height += next.height - inlineHeight;
                    maxWidth = Math.max(maxWidth, inlineWidth);
                    // we're on a new line
                    inlineWidth = next.inlineWidth;
                    inlineHeight = next.inlineHeight;
                } else {
                    inlineHeight = Math.max(inlineHeight, next.inlineHeight);
                    inlineWidth += next.inlineWidth;
                }
            });
            return { maxWidth, inlineWidth, inlineHeight, height };
        }

        case 'squish':
            return layoutIR(x, 0, ir.item, choices, {
                ...ctx,
                maxWidth: ctx.leftWidth,
            });

        case 'vert': {
            let inlineWidth = 0;
            let inlineHeight = 0;
            let maxWidth = 0;
            let height = 0;

            ir.items.forEach((item, i) => {
                const next = layoutIR(x, 0, item, choices, ctx);
                inlineWidth = next.inlineWidth;
                inlineHeight = next.inlineHeight;
                maxWidth = Math.max(maxWidth, next.maxWidth);
                height += next.height;
            });

            return { inlineWidth, inlineHeight, maxWidth, height };
        }
        case 'horiz': {
            let lineWidth = 0;
            let lineHeight = 0;
            let maxWidth = 0;
            let height = 0;
            let inlineHeight = 0;
            const groups: number[] = [0];

            ir.items.forEach((item, i) => {
                const w = layoutIR(x + lineWidth, 0, item, choices, ctx);
                lineWidth += w.maxWidth;
                inlineHeight = Math.max(inlineHeight, w.inlineHeight);

                if (ir.wrap != null && lineWidth + x > ctx.maxWidth && i > 0) {
                    maxWidth = Math.max(maxWidth, lineWidth - w.maxWidth);
                    height += lineHeight;

                    groups.push(i);
                    const w2 = layoutIR(
                        x + ir.wrap.indent * space,
                        0,
                        item,
                        choices,
                        ctx,
                    );
                    lineWidth = ir.wrap.indent * space + w2.maxWidth;
                    lineHeight = w2.height;
                    inlineHeight = w2.inlineHeight;
                } else {
                    lineHeight = Math.max(lineHeight, w.height);
                }
            });

            if (ir.wrap != null) {
                choices[ir.wrap.id] = { type: 'hwrap', groups };
            }

            maxWidth = Math.max(maxWidth, lineWidth);
            height += lineHeight;

            return { maxWidth, inlineWidth: lineWidth, height, inlineHeight };
        }
        case 'indent': {
            const indent = space * (ir.amount ?? 1);
            const res = layoutIR(x + indent, 0, ir.item, choices, ctx);
            return {
                maxWidth: res.maxWidth + indent,
                inlineWidth: res.inlineWidth + indent,
                height: res.height,
                inlineHeight: res.inlineHeight,
            };
        }
    }
    // throw new Error('no');
};
