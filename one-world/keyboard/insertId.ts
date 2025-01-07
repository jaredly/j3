import { Text } from '../shared/cnodes';
import { selUpdate } from './handleNav';
import { Config } from './test-utils';
import { TextCursor } from './utils';

export type Kind = number | 'space' | 'sep' | 'string'; // | 'bar';

export const textKind = (grem: string, config: Config): Kind => {
    if (grem === '"') return 'string';
    if (config.sep.includes(grem)) return 'sep';
    if (config.space.includes(grem)) return 'space';
    return charClass(grem, config);
};

export const charClass = (grem: string, config: Config): number => {
    for (let i = 0; i < config.punct.length; i++) {
        if (config.punct[i].includes(grem)) {
            return i + 1;
        }
    }
    return 0; // 0 is the class for text
};

// export const textCursorSides = (cursor: TextCursor) => {
//     const left = cursor.start ? Math.min(cursor.start.cursor, cursor.end.cursor) : cursor.end.cursor;
//     const right = cursor.start ? Math.max(cursor.start.cursor, cursor.end.cursor) : cursor.end.cursor;
//     return { left, right };
// };

// export const textCursorSides2 = (
//     cursor: TextCursor,
// ): { left: { cursor: number; index: number }; right: { cursor: number; index: number }; text?: { grems: string[]; index: number } } => {
//     const text = cursor.end.text ? { grems: cursor.end.text, index: cursor.end.index } : undefined;
//     if (!cursor.start) return { left: cursor.end, right: cursor.end, text };
//     if (cursor.start.index > cursor.end.index || (cursor.start.index === cursor.end.index && cursor.start.cursor > cursor.end.cursor)) {
//         return { left: cursor.end, right: cursor.start, text };
//     }
//     return { left: cursor.start, right: cursor.end, text };
// };
