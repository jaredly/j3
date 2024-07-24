import { Style } from '../nodes';
import { Control, IR } from './intermediate';

// type LayoutCache = Record<number, any>
type IRForLoc = Record<number, IR>;

/*

Ok, so I ... need to better understand what I mean by these things.

I generally think "inlineWidth" means "the last line"

abcdef
ghi

would have maxwidth = 6 and inlineWidth = 3
because it's "how offset do I start this next thing, if we're inline"
It's based on the passed-in X

so if we start offset

   abc

the inlinewidth should be 6


*/
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
    controlLayout: (control: Control) => LayoutResult;
};

export const layoutIR = (
    x: number,
    firstLine: number,
    ir: IR,
    choices: LayoutChoices,
    ctx: LayoutCtx,
): LayoutResult => {
    switch (ir.type) {
        case 'cursor':
            return { maxWidth: 0, height: 0, inlineHeight: 0, inlineWidth: 0 };
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

        case 'control':
            return ctx.controlLayout(ir.control);

        case 'text': {
            let res = ctx.textLayout(ir.text, firstLine, ir.style);
            if (res.maxWidth + x <= ctx.maxWidth || ir.wrap == null) {
                if (ir.wrap != null) {
                    delete choices[ir.wrap];
                }
                return res;
            }
            let maxWidth = 0;
            const newLines = ir.text.split('\n');
            let lines: string[] = [];
            const wraps: number[] = [];
            let index = 0;
            let height = 0;
            newLines.forEach((newLine, i) => {
                lines.push('');
                // dumbest way possible
                const words = [
                    ...new Intl.Segmenter('en', {
                        granularity: 'word',
                    }).segment(newLine),
                ];
                let lineHeight = 0;
                let lineWidth = i === 0 ? firstLine : 0;
                words.forEach((seg) => {
                    // let text = lines[lines.length - 1] + seg.segment;
                    res = ctx.textLayout(seg.segment, lineWidth, ir.style);
                    if (
                        res.inlineWidth + x > ctx.maxWidth &&
                        seg.isWordLike &&
                        lines[lines.length - 1] != ''
                    ) {
                        wraps.push(index);
                        lines.push(seg.segment);
                        res = ctx.textLayout(seg.segment, 0, ir.style);
                        height += lineHeight;
                        lineHeight = res.inlineHeight;
                        lineWidth = res.inlineWidth;
                    } else {
                        lines[lines.length - 1] += seg.segment;
                        maxWidth = Math.max(maxWidth, res.maxWidth);
                        lineHeight = Math.max(lineHeight, res.inlineHeight);
                        lineWidth = res.inlineWidth;
                    }

                    index += seg.segment.length;
                });
                index += 1; // for the newline
            });

            choices[ir.wrap] = { type: 'text-wrap', splits: wraps };

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
            const groups: number[] = [0];
            // iffff prev group only has one thing
            // and it's an empty text, let'sss not break after it?
            // hrm it's a little weird.
            ir.items.forEach((item, i) => {
                let next = layoutIR(x, inlineWidth, item, choices, ctx);
                if (
                    i > 0 &&
                    maxWidth > 0 &&
                    next.maxWidth > 0 &&
                    x + next.inlineWidth > ctx.maxWidth
                ) {
                    groups.push(i);
                    next = layoutIR(x, 0, item, choices, ctx);
                    inlineHeight = next.inlineHeight;
                    height += next.height;
                } else {
                    height += next.height - inlineHeight;
                }
                maxWidth = Math.max(maxWidth, next.maxWidth);
                inlineWidth = next.inlineWidth;
                inlineHeight = Math.max(next.inlineHeight, inlineHeight);
            });
            choices[ir.wrap] = { type: 'hwrap', groups };
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

            return {
                inlineWidth: inlineWidth + firstLine,
                inlineHeight,
                maxWidth,
                height,
            };
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
                if (ir.spaced && i < ir.items.length - 1) {
                    lineWidth += 1;
                }
            });

            if (ir.wrap != null) {
                choices[ir.wrap.id] = { type: 'hwrap', groups };
            }

            maxWidth = Math.max(maxWidth, lineWidth);
            height += lineHeight;

            return {
                maxWidth,
                inlineWidth: lineWidth + firstLine,
                height,
                inlineHeight,
            };
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
