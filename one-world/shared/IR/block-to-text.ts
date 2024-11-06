import equal from 'fast-deep-equal';
import { Path, serializePath, Style } from '../nodes';
import { applyFormats, blockFormat, justify } from './format';
import { Block, BlockSource, blockSourceKey, inlineSize } from './ir-to-blocks';
import { addSpaces, joinChunks, white } from './ir-to-text';
import { splitGraphemes } from '../../../src/parse/splitGraphemes';
import ansis from 'ansis';

export type BlockEntry = {
    source: BlockSource;
    shape:
        | {
              type: 'inline';
              start: [number, number];
              end: [number, number];
              hbounds: [number, number]; // min / max X
          }
        | {
              type: 'block';
              start: [number, number];
              width: number;
              height: number;
          };
};

const applyX0 = (text: string, x0: number) => {
    if (x0 === 0) return text;
    const lines = text.split('\n');
    if (lines.length === 1) return text;
    const indent = white(x0);
    return [lines[0], ...lines.slice(1).map((l) => indent + l)].join('\n');
};

export type RGB = { r: number; g: number; b: number };

export type StyleOverrides = Record<
    string,
    | {
          type: 'full';
          color: RGB;
      }
    | {
          type: 'sub';
          color: RGB;
          start: number;
          end: number;
      }
>;

export type DropTarget = {
    path: Path;
    pos: { x: number; y: number };
    side: 'before' | 'after';
    // after: { x: number; y: number };
};

export const blockToText = (
    pos: { x: number; y: number; x0: number },
    block: Block,
    ctx: {
        color: boolean;
        styles: StyleOverrides;
        sourceMaps?: BlockEntry[];
        dropTargets?: DropTarget[];
    },
): string => {
    let nodeStyle = block.style;
    let override = false;
    if (block.node) {
        let key = serializePath(block.node);
        const brace = block.type === 'inline' && block.brace;
        if (brace) key += ':brace';
        const bstyle = ctx.styles[key];
        if (bstyle?.type === 'full') {
            override = true;
            nodeStyle = nodeStyle
                ? { ...nodeStyle, background: bstyle.color }
                : { background: bstyle.color };
        }
        if (ctx.dropTargets && !brace) {
            ctx.dropTargets.push({
                path: block.node,
                side: 'before',
                pos: { x: pos.x, y: pos.y },
            });
            if (block.width > 0) {
                ctx.dropTargets.push({
                    path: block.node,
                    side: 'after',
                    pos: {
                        x: pos.x + block.width,
                        y: pos.y + block.height - 1,
                    },
                });
            }
        }
    }

    switch (block.type) {
        case 'bullet':
            return '▶️ ';
        case 'block': {
            if (block.horizontal !== false) {
                let x = pos.x;
                let h = 0;
                const chunks = block.contents.map((m, i) => {
                    h = Math.max(h, m.height);
                    let y = pos.y;
                    if (block.pullLast && i === block.contents.length - 1) {
                        y = pos.y + h - m.height;
                    }
                    const res = blockToText({ y, x, x0: x }, m, ctx);
                    x +=
                        m.width +
                        (i < block.contents.length - 1
                            ? (block.horizontal as number)
                            : 0);
                    return res;
                });
                if (block.horizontal > 0) {
                    addSpaces(chunks, 'all', white(block.horizontal));
                }
                let text = joinChunks(chunks, block.pullLast);
                if (override) {
                    text = ansis.strip(text);
                }
                return blockFormat(
                    applyX0(text, pos.x - pos.x0),
                    nodeStyle,
                    ctx.color,
                );
            }
            let y = pos.y;
            return blockFormat(
                applyX0(
                    block.contents
                        .map((m) => {
                            const res = blockToText(
                                { ...pos, y, x0: pos.x },
                                m,
                                ctx,
                            );
                            y += m.height;
                            return res;
                        })
                        .join('\n'),
                    pos.x - pos.x0,
                ),
                nodeStyle,
                ctx.color,
            );
        }
        case 'inline': {
            if (block.source && ctx.sourceMaps) {
                ctx.sourceMaps.push({
                    source: block.source,
                    shape:
                        block.height === 1
                            ? {
                                  type: 'block',
                                  start: [pos.x, pos.y],
                                  width: block.width,
                                  height: block.height,
                              }
                            : {
                                  type: 'inline',
                                  start: [pos.x, pos.y],
                                  end: [
                                      pos.x0 + block.last,
                                      pos.y + block.height - 1,
                                  ],
                                  hbounds: [
                                      pos.x0,
                                      Math.max(
                                          pos.x0 + block.width,
                                          pos.x + block.first,
                                      ),
                                  ],
                              },
                });
            }
            const override = block.source
                ? ctx.styles[blockSourceKey(block.source)]
                : undefined;
            if (typeof block.contents === 'string') {
                const chars = splitGraphemes(block.contents);
                if (override?.type === 'sub') {
                    const pre = chars.slice(0, override.start);
                    const mid = chars.slice(override.start, override.end);
                    const post = chars.slice(override.end);
                    if (block.splits) {
                        for (let i = block.splits.length - 1; i >= 0; i--) {
                            const split = block.splits[i];
                            if (split > override.end) {
                                post.splice(split - override.end, 0, '\n');
                            } else if (split > override.start) {
                                mid.splice(split - override.start, 0, '\n');
                            } else {
                                pre.splice(split, 0, '\n');
                            }
                        }
                    }
                    // applySplits
                    return (
                        applyFormats(pre.join(''), nodeStyle, ctx.color) +
                        applyFormats(
                            mid.join(''),
                            { ...nodeStyle, background: override.color },
                            ctx.color,
                        ) +
                        applyFormats(post.join(''), nodeStyle, ctx.color)
                    );
                }

                if (block.splits) {
                    for (let i = block.splits.length - 1; i >= 0; i--) {
                        const split = block.splits[i];
                        chars.splice(split, 0, '\n');
                    }
                }

                if (override?.type === 'full') {
                    return applyFormats(
                        chars.join(''),
                        { ...nodeStyle, background: override.color },
                        ctx.color,
                    );
                }
                return applyFormats(chars.join(''), nodeStyle, ctx.color);
            }
            const style: Style | undefined =
                override?.type === 'full'
                    ? { ...nodeStyle, background: override.color }
                    : nodeStyle;
            let x = pos.x;
            let y = pos.y;
            let x0 = pos.x0;
            return applyFormats(
                block.contents
                    .map((line, i) => {
                        const { width, height, positions, last } = inlineSize(
                            line,
                            x - x0,
                        );
                        const res = line
                            .map((m, i) => {
                                const start = positions[i];
                                const res = blockToText(
                                    {
                                        x: x0 + start.x,
                                        y: y + start.y,
                                        x0: x0,
                                    },
                                    m,
                                    ctx,
                                );
                                if (m.type !== 'inline') {
                                    return justify(res);
                                }
                                return res;
                            })
                            .join('');

                        x = x0;
                        y += height;

                        return res;
                    })
                    .join('\n'),
                style,
                ctx.color,
            );
        }
        case 'table':
            let y = pos.y;
            return blockFormat(
                block.rows
                    .map((row) => {
                        const chunks: string[] = [];
                        let x = pos.x;
                        if (block.sides) {
                            chunks.push('⋮');
                            x++;
                        }
                        let height = 0;
                        for (let i = 0; i < row.length; i++) {
                            if (i > 0) {
                                chunks.push('⋮');
                                x++;
                            }
                            chunks.push(
                                blockToText(
                                    { ...pos, y, x0: x, x },
                                    row[i],
                                    ctx,
                                ),
                            );
                            if (row[i].width < block.colWidths[i]) {
                                chunks.push(
                                    white(block.colWidths[i] - row[i].width),
                                );
                            }
                            x += block.colWidths[i];
                            height = Math.max(height, row[i].height);
                        }
                        if (block.sides) {
                            chunks.push('⋮');
                            x++;
                        }
                        y += height;
                        return joinChunks(chunks);
                    })
                    .join('\n'),
                nodeStyle,
                ctx.color,
            );
    }
};

const highlightStyle = (style?: Style): Style => {
    // console.log('HLL');
    // throw new Error('hk');
    return {
        ...style,
        // color: { r: 255, g: 0, b: 0 },
        // textDecoration: 'underline',
        // fontStyle: 'italic',
        background: { r: 20, g: 50, b: 150 },
    };
};
