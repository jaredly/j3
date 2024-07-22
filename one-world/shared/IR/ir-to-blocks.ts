// yay

import { splitGraphemes } from '../../../src/parse/splitGraphemes';
import { Style } from '../nodes';
import { applyFormats, blockFormat } from './format';
import { Control, IR, IRSelection } from './intermediate';
import {
    addSpaces,
    joinChunks,
    maxLength,
    SourceMap,
    white,
} from './ir-to-text';
import { LayoutChoices, LayoutCtx } from './layout';

export type TextCtx = {
    space: string;
    layouts: LayoutCtx['layouts'];
    color?: boolean;
    annotateNewlines?: boolean;
    sourceMap: SourceMap;
};

export type BlockSource =
    | { type: 'text'; loc: number; index: number }
    | {
          type: 'control';
          loc: number;
          index: number;
          control: Control;
      }
    | { type: 'cursor'; loc: number; side: 'start' | 'inside' | 'end' };

export type Block =
    | {
          type: 'block';
          contents: Block[];
          horizontal: false | number; // number = space
          width: number;
          height: number;
          style?: Style;
      }
    | {
          type: 'table';
          rows: (
              | { type: 'other'; item: Block }
              | { type: 'pair'; left: Block; right: Block }
          )[];
          width: number;
          leftWidth: number;
          height: number;
          style?: Style;
      }
    // | { type: 'line'; contents: string; width: number }
    | {
          type: 'inline';
          contents: string | Block[][];
          first: number; // length of the first line
          width: number; // max length of intermediate length
          last: number; // length of the last line
          height: number; // number of lines
          source?: BlockSource;
          style?: Style;
      };

// const blockWidth = (block: Block) => block.type === 'inline' ? block.maxWidth
// : block.width
// const blockheight = (block: Block) => block.type === 'inline' ? block.height : block.height

const inlineSize = (
    items: Block[],
): { width: number; height: number; last: number } => {
    let x = 0;
    let width = 0;
    let height = 0;
    let last = 0;
    const w = (w: number) => (width = Math.max(width, w));
    items.forEach((item) => {
        if (item.type === 'inline') {
            if (item.height === 1 && x !== 0) {
                x += item.width;
                w(x);
                last = x;
            } else {
                height += item.height;
                if (x !== 0) {
                    height -= 1;
                    w(x + item.first);
                }
                w(item.width);
                x = item.last;
                last = item.last;
            }
        } else {
            height += item.height;
            if (x !== 0) {
                height -= 1;
            }
            x += item.width;
            w(x);
            // height += item.height;
            // w(item.width);
            // x = 0;
        }
    });
    return { width, height, last };
};

const vblock = (contents: Block[], style?: Style): Block => {
    return {
        type: 'block',
        horizontal: false,
        contents,
        height: contents.map((c) => c.height).reduce((a, b) => a + b),
        width: contents.map((c) => c.width).reduce((a, b) => Math.max(a, b)),
        style,
    };
};

const hblock = (items: Block[], style?: Style, spaced?: boolean): Block => {
    const height = items.map((l) => l.height).reduce((a, b) => Math.max(a, b));
    let width = items.map((l) => l.width).reduce((a, b) => a + b);
    if (spaced) {
        width += line.length - 1;
    }

    return {
        type: 'block',
        contents: items,
        height,
        width,
        horizontal: spaced ? 1 : 0,
        style,
    };
};

const line = (text: string, source?: BlockSource, style?: Style): Block => {
    const w = splitGraphemes(text).length;
    return {
        type: 'inline',
        contents: text,
        width: w,
        first: w,
        last: w,
        height: 1,
        source,
        style,
    };
};

export const irToBlock = (
    ir: IR,
    irs: Record<number, IR>,
    choices: LayoutChoices,
    selection: null | {
        path: number[];
        sel: IRSelection;
        start?: IRSelection;
        cursorChar: string;
    },
    ctx: TextCtx,
): Block => {
    switch (ir.type) {
        case 'loc': {
            const { choices } = ctx.layouts[ir.loc];
            const sub =
                selection?.path[0] === ir.loc
                    ? { ...selection, path: selection.path.slice(1) }
                    : null;
            return irToBlock(irs[ir.loc], irs, choices, sub, ctx);
        }
        case 'cursor':
            return line('', { type: 'cursor', loc: ir.loc, side: ir.side });

        case 'control':
            const source: BlockSource = {
                type: 'control',
                control: ir.control,
                index: ir.index,
                loc: ir.loc,
            };
            switch (ir.control.type) {
                case 'check':
                    return line(ir.control.checked ? '[x] ' : '[ ] ', source);
                case 'radio':
                    return line(ir.control.checked ? '(x) ' : '( ) ', source);
                case 'bullet':
                    return line(' - ', source);
                case 'number':
                    return line(
                        `${ir.control.num
                            .toString()
                            .padStart(ir.control.width, ' ')}) `,
                        source,
                    );
                default:
                    throw new Error('no');
            }

        case 'punct':
            return line(applyFormats(ir.text, ir.style, ctx.color));

        case 'inline': {
            const wrap = choices[ir.wrap];
            if (!wrap || wrap.type !== 'hwrap')
                throw new Error('no wrap for inline ' + ir.wrap);

            const chunks: Block[][] = [];
            ir.items.forEach((item, i) => {
                if (wrap.groups.includes(i)) {
                    chunks.push([]);
                }
                const last = chunks[chunks.length - 1];
                last.push(irToBlock(item, irs, choices, selection, ctx));
            });

            const first = chunks[0][0];
            // const last =
            //     chunks[chunks.length - 1][chunks[chunks.length - 1].length - 1];

            let width = 0;
            let height = 0;
            let last = 0;
            chunks.forEach((items) => {
                const res = inlineSize(items);
                width = Math.max(width, res.width);
                height += res.height;
                last = res.last;
            });

            return {
                type: 'inline',
                contents: chunks,
                first: first.type === 'inline' ? first.first : 0,
                last,
                width,
                height,
                style: ir.style,
            };
        }
        case 'horiz':
            const wrap = ir.wrap != null ? choices[ir.wrap.id] : null;
            if (ir.wrap && wrap?.type === 'hwrap') {
                const lines: Block[][] = [];
                ir.items.forEach((item, i) => {
                    if (wrap.groups.includes(i)) {
                        if (indent) {
                            lines.push([line(white(indent))]);
                        } else {
                            lines.push([]);
                        }
                    }
                    const last = lines[lines.length - 1];
                    last.push(irToBlock(item, irs, choices, selection, ctx));
                });
                const indent = ir.wrap.indent;
                const blocks: Block[] = [];
                lines.forEach((line, i) => {
                    blocks.push(hblock(line, undefined, ir.spaced));
                });
                if (blocks.length === 1) return blocks[0];
                return vblock(blocks, ir.style);
            }
            const chunks = ir.items.map((item) =>
                irToBlock(item, irs, choices, selection, ctx),
            );
            return hblock(chunks, ir.style);
        case 'indent':
            const block = irToBlock(ir.item, irs, choices, selection, ctx);
            return hblock([line(white(ir.amount ?? 2)), block]);
        case 'squish':
            return irToBlock(ir.item, irs, choices, selection, ctx);
        case 'text': {
            if (ir.wrap == null) {
                return line(ir.text, undefined, ir.style);
            }
            const splits = choices[ir.wrap];
            if (splits?.type === 'text-wrap' && splits.splits.length) {
                let pieces: string[] = [];
                for (let i = splits.splits.length - 1; i >= 0; i--) {
                    if (i === splits.splits.length - 1) {
                        pieces.unshift(ir.text.slice(splits.splits[i]));
                    } else {
                        pieces.unshift(
                            ir.text.slice(
                                splits.splits[i],
                                splits.splits[i + 1],
                            ),
                        );
                    }
                    if (i === 0) {
                        pieces.unshift(ir.text.slice(0, splits.splits[0]));
                    }
                }

                let maxWidth = 0;
                pieces.forEach((line) => {
                    maxWidth = splitGraphemes(line).length;
                });

                return {
                    type: 'inline',
                    contents: pieces.join('\n'),
                    first: splitGraphemes(pieces[0]).length,
                    last: splitGraphemes(pieces[pieces.length - 1]).length,
                    source: { type: 'text', index: ir.index, loc: ir.loc },
                    height: pieces.length,
                    style: ir.style,
                    width: maxWidth,
                };
            }
            return line(ir.text, undefined, ir.style);
        }
        case 'switch':
            const choice = choices[ir.id];
            if (choice?.type !== 'switch') {
                throw new Error(`switch not resolved ${ir.id}`);
            }
            return irToBlock(
                ir.options[choice.which],
                irs,
                choices,
                selection,
                ctx,
            );
        case 'vert':
            if (ir.pairs) {
                // ok I'm gonna say, if it's pairs, it's all pairs.
                const pairs: (
                    | { type: 'other'; item: Block }
                    | { type: 'pair'; left: Block; right: Block }
                )[] = [];
                let leftWidth = 0;
                let height = 0;
                let width = 0;
                ir.items.forEach((item) => {
                    if (item.type === 'horiz' && item.items.length === 2) {
                        const left = irToBlock(
                            item.items[0],
                            irs,
                            choices,
                            selection,
                            ctx,
                        );
                        leftWidth = Math.max(leftWidth, left.width);
                        const right = irToBlock(
                            item.items[1],
                            irs,
                            choices,
                            selection,
                            ctx,
                        );
                        pairs.push({ type: 'pair', left, right });
                        height += Math.max(left.height, right.height);
                    } else {
                        const block = irToBlock(
                            item,
                            irs,
                            choices,
                            selection,
                            ctx,
                        );
                        pairs.push({ type: 'other', item: block });
                        height += block.height;
                        width = Math.max(width, block.width);
                    }
                });

                pairs.forEach((item) => {
                    if (item.type === 'pair') {
                        width = Math.max(width, leftWidth + item.right.width);
                    }
                });

                return {
                    type: 'table',
                    rows: pairs,
                    style: ir.style,
                    leftWidth,
                    width,
                    height,
                };
            }

            const contents = ir.items.map((item) =>
                irToBlock(item, irs, choices, selection, ctx),
            );
            return {
                type: 'block',
                horizontal: false,
                contents,
                height: contents.map((c) => c.height).reduce((a, b) => a + b),
                width: contents
                    .map((c) => c.width)
                    .reduce((a, b) => Math.max(a, b)),
                style: ir.style,
            };
    }
};
