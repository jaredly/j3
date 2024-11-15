import { serializePath, Style } from '../nodes';
import { Control, IR } from './intermediate';
import { lastChild } from './nav';

// type LayoutCache = Record<number, any>
export type IRForLoc = Record<number, IR>;

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
    firstLineWidth: number;
    inlineWidth: number;
    inlineHeight: number;
    height: number;
    multiLine?: boolean;
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
            return {
                maxWidth: 0,
                height: 0,
                firstLineWidth: firstLine,
                inlineHeight: 0,
                inlineWidth: 0,
            };

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
            const nir = ctx.irs[lastChild(ir.path)];
            if (!nir) {
                console.warn(`no ir for ${serializePath(ir.path)}`);
                const result = {
                    maxWidth: 0,
                    height: 0,
                    firstLineWidth: firstLine,
                    inlineHeight: 0,
                    inlineWidth: 0,
                };
                ctx.layouts[lastChild(ir.path)] = { result, choices };
                return result;
            }
            const result = layoutIR(x, firstLine, nir, choices, ctx);
            ctx.layouts[lastChild(ir.path)] = { result, choices };
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
            let lines: { text: string; width: number }[] = [];
            const wraps: number[] = [];
            let index = 0;
            let height = 0;
            newLines.forEach((newLine, i) => {
                lines.push({ text: '', width: 0 });
                // dumbest way possible
                const words = [
                    ...new Intl.Segmenter('en', {
                        granularity: 'word',
                    }).segment(newLine),
                ];
                let lineHeight = 0;
                let lineWidth = i === 0 ? firstLine : 0;
                words.forEach((seg) => {
                    res = ctx.textLayout(seg.segment, lineWidth, ir.style);
                    // TODO: support "eliding" trailing whitespace
                    if (
                        res.inlineWidth + x > ctx.maxWidth &&
                        lines[lines.length - 1].text != ''
                    ) {
                        wraps.push(index);
                        res = ctx.textLayout(seg.segment, 0, ir.style);
                        lines.push({ text: seg.segment, width: res.maxWidth });
                        height += lineHeight;
                        lineHeight = res.inlineHeight;
                        lineWidth = res.inlineWidth;
                    } else {
                        lines[lines.length - 1].text += seg.segment;
                        lines[lines.length - 1].width +=
                            res.maxWidth - lineWidth;
                        maxWidth = Math.max(
                            maxWidth,
                            lines[lines.length - 1].width,
                        );
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
                firstLineWidth: lines[0].width + firstLine,
                inlineHeight: res.inlineHeight,
                inlineWidth: res.inlineWidth,
                multiLine: lines.length > 1,
            };
        }

        case 'inline': {
            let maxWidth = 0;
            let inlineWidth = firstLine;
            let height = 0;
            let inlineHeight = 0;
            const groups: number[] = [0];
            let firstLineWidth = 0;
            let multiLine = false;
            // iffff prev group only has one thing
            // and it's an empty text, let'sss not break after it?
            // hrm it's a little weird.
            ir.items.forEach((item, i) => {
                let next = layoutIR(x, inlineWidth, item, choices, ctx);
                multiLine = multiLine || !!next.multiLine;
                if (
                    i > 0 &&
                    maxWidth > 0 &&
                    next.maxWidth > 0 &&
                    x + next.firstLineWidth > ctx.maxWidth
                ) {
                    if (groups.length === 1) {
                        firstLineWidth = inlineWidth;
                    }
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
            if (groups.length === 1) {
                firstLineWidth = inlineWidth;
            }
            choices[ir.wrap] = { type: 'hwrap', groups };
            return {
                maxWidth,
                inlineWidth,
                inlineHeight,
                height,
                firstLineWidth,
                multiLine: multiLine || groups.length > 1,
            };
        }

        case 'squish':
            return layoutIR(x, 0, ir.item, choices, {
                ...ctx,
                maxWidth: ctx.leftWidth,
            });
        case 'table': {
            const cols = ir.rows.reduce((w, row) => Math.max(w, row.length), 0);
            const colWidths: number[] = Array(cols).fill(0);
            const rowHeights: number[] = Array(ir.rows.length).fill(0);
            for (let c = 0; c < cols; c++) {
                colWidths.push(0);
                const left = x + (c === 0 ? 0 : colWidths[c - 1]);
                ir.rows.forEach((row, r) => {
                    if (c >= row.length) return;
                    const next = layoutIR(left, 0, row[c], choices, ctx);
                    rowHeights[r] = Math.max(rowHeights[r], next.height);
                    colWidths[c] = Math.max(colWidths[c], next.maxWidth);
                });
            }

            const width = colWidths.reduce((a, b) => a + b, 0);
            const height = rowHeights.reduce((a, b) => a + b, 0);

            return {
                inlineWidth: firstLine + width,
                firstLineWidth: firstLine + width,
                inlineHeight: height,
                maxWidth: width,
                height,
                multiLine: ir.rows.length > 1,
            };
        }

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
                firstLineWidth: maxWidth,
                inlineHeight,
                maxWidth,
                height,
                multiLine: ir.items.length > 1,
            };
        }
        case 'horiz': {
            let lineWidth = 0;
            let lineHeight = 0;
            let maxWidth = 0;
            let height = 0;
            let inlineHeight = 0;
            const groups: number[] = [0];
            let multiLine = false;
            let lastMultiLine = false;

            ir.items.forEach((item, i) => {
                const space = i > 0 && ir.spaced ? 1 : 0;
                const w = layoutIR(
                    x + lineWidth + space,
                    0,
                    item,
                    choices,
                    ctx,
                );
                lineWidth += w.maxWidth + space;
                inlineHeight = Math.max(inlineHeight, w.inlineHeight);
                multiLine = multiLine || !!w.multiLine;

                if (
                    ir.wrap != null &&
                    (lineWidth + x > ctx.maxWidth || lastMultiLine) &&
                    i > 0
                ) {
                    maxWidth = Math.max(
                        maxWidth,
                        lineWidth - w.maxWidth - space,
                    );
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
                // if (ir.spaced && i < ir.items.length - 1) {
                //     lineWidth += 1;
                // }

                lastMultiLine = !!w.multiLine;
            });

            if (ir.wrap != null) {
                choices[ir.wrap.id] = { type: 'hwrap', groups };
            }

            maxWidth = Math.max(maxWidth, lineWidth);
            height += lineHeight;

            return {
                maxWidth,
                inlineWidth: lineWidth + firstLine,
                firstLineWidth: lineWidth + firstLine,
                height,
                inlineHeight,
                multiLine: multiLine || groups.length > 1,
            };
        }
        case 'indent': {
            const indent = ir.amount ?? 1;
            const res = layoutIR(x + indent, 0, ir.item, choices, ctx);
            return {
                maxWidth: res.maxWidth + indent,
                inlineWidth: res.inlineWidth + indent + firstLine,
                height: res.height,
                inlineHeight: res.inlineHeight,
                firstLineWidth: res.inlineWidth + indent + firstLine,
                multiLine: res.multiLine,
            };
        }
    }
    // throw new Error('no');
};
