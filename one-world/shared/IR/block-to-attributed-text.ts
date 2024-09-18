import { splitGraphemes } from '../../../src/parse/splitGraphemes';
import { Path, serializePath, Style } from '../nodes';
import { applyFormats } from './format';
import { Block, BlockSource, blockSourceKey, inlineSize } from './ir-to-blocks';

const charLen = (text: string) => splitGraphemes(text).length;
const toChunk = (text: string, style?: Style): ABlock[0][0] => ({
    text,
    len: charLen(text),
    style,
});

const breakByLines = (line: ABlock[0]) => {
    const res: ABlock = [[]];
    line.forEach((item) => {
        if (item.text.includes('\n')) {
            const parts = item.text.split('\n');
            res[res.length - 1].push(toChunk(parts[0], item.style));
            for (let i = 1; i < parts.length; i++) {
                res.push([toChunk(parts[i], item.style)]);
            }
        } else {
            res[res.length - 1].push(item);
        }
    });
    return res;
};

const joinInline = (blocks: ABlock[]) => {
    const res: ABlock = [];
    blocks.forEach((block) => {
        if (res.length) {
            res[res.length - 1] = res[res.length - 1].slice();
            res[res.length - 1].push(...block[0]);
            res.push(...block.slice(1));
        } else {
            res.push(...block);
        }
    });
    return res;
};

export const justify = (text: ABlock) => {
    const lls = text.map((line) => line.reduce((t, c) => t + c.len, 0));
    const max = Math.max(...lls);
    text.forEach((line, i) => {
        if (lls[i] < max) {
            const wh = white(max - lls[i]);
            line.push({ text: wh, len: wh.length });
        }
    });
    return text;
};

const mergeStyle = (one?: Style, two?: Style) => {
    if (!one) return two;
    if (!two) return one;
    return { ...one, ...two };
};

export const blockFormat = (text: ABlock, style?: Style) => {
    if (!style) return text;
    return text.map((line) =>
        line.map((chunk) => ({
            ...chunk,
            style: mergeStyle(style, chunk.style),
        })),
    );
};

export const maxLength = <T extends { length: number }>(l: T[]) =>
    l.map((l) => l.length).reduce((a, b) => Math.max(a, b));

export const white = (num: number) => Array(num + 1).join(' ');

export const joinChunks = (chunks: ABlock[], pullLast = false): ABlock => {
    const maxLines = maxLength(chunks);
    if (maxLines === 1) return [chunks.flat(2)]; // all on one line
    chunks.forEach((group, i) => {
        for (let k = group.length; k < maxLines; k++) {
            if (pullLast && i === chunks.length - 1) {
                group.unshift([{ text: '', len: 0 }]);
            } else {
                group.push([{ text: '', len: 0 }]);
            }
        }
        if (i < chunks.length - 1) {
            const lls = group.map((line) =>
                line.reduce((l, i) => l + i.len, 0),
            );
            const maxLen = Math.max(...lls);
            group.forEach((len, i) => {
                if (lls[i] < maxLen) {
                    const nl = maxLen - lls[i];
                    group[i].push({
                        text: white(nl),
                        len: nl,
                    });
                }
            });
        }
    });
    const result: ABlock = [];
    for (let i = 0; i < maxLines; i++) {
        result.push(chunks.flatMap((l) => l[i]));
    }
    return result;
};

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

const applyX0 = (text: ABlock, x0: number) => {
    if (x0 === 0) return text;
    if (text.length === 1) return text;
    const indent = white(x0);
    text.forEach((line, i) => {
        if (i > 0) {
            line.unshift({ text: indent, len: x0 });
        }
    });
    return text;
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

// outer list is lines
// inner list is for different styles
type ABlock = {
    text: string;
    len: number;
    style?: Style;
}[][];

export const aBlockToString = (block: ABlock, color: boolean) => {
    return block
        .map((line) =>
            line
                .map((chunk) => applyFormats(chunk.text, chunk.style, color))
                .join(''),
        )
        .join('\n');
};

export type BlockCtx = {
    color: boolean;
    styles: StyleOverrides;
    sourceMaps?: BlockEntry[];
    dropTargets?: DropTarget[];
};

export type BlockPos = {
    x: number;
    y: number;
    x0: number;
};

export const blockToABlock = (
    pos: BlockPos,
    block: Block,
    ctx: BlockCtx,
): ABlock => {
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
                    const res = blockToABlock({ y, x, x0: x }, m, ctx);
                    x +=
                        m.width +
                        (i < block.contents.length - 1
                            ? (block.horizontal as number)
                            : 0);
                    return res;
                });
                if (block.horizontal > 0) {
                    const space = white(block.horizontal);
                    for (let i = chunks.length - 1; i >= 1; i--) {
                        chunks.splice(i, 0, [
                            [{ text: space, len: block.horizontal }],
                        ]);
                    }
                }
                let text = joinChunks(chunks, block.pullLast);
                return blockFormat(applyX0(text, pos.x - pos.x0), nodeStyle);
            }
            let y = pos.y;
            return blockFormat(
                applyX0(
                    block.contents
                        .map((m) => {
                            const res = blockToABlock(
                                { ...pos, y, x0: pos.x },
                                m,
                                ctx,
                            );
                            y += m.height;
                            return res;
                        })
                        .flat(),
                    pos.x - pos.x0,
                ),
                nodeStyle,
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
                // if (block.contents.includes('\n')) {
                //     throw new Error('need tosplit newlines');
                // }
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
                    // TODO: account for newlines in this text!!
                    return breakByLines([
                        {
                            text: pre.join(''),
                            len: pre.length,
                            style: nodeStyle,
                        },
                        {
                            text: mid.join(''),
                            len: mid.length,
                            style: {
                                ...nodeStyle,
                                background: override.color,
                            },
                        },
                        {
                            text: post.join(''),
                            len: post.length,
                            style: nodeStyle,
                        },
                    ]);
                }

                if (block.splits) {
                    for (let i = block.splits.length - 1; i >= 0; i--) {
                        const split = block.splits[i];
                        chars.splice(split, 0, '\n');
                    }
                }

                if (override?.type === 'full') {
                    return breakByLines([
                        {
                            text: chars.join(''),
                            len: chars.length,
                            style: {
                                ...nodeStyle,
                                background: override.color,
                            },
                        },
                    ]);
                }
                return breakByLines([
                    {
                        text: chars.join(''),
                        len: chars.length,
                        style: nodeStyle,
                    },
                ]);
            }
            const style: Style | undefined =
                override?.type === 'full'
                    ? { ...nodeStyle, background: override.color }
                    : nodeStyle;
            let x = pos.x;
            let y = pos.y;
            let x0 = pos.x0;
            return blockFormat(
                block.contents
                    .map((line, i) => {
                        const { width, height, positions, last } = inlineSize(
                            line,
                            x - x0,
                        );
                        const res = joinInline(
                            line.map((m, i) => {
                                const start = positions[i];
                                const res = blockToABlock(
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
                            }),
                        );

                        x = x0;
                        y += height;

                        return res;
                    })
                    .flat(1),
                style,
            );
        }
        case 'table':
            let y = pos.y;
            return blockFormat(
                block.rows
                    .map((row) => {
                        const chunks: ABlock[] = [];
                        let x = pos.x;
                        if (block.sides) {
                            chunks.push([[{ text: '⋮', len: 1 }]]);
                            x++;
                        }
                        let height = 0;
                        for (let i = 0; i < row.length; i++) {
                            if (i > 0) {
                                chunks.push([[{ text: '⋮', len: 1 }]]);
                                x++;
                            }
                            chunks.push(
                                blockToABlock(
                                    { ...pos, y, x0: x, x },
                                    row[i],
                                    ctx,
                                ),
                            );
                            if (row[i].width < block.colWidths[i]) {
                                const rest = block.colWidths[i] - row[i].width;
                                chunks.push([
                                    [{ text: white(rest), len: rest }],
                                ]);
                            }
                            x += block.colWidths[i];
                            height = Math.max(height, row[i].height);
                        }
                        if (block.sides) {
                            chunks.push([[{ text: '⋮', len: 1 }]]);
                            x++;
                        }
                        y += height;
                        return joinChunks(chunks);
                    })
                    .flat(1),
                nodeStyle,
            );
    }
};
