// yay

import { splitGraphemes } from '../../../src/parse/splitGraphemes';
import { Path, serializePath, Style } from '../nodes';
// import { applyFormats, blockFormat } from './format';
import { Control, IR, IRCursor } from './intermediate';
import {
    addSpaces,
    joinChunks,
    maxLength,
    SourceMap,
    white,
} from './ir-to-text';
import { LayoutChoices, LayoutCtx } from './layout';
import { lastChild } from './nav';

export type TextCtx = {
    space: string;
    layouts: LayoutCtx['layouts'];
    // color?: boolean;
    annotateNewlines?: boolean;
    top: string;
    // sourceMap: SourceMap;
};

export const blockSourceKey = (source: BlockSource): string => {
    const pathKey = serializePath(source.path);
    switch (source.type) {
        case 'text':
            return `${pathKey}:T:${source.index}`;
        case 'control':
            return `${pathKey}:C:${source.index}`;
        case 'cursor':
            return `${pathKey}:${source.side}`;
        // case 'loc':
        //     return `${pathKey}`;
    }
};

export type BlockSource =
    // | { type: 'loc'; loc: number; top: string }
    | {
          type: 'text';
          path: Path;
          index: number;
          //   top: string;
          wraps: number[];
          newLines: number[];
      }
    | {
          type: 'control';
          path: Path;
          index: number;
          control: Control;
          //   top: string;
      }
    | {
          type: 'cursor';
          path: Path;
          side: 'start' | 'inside' | 'end';
          //   top: string;
      };

export type Block =
    | {
          type: 'block';
          contents: Block[];
          horizontal: false | number; // number = space
          node?: Path;
          pullLast?: boolean; // NOTE only when horizontal
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
          hspace: number;
          height: number;
          style?: Style;
          node?: Path;
      }
    // | { type: 'line'; contents: string; width: number }
    | {
          type: 'inline';
          contents: string | Block[][];
          splits?: number[];
          first: number; // length of the first line
          width: number; // max length of intermediate length
          last: number; // length of the last line
          height: number; // number of lines
          node?: Path;
          brace?: boolean;
          source?: BlockSource;
          // NOTE That this won't work with syntax highlighting,
          // because we need to be able to colorize sub-spans.
          // but I'll deal w/ that later.
          style?: Style;
      };

export const inlineSize = (
    items: Block[],
    x0 = 0,
): {
    width: number;
    height: number;
    last: number;
    positions: { x: number; y: number }[];
} => {
    let x = x0;
    let width = 0;
    let height = 1;
    let last = 0;
    let partial = true;
    const positions: { x: number; y: number }[] = [];
    const w = (w: number) => (width = Math.max(width, w));
    items.forEach((item, i) => {
        if (item.type === 'inline') {
            positions.push({ x, y: height - 1 });
            if (item.height === 1) {
                x += item.width;
                w(x);
                last = x;
            } else {
                height += item.height;
                height -= 1;
                w(x + item.first);
                w(item.width);
                x = item.last;
                last = item.last;
            }
        } else {
            positions.push({ x, y: height - 1 });
            height += item.height - 1;
            x += item.width;
            w(x);
            partial = true;
        }
    });
    return { width, height, last, positions };
};

export const vblock = (
    contents: Block[],
    style?: Style,
    node?: Block['node'],
): Block => {
    return {
        type: 'block',
        horizontal: false,
        contents,
        height: contents.map((c) => c.height).reduce((a, b) => a + b),
        width: contents.map((c) => c.width).reduce((a, b) => Math.max(a, b)),
        style,
        node,
    };
};

export const hblock = (
    items: Block[],
    style?: Style,
    spaced?: boolean,
    pullLast?: boolean,
    node?: Block['node'],
): Block => {
    const height = items.map((l) => l.height).reduce((a, b) => Math.max(a, b));
    let width = items.map((l) => l.width).reduce((a, b) => a + b);
    if (spaced) {
        width += items.length - 1;
    }

    return {
        type: 'block',
        contents: items,
        height,
        width,
        horizontal: spaced ? 1 : 0,
        pullLast,
        style,
        node,
    };
};

const splitChars = (chars: string[], which = '\n'): string[][] => {
    let idx = chars.indexOf(which);
    if (idx === -1) return [chars];
    const lines = [];
    let prev = 0;
    while (idx !== -1) {
        lines.push(chars.slice(prev, idx));
        prev = idx + 1;
        idx = chars.indexOf(which, prev);
    }
    lines.push(chars.slice(prev));
    return lines;
};

export const line = (
    text: string,
    source?: BlockSource,
    style?: Style,
    node?: Block['node'],
    brace?: boolean,
): Block => {
    const lines = text.split('\n');
    const lens = lines.map((l) => splitGraphemes(l).length);
    const maxW = lens.reduce((a, b) => Math.max(a, b), 0);
    return {
        type: 'inline',
        brace,
        contents: text,
        width: maxW,
        first: lens[0],
        last: lens[lens.length - 1],
        height: lines.length,
        source,
        style,
        node,
    };
};

const textNewLines = (text: string): number[] => {
    const nls: number[] = [];
    text.replace(/\n/g, (_, idx) => (nls.push(idx), ''));
    return nls;
};

// const textWraps = (text: string, splits: number[]): number[] => {
//     const wraps: number[] = [];
//     let x = 0;
//     let j = 0;
//     const lines = text.split('\n');
//     lines.forEach((line, i) => {
//         let nx = x + splitGraphemes(line).length + 1;
//         for (; splits[j] < nx && j < splits.length; j++) {
//             wraps.push(splits[j]);
//         }
//         if (i < lines.length - 1) {
//             // wraps.push(nx);
//         }
//         x = nx;
//     });
//     return wraps;
// };

export const irToBlock = (
    ir: IR,
    irs: Record<number, IR>,
    choices: LayoutChoices,
    ctx: TextCtx,
): Block => {
    switch (ir.type) {
        case 'loc': {
            const { choices } = ctx.layouts[lastChild(ir.path)];
            return {
                ...irToBlock(irs[lastChild(ir.path)], irs, choices, ctx),
                node: ir.path,
            };
        }
        case 'cursor':
            return line('', {
                type: 'cursor',
                path: ir.path,
                side: ir.side,
                // top: ctx.top,
            });

        case 'control':
            const source: BlockSource = {
                type: 'control',
                control: ir.control,
                index: ir.index,
                path: ir.path,
                // top: ctx.top,
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
            return line(
                ir.text,
                undefined,
                ir.style,
                ir.brace,
                ir.brace != null ? true : false,
            );

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
                last.push(irToBlock(item, irs, choices, ctx));
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
                // STOPSHIP this first calculation is wrong!!!
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
                const indent = ir.wrap.indent;
                ir.items.forEach((item, i) => {
                    if (wrap.groups.includes(i)) {
                        if (i > 0) {
                            lines.push([line(white(indent))]);
                        } else {
                            lines.push([]);
                        }
                    }
                    const last = lines[lines.length - 1];
                    last.push(irToBlock(item, irs, choices, ctx));
                });
                const blocks: Block[] = [];
                lines.forEach((line, i) => {
                    blocks.push(hblock(line, undefined, ir.spaced));
                });
                if (blocks.length === 1) return blocks[0];
                return vblock(blocks, ir.style);
            }
            const chunks = ir.items.map((item) =>
                irToBlock(item, irs, choices, ctx),
            );
            return hblock(chunks, ir.style, ir.spaced, ir.pullLast);
        case 'indent':
            const block = irToBlock(ir.item, irs, choices, ctx);
            return hblock([line(white(ir.amount ?? 2)), block]);
        case 'squish':
            return irToBlock(ir.item, irs, choices, ctx);
        case 'text': {
            if (ir.wrap == null) {
                return line(
                    ir.text,
                    {
                        type: 'text',
                        index: ir.index,
                        path: ir.path,
                        wraps: [],
                        newLines: textNewLines(ir.text),
                    },
                    ir.style,
                );
            }
            const splits = choices[ir.wrap];
            if (splits?.type === 'text-wrap' && splits.splits.length) {
                let pieces: string[][] = [];
                const chars = splitGraphemes(ir.text);
                for (let i = splits.splits.length - 1; i >= 0; i--) {
                    if (i === splits.splits.length - 1) {
                        // NOTE: Is this working with utf8? I think we
                        // need to splitGraphemes...
                        pieces.unshift(
                            ...splitChars(chars.slice(splits.splits[i])),
                        );
                    } else {
                        pieces.unshift(
                            ...splitChars(
                                chars.slice(
                                    splits.splits[i],
                                    splits.splits[i + 1],
                                ),
                            ),
                        );
                    }
                    if (i === 0) {
                        pieces.unshift(
                            ...splitChars(chars.slice(0, splits.splits[0])),
                        );
                    }
                }

                let maxWidth = 0;
                pieces.forEach((line) => {
                    maxWidth = Math.max(maxWidth, line.length);
                });

                return {
                    type: 'inline',
                    contents: ir.text, // pieces.join('\n'),
                    // STOPSHIP: This (first) calculation is off I'm pretty sure.
                    first: pieces[0].length,
                    last: pieces[pieces.length - 1].length,
                    splits: splits.splits,
                    source: {
                        type: 'text',
                        index: ir.index,
                        path: ir.path,
                        wraps: splits.splits,
                        newLines: textNewLines(ir.text),
                    },
                    height: ir.text.split('\n').length + splits.splits.length,
                    style: ir.style,
                    width: maxWidth,
                };
            }
            return line(
                ir.text,
                {
                    type: 'text',
                    index: ir.index,
                    path: ir.path,
                    wraps: [],
                    newLines: textNewLines(ir.text),
                },
                ir.style,
            );
        }
        case 'switch':
            const choice = choices[ir.id];
            if (choice?.type !== 'switch') {
                throw new Error(`switch not resolved ${ir.id}`);
            }
            return irToBlock(ir.options[choice.which], irs, choices, ctx);
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
                            ctx,
                        );
                        leftWidth = Math.max(leftWidth, left.width);
                        const right = irToBlock(
                            item.items[1],
                            irs,
                            choices,
                            ctx,
                        );
                        pairs.push({ type: 'pair', left, right });
                        height += Math.max(left.height, right.height);
                    } else {
                        const block = irToBlock(item, irs, choices, ctx);
                        pairs.push({ type: 'other', item: block });
                        height += block.height;
                        width = Math.max(width, block.width);
                    }
                });

                pairs.forEach((item) => {
                    if (item.type === 'pair') {
                        width = Math.max(
                            width,
                            leftWidth + item.right.width + 1,
                        );
                    }
                });

                return {
                    type: 'table',
                    rows: pairs,
                    style: ir.style,
                    leftWidth,
                    hspace: 1,
                    width,
                    height,
                };
            }

            const contents = ir.items.map((item) =>
                irToBlock(item, irs, choices, ctx),
            );
            return {
                type: 'block',
                horizontal: false,
                contents,
                height: contents.length
                    ? contents.map((c) => c.height).reduce((a, b) => a + b)
                    : 1,
                width: contents.length
                    ? contents
                          .map((c) => c.width)
                          .reduce((a, b) => Math.max(a, b))
                    : 0,
                style: ir.style,
            };
    }
};
