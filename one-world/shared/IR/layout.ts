import { Style } from '../nodes';
import { IR } from './intermediate';

// type LayoutCache = Record<number, any>
type IRForLoc = Record<number, IR>;

type LayoutResult = {
    maxWidth: number;
    inlineWidth: number;
    inlineHeight: number;
    height: number;
};

// export const space = 8;

export type LayoutChoices = Record<
    number,
    | { type: 'hwrap'; groups: number[] }
    | { type: 'switch'; which: number }
    | { type: 'text-wrap'; splits: number[] }
>;

export type LayoutCtx = {
    maxWidth: number;
    // width for LHSs
    leftWidth: number;
    irs: IRForLoc;
    layouts: Record<
        number,
        {
            result: LayoutResult;
            choices: LayoutChoices;
        }
    >;
    // layouts: LayoutCache,
    textLayout: (text: string, dedent: number, style?: Style) => LayoutResult;
};

export const layoutIR = (
    x: number,
    firstLine: number,
    ir: IR,
    choices: LayoutChoices,
    ctx: LayoutCtx,
): LayoutResult => {
    switch (ir.type) {
        case 'switch': {
            let res: LayoutResult;
            let which = ir.options.length - 1;
            for (let i = 0; i < ir.options.length; i++) {
                res = layoutIR(x, firstLine, ir.options[i], choices, ctx);
                if (res.maxWidth + x <= ctx.maxWidth) {
                    which = i;
                    break;
                }
            }
            choices[ir.id] = { type: 'switch', which };
            return res!;
        }

        case 'loc': {
            const choices: LayoutChoices = {};
            const result = layoutIR(
                x,
                firstLine,
                ctx.irs[ir.loc],
                choices,
                ctx,
            );
            ctx.layouts[ir.loc] = { result, choices };
            return result;
        }
        case 'punct':
            return ctx.textLayout(ir.text, firstLine, ir.style);

        case 'text': {
            let res = ctx.textLayout(ir.text, firstLine, ir.style);
            if (res.maxWidth + x <= ctx.maxWidth) {
                return res;
            }
            let maxWidth = 0;
            const newLines = ir.text.split('\n');
            let lines: string[] = [];
            const wraps: number[] = [];
            let index = 0;
            let height = 0;
            newLines.forEach((newLine) => {
                lines.push('');
                // dumbest way possible
                const words = [
                    ...new Intl.Segmenter('en', {
                        granularity: 'word',
                    }).segment(newLine),
                ];
                let lineHeight = 0;
                words.forEach((seg) => {
                    let text = lines[lines.length - 1] + seg.segment;
                    res = ctx.textLayout(text, firstLine, ir.style);
                    if (res.maxWidth + x > ctx.maxWidth && seg.isWordLike) {
                        wraps.push(index);
                        lines.push(seg.segment);
                        height += lineHeight;
                        lineHeight = res.inlineHeight;
                        firstLine = 0;
                    } else {
                        lines[lines.length - 1] = text;
                        maxWidth = Math.max(maxWidth, res.maxWidth);
                        lineHeight = Math.max(lineHeight, res.inlineHeight);
                    }

                    index += seg.segment.length;
                });
                index += 1; // for the newline
            });

            choices[ir.id] = { type: 'text-wrap', splits: wraps };

            return {
                maxWidth,
                height,
                inlineHeight: res.inlineHeight,
                inlineWidth: res.inlineWidth,
            };
        }

        case 'inline': {
            let maxWidth = 0;
            let inlineWidth = firstLine;
            let height = 0;
            let inlineHeight = 0;
            ir.items.forEach((item, i) => {
                let next = layoutIR(x, inlineWidth, item, choices, ctx);
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
            let lineWidth = firstLine;
            let lineHeight = 0;
            let maxWidth = 0;
            let height = 0;
            let inlineHeight = 0;
            const groups: number[] = [0];

            ir.items.forEach((item, i) => {
                const w = layoutIR(x + lineWidth, 0, item, choices, ctx);
                lineWidth += w.maxWidth;
                if (
                    (ir.spaced === 'all' && i < ir.items.length - 1) ||
                    (ir.spaced === 'braced' && i > 0 && i < ir.items.length - 2)
                ) {
                    lineWidth += 1;
                }
                inlineHeight = Math.max(inlineHeight, w.inlineHeight);

                if (
                    ir.wrap != null &&
                    lineWidth + x > ctx.maxWidth &&
                    i > 0 &&
                    (!ir.pullLast || i < ir.items.length - 1)
                ) {
                    maxWidth = Math.max(maxWidth, lineWidth - w.maxWidth);
                    height += lineHeight;

                    groups.push(i);
                    const w2 = layoutIR(
                        x + ir.wrap.indent,
                        0,
                        item,
                        choices,
                        ctx,
                    );
                    lineWidth = ir.wrap.indent + w2.maxWidth;
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
            const indent = ir.amount ?? 1;
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
