import { splitGraphemes } from '../../src/parse/splitGraphemes';
import { IdCursor } from './lisp';

export const cursorSplit = (orig: string, cursor: IdCursor): Split => {
    const text = cursor.text ?? splitGraphemes(orig);

    const left = cursor.start ? Math.min(cursor.start, cursor.end) : cursor.end;
    const right = cursor.start
        ? Math.max(cursor.start, cursor.end)
        : cursor.end;

    if (left === 0) {
        return {
            type: 'before',
            text: right !== left ? text.slice(right).join('') : text.join(''),
        };
    }
    if (right === text.length) {
        return {
            type: 'after',
            text: left !== right ? text.slice(0, left).join('') : text.join(''),
        };
    }
    return {
        type: 'between',
        left: text.slice(0, left).join(''),
        right: text.slice(right).join(''),
    };
};

export type Split =
    | { type: 'before'; text: string }
    | { type: 'after'; text: string }
    | { type: 'between'; left: string; right: string };
