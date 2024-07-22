import { blockFormat } from './format';
import { Block } from './ir-to-blocks';
import { addSpaces, joinChunks, white } from './ir-to-text';

export const blockToText = (block: Block): string => {
    switch (block.type) {
        case 'block':
            if (block.horizontal !== false) {
                const chunks = block.contents.map(blockToText);
                if (block.horizontal > 0) {
                    addSpaces(chunks, 'all');
                }
                return blockFormat(joinChunks(chunks), block.style);
            }
            return blockFormat(
                block.contents.map(blockToText).join('\n'),
                block.style,
            );
        case 'inline':
            if (typeof block.contents === 'string') {
                return block.contents;
            }
            return block.contents
                .map((line) => line.map(blockToText).join(''))
                .join('\n');
        case 'table':
            // TODO: Spacing in the rowssss pleeease
            return block.rows
                .map((row) => {
                    if (row.type === 'other') return blockToText(row.item);
                    if (row.left.width === block.leftWidth)
                        return joinChunks([
                            blockToText(row.left),
                            blockToText(row.right),
                        ]);
                    return joinChunks([
                        blockToText(row.left),
                        white(block.leftWidth - row.left.width),
                        blockToText(row.right),
                    ]);
                })
                .join('\n');
    }
};
