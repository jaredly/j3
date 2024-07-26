import { BlockEntry } from '../../shared/IR/block-to-text';
import { IRCursor } from '../../shared/IR/intermediate';
import { Path } from '../../shared/nodes';

const shapeEnd = (shape: BlockEntry['shape']) => {
    if (shape.type === 'block') {
        const [x, y] = shape.start;
        return [x + shape.width, y + shape.height - 1];
    }
    return shape.end;
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
                // console.log('got to a text', source.shape, cursor.end);
                // if (source.shape.type !== 'inline') return console.log('sourse shape not inline'); // no good
                // const ch = choices[loc];
                // if (ch && ch.type !== 'text-wrap') return;
                if (source.shape.type === 'block') {
                    // if (ch) return console.log('wraps for block');
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
