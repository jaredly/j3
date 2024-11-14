import { splitGraphemes } from '../../src/parse/splitGraphemes';
import { cursorSides } from './cursorSplit';
import { splitSmooshId, splitSmooshList, splitSpacedId, splitSpacedList } from './splitSmoosh';
import { IdCursor, CollectionCursor, Path, Top, Update, lastChild, selStart, ListCursor, TextCursor } from './utils';
export type Config = { tight: string; space: string; sep: string };

export type Kind = 'tight' | 'space' | 'sep' | 'id' | 'string';
export const textKind = (grem: string, config: Config): Kind => {
    if (grem === '"') return 'string';
    if (config.sep.includes(grem)) return 'sep';
    if (config.space.includes(grem)) return 'space';
    if (config.tight.includes(grem)) return 'tight';
    return 'id';
};

export const handleTextKey = (config: Config, top: Top, path: Path, cursor: ListCursor | TextCursor, grem: string): Update | void => {
    const current = top.nodes[lastChild(path)];
    if (current.type !== 'text') throw new Error('not text');
    const kind = textKind(grem, config);
    switch (kind) {
        case 'space':
            if (cursor.type === 'list') {
                return splitSpacedList(top, path, cursor);
            }
        case 'sep':
            throw new Error('yet not');
        default:
            if (cursor.type === 'list') {
                return splitSmooshList(top, path, cursor, grem, kind === 'tight');
            }
    }
};

export const handleListKey = (config: Config, top: Top, path: Path, cursor: CollectionCursor, grem: string): Update | void => {
    const current = top.nodes[lastChild(path)];
    if (current.type !== 'list') throw new Error('not list');
    const kind = textKind(grem, config);
    switch (kind) {
        case 'space':
            if (cursor.type === 'list') {
                return splitSpacedList(top, path, cursor);
            }
        case 'sep':
            throw new Error('yet not');
        default:
            if (cursor.type === 'list') {
                return splitSmooshList(top, path, cursor, grem, kind === 'tight');
            }
    }
    // throw new Error('noa');
};

// grem is a single grapheme.
export const insertId = (config: Config, top: Top, path: Path, cursor: IdCursor, grem: string): Update => {
    const current = top.nodes[lastChild(path)];
    if (current.type !== 'id') throw new Error('not id');
    const kind = textKind(grem, config);
    switch (kind) {
        case 'space':
            return splitSpacedId(top, path, cursor);
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
            if (current.punct === (kind === 'tight')) {
                // Just update the selection
                const chars = cursor.text?.slice() ?? splitGraphemes(current.text);
                const { left, right } = cursorSides(cursor);
                chars.splice(left, right - left, grem);
                return { nodes: {}, selection: { start: selStart(path, { ...cursor, text: chars, end: left + 1 }) } };
            }
            // Split (punct is diff)
            return splitSmooshId(top, path, cursor, grem, kind === 'tight');
    }
};
