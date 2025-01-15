import { splitGraphemes } from '../../src/parse/splitGraphemes';
import { Id } from '../shared/cnodes';
import { cursorSides } from './cursorSides';
import { IdCursor } from './utils';

export const idText = (cursor: { text?: string[] }, node: { text: string }) => cursor.text ?? splitGraphemes(node.text);

export const idString = (cursor: { text?: string[] }, text: string) => cursor.text ?? splitGraphemes(text);

export const cursorSplit = (orig: string, cursor: IdCursor, start: number | undefined): Split => {
    const text = idString(cursor, orig);

    const { left, right } = cursorSides(cursor, start);

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

export type Split = { type: 'before'; text: string } | { type: 'after'; text: string } | { type: 'between'; left: string; right: string };
