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
    newLines: number[],
): number => {
    if (!wraps.length && !newLines.length) {
        return pos.x - shape.start[0];
    }

    const wrapsByNewLine = organizeWraps(wraps, newLines);

    let y = shape.start[1];
    for (let i = 0; i < wrapsByNewLine.length; i++) {
        // if (y === pos.y) {
        const wraps = wrapsByNewLine[i];
        // new we're cooking
        for (let k = 0; k < wraps.length; k++) {
            if (y === pos.y) {
                // const y = shape.start[1] + k;
                const x0 =
                    y === shape.start[1] ? shape.start[0] : shape.hbounds[0];
                const dx = pos.x - x0;
                const index0 =
                    k === 0 ? (i === 0 ? 0 : newLines[i - 1]) : wraps[k - 1];
                //  +
                // (index -
                // (k === 0
                //     ? i === 0
                //         ? 0
                //         : newLines[i - 1]
                //     : wraps[k - 1]));
                return index0 + dx;
                // return [x, y];
            }
            y += 1;
        }
        // const start = i === 0 ? 0 : newLines[i - 1];
        // const off =
        //     (y === 0 ? shape.start[0] : shape.hbounds[0]) + (index - start);
        // return [off, y];
        // }
        y += 1;
        // if (i === 0) {
        //     index--;
        // }
        // index--; // ~consuming the newline
    }

    return 0;

    // if (pos.y === shape.start[1]) {
    //     return pos.x - shape.start[0];
    // }
    // for (let i = 0; i < wraps.length; i++) {
    //     const y = shape.start[1] + i + 1;
    //     if (y < pos.y) continue;
    //     const x0 = shape.hbounds[0];
    //     const off = pos.x - x0;
    //     if (i < wraps.length - 1 && wraps[i] + off > wraps[i + 1])
    //         return wraps[i];
    //     return wraps[i] + off;
    // }
    // // TODO fail or sth
    // return 0;
};

const organizeWraps = (wraps: number[], newLines: number[]) => {
    const org: number[][] = [];
    let j = 0;
    newLines.forEach((ln, i) => {
        const line: number[] = [];
        org.push(line);
        for (; j < wraps.length && wraps[j] < ln; j++) {
            line.push(wraps[j]);
        }
    });
    const last: number[] = [];
    org.push(last);
    for (; j < wraps.length; j++) {
        last.push(wraps[j]);
    }
    return org;
};

const shapeTextIndex = (
    index: number,
    shape: Extract<BlockEntry['shape'], { type: 'inline' }>,
    wraps: number[],
    newLines: number[],
) => {
    if (!wraps.length && !newLines.length) {
        return [shape.start[0] + index, shape.start[1]];
    }
    const wrapsByNewLine = organizeWraps(wraps, newLines);
    let y = shape.start[1];
    for (let i = 0; i < wrapsByNewLine.length; i++) {
        if (i === newLines.length || newLines[i] + (i === 0 ? 1 : 0) > index) {
            const x0 = i === 0 ? 0 : newLines[i - 1];
            const wraps = wrapsByNewLine[i];
            // new we're cooking
            for (let k = 0; k < wraps.length; k++) {
                if (wraps[k] > index) {
                    // const y = shape.start[1] + k;
                    const x =
                        (y === shape.start[1]
                            ? shape.start[0]
                            : shape.hbounds[0]) +
                        (index - (k === 0 ? x0 : wraps[k - 1]));
                    return [x, y];
                }
                y += 1;
            }
            const start = i === 0 ? 0 : newLines[i - 1];
            const off =
                (y === shape.start[1] ? shape.start[0] : shape.hbounds[0]) +
                (index - start);
            return [off, y];
        }
        y += 1;
        if (i === 0) {
            index--;
        }
        // index--; // ~consuming the newline
    }
    throw new Error(`Logic issue, got to the end of the line`);
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
                const pos = shapeTextIndex(
                    cursor.end.cursor,
                    source.shape,
                    source.source.wraps,
                    source.source.newLines,
                );
                if (isNaN(pos[0]) || isNaN(pos[1])) {
                    throw new Error('text index pos nan');
                }
                return {
                    source,
                    pos,
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
                        source.source.newLines,
                    ),
                },
            };
    }
};
