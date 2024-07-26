import { BlockEntry } from '../../shared/IR/block-to-text';
import { IRCursor, IRSelection } from '../../shared/IR/intermediate';
import { Path } from '../../shared/nodes';

const shapeEnd = (shape: BlockEntry['shape']) => {
    if (shape.type === 'block') {
        const [x, y] = shape.start;
        return [x + shape.width, y + shape.height - 1];
    }
    return shape.end;
};

const shapeTextCursor = (
    pos: { x: number; y: number },
    shape: Extract<BlockEntry['shape'], { type: 'inline' }>,
    wraps: number[],
): number => {
    if (!wraps.length) {
        return pos.x - shape.start[0];
    }
    if (pos.y === shape.start[1]) {
        return pos.x - shape.start[0];
    }
    for (let i = 0; i < wraps.length; i++) {
        const y = shape.start[1] + i + 1;
        if (y < pos.y) continue;
        const x0 = shape.hbounds[0];
        const off = pos.x - x0;
        if (i < wraps.length - 1 && wraps[i] + off > wraps[i + 1])
            return wraps[i];
        return wraps[i] + off;
    }
    // TODO fail or sth
    return 0;
};

const shapeTextIndex = (
    index: number,
    shape: Extract<BlockEntry['shape'], { type: 'inline' }>,
    wraps: number[],
) => {
    if (!wraps.length) {
        return [shape.start[0] + index, shape.start[1]];
    }
    // const chars = splitGraphemes(ir.text);
    for (let i = 0; i < wraps.length; i++) {
        if (wraps[i] > index) {
            const y = shape.start[1] + i;
            const x =
                (i === 0 ? shape.start[0] : shape.hbounds[0]) +
                (index - (i === 0 ? 0 : wraps[i - 1]));
            return [x, y];
        }
    }
    const x = shape.hbounds[0] + (index - wraps[wraps.length - 1]);
    return [x, shape.end[1]];
};

export const selectionLocation = (
    sourceMaps: BlockEntry[],
    path: Path,
    cursor: IRCursor,
) => {
    const loc = path.children[path.children.length - 1];
    for (let source of sourceMaps) {
        if (source.source.top !== path.root.toplevel) continue;
        if (source.source.loc !== loc) continue;
        switch (cursor.type) {
            case 'control':
                if (source.source.type !== 'control') continue;
                if (cursor.index !== source.source.index) continue;
                return { source, pos: shapeEnd(source.shape) };
            case 'side':
                if (source.source.type !== 'cursor') continue;
                if (source.source.side !== cursor.side) continue;
                return { source, pos: source.shape.start };
            case 'text':
                if (source.source.type !== 'text') continue;
                if (source.source.index !== cursor.end.index) continue;
                if (source.shape.type === 'block') {
                    if (source.shape.height !== 1)
                        return console.log('height not 1');
                    const [x, y] = source.shape.start;
                    if (isNaN(x)) throw new Error('what shape');
                    if (isNaN(x + cursor.end.cursor))
                        throw new Error('what cursor');
                    return { source, pos: [x + cursor.end.cursor, y] };
                }
                return {
                    source,
                    pos: shapeTextIndex(
                        cursor.end.cursor,
                        source.shape,
                        source.source.wraps,
                    ),
                };
        }
    }
};

export const selectionFromLocation = (
    source: BlockEntry,
    pos: { x: number; y: number },
): IRCursor => {
    switch (source.source.type) {
        case 'control':
            return { type: 'control', index: source.source.index };
        case 'cursor':
            return { type: 'side', side: source.source.side };
        case 'text':
            if (source.shape.type === 'block') {
                return {
                    type: 'text',
                    end: {
                        index: source.source.index,
                        cursor: pos.x - source.shape.start[0],
                    },
                };
            }
            return {
                type: 'text',
                end: {
                    index: source.source.index,
                    cursor: shapeTextCursor(
                        pos,
                        source.shape,
                        source.source.wraps,
                    ),
                },
            };
    }
};
