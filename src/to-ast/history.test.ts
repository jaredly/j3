import { redoItem, undoItem } from './history';
import { HistoryItem } from './library';

const undoRedoFlow = `
. A
. B
. C
. D
. E
A B C D E
. undo
A B C D E E'
. undo
A B C D E E' D'
. redo
. redo
A B C D E E' D' D E
. undo
A B C D E E' D' D E E'
. undo
. undo
A B C D E E' D' D E E' D' C'
. F
A B C D E E' D' D E E' D' C' F
. undo
. undo
A B C D E E' D' D E E' D' C' F F' B'
`
    .trim()
    .split('\n');

it('should correctly indicate what to undo and what to redo', () => {
    type Item = {
        id: number;
        revert?: number;
        letter: string;
        undo: boolean;
    };

    let items: Item[] = [];
    undoRedoFlow.forEach((line) => {
        if (line.startsWith('. ')) {
            if (line === '. undo') {
                const undid = undoItem(items);
                if (!undid) {
                    throw new Error('no undo');
                }
                items.push({
                    ...undid,
                    undo: true,
                    id: items.length,
                    revert: undid.id,
                });
            } else if (line === '. redo') {
                const undid = redoItem(items);
                if (!undid) {
                    throw new Error('no undo');
                }
                items.push({
                    ...undid,
                    undo: false,
                    id: items.length,
                    revert: undid.id,
                });
            } else {
                items.push({
                    id: items.length,
                    letter: line.slice(2),
                    undo: false,
                });
            }
        } else {
            const res = items
                .map((i) => i.letter + (i.undo ? "'" : ''))
                .join(' ');
            expect(res).toEqual(line);
        }
    });
});
