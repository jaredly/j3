import { splitGraphemes } from '../../src/parse/splitGraphemes';
import { cursorSides } from './cursorSplit';
import { splitSmooshId, splitSmooshList } from './splitSmoosh';
import { IdCursor, ListCursor, Path, Top, Update, lastChild, selStart } from './utils';
export type Config = { tight: string; space: string; sep: string };

type Kind = 'tight' | 'space' | 'sep' | 'id';
export const textKind = (text: string, config: Config): Kind => {
    if (config.sep.includes(text)) return 'sep';
    if (config.space.includes(text)) return 'space';
    if (config.tight.includes(text)) return 'tight';
    return 'id';
};

export const handleListKey = (config: Config, top: Top, path: Path, cursor: ListCursor, grem: string): Update | void => {
    const current = top.nodes[lastChild(path)];
    if (current.type !== 'list') throw new Error('not list');
    const kind = textKind(grem, config);
    switch (kind) {
        case 'space':
        case 'sep':
            throw new Error('yet not');
        default:
            if (cursor.type === 'list') {
                return splitSmooshList(top, path, cursor, grem, kind === 'tight');
            }
    }
};

// grem is a single grapheme.
export const insertId = (config: Config, top: Top, path: Path, cursor: IdCursor, grem: string): Update => {
    const current = top.nodes[lastChild(path)];
    if (current.type !== 'id') throw new Error('not id');
    const kind = textKind(grem, config);
    switch (kind) {
        case 'space':
        case 'sep':
            throw new Error('not yurt');
        default:
            // Set the punctliness
            if (current.punct == null) {
                return {
                    nodes: { [current.loc]: { ...current, punct: kind === 'tight', text: grem } },
                    selection: { start: selStart(path, { type: 'id', end: 1 }) },
                };
            }
            // Split (punct is diff)
            if (current.punct !== (kind === 'tight')) {
                return splitSmooshId(top, path, cursor, grem, kind === 'tight');
            }
            // Just update the selection
            const chars = cursor.text?.slice() ?? splitGraphemes(current.text);
            const { left, right } = cursorSides(cursor);
            chars.splice(left, right - left, grem);
            return { nodes: {}, selection: { start: selStart(path, { ...cursor, text: chars, end: left + 1 }) } };
    }
};
