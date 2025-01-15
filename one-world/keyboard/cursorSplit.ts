import { splitGraphemes } from '../../src/parse/splitGraphemes';
import { Id, TextSpan } from '../shared/cnodes';
import { cursorSides } from './cursorSides';
import { getIdText, getTextText, IdCursor, Top } from './utils';

export const spanText = (tmpText: Top['tmpText'], loc: number, end: { text?: string[]; index: number }, span: { text: string }) =>
    getTextText(tmpText, loc, end.index) ?? end.text ?? splitGraphemes(span.text);

export const idText = (tmpText: Top['tmpText'], cursor: IdCursor | { text?: string[] }, node: { text: string; loc: number }) =>
    getIdText(tmpText, node.loc) ?? cursor.text ?? splitGraphemes(node.text);
export const idString = (tmpText: Top['tmpText'], cursor: IdCursor | { text?: string[] }, text: string) => cursor.text ?? splitGraphemes(text);

export const cursorSplit = (tmpText: Top['tmpText'], orig: string, cursor: IdCursor, start: number | undefined): Split => {
    const text = idString(tmpText, cursor, orig);

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
