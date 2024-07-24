import equal from 'fast-deep-equal';
import { Style } from '../nodes';
import { applyFormats, blockFormat, justify } from './format';
import { Block, BlockSource, inlineSize } from './ir-to-blocks';
import { addSpaces, joinChunks, white } from './ir-to-text';

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

export const blockToText = (
    pos: { x: number; y: number; x0: number },
    block: Block,
    ctx: { color: boolean; highlight?: BlockSource; sourceMaps?: BlockEntry[] },
): string => {
    switch (block.type) {
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
                return blockFormat(
                    applyX0(joinChunks(chunks, block.pullLast), pos.x - pos.x0),
                    block.style,
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
                block.style,
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
            const style =
                ctx.highlight && ctx.highlight === block.source
                    ? highlightStyle(block.style)
                    : block.style;
            if (typeof block.contents === 'string') {
                return applyFormats(block.contents, style, ctx.color);
            }
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
                        if (row.type === 'other') {
                            const res = blockToText(
                                { ...pos, y, x0: pos.x },
                                row.item,
                                ctx,
                            );
                            y += row.item.height;
                            return res;
                        }
                        if (
                            row.left.width === block.leftWidth &&
                            !block.hspace
                        ) {
                            const res = joinChunks([
                                blockToText(
                                    { ...pos, y, x0: pos.x },
                                    row.left,
                                    ctx,
                                ),
                                blockToText(
                                    {
                                        ...pos,
                                        y,
                                        x: pos.x + row.left.width,
                                        x0: pos.x + row.left.width,
                                    },
                                    row.right,
                                    ctx,
                                ),
                            ]);
                            y += Math.max(row.left.height, row.right.height);
                            return res;
                        }
                        const x = pos.x + block.leftWidth + block.hspace;
                        const res = joinChunks([
                            blockToText(
                                { ...pos, y, x0: pos.x },
                                row.left,
                                ctx,
                            ),
                            white(
                                block.leftWidth - row.left.width + block.hspace,
                            ),
                            blockToText(
                                { ...pos, y, x, x0: x },
                                row.right,
                                ctx,
                            ),
                        ]);
                        y += Math.max(row.left.height, row.right.height);
                        return res;
                    })
                    .join('\n'),
                block.style,
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
