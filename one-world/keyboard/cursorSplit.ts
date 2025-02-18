import { splitGraphemes } from '../../src/parse/splitGraphemes';
import { Id, NodeID, TextSpan } from '../shared/cnodes';
import { cursorSides } from './cursorSides';
import { IdCursor, Top } from './utils';

export const spanText = (span: { text: string }) => splitGraphemes(span.text);

export const idText = (tmpText: Top['tmpText'], cursor: IdCursor | { text?: string[] }, node: { text: string; loc: NodeID }) =>
    splitGraphemes(node.text);
// export const idString = (tmpText: Top['tmpText'], cursor: IdCursor | { text?: string[] }, loc: number, text: string) =>
//     getIdText(tmpText, loc) ?? cursor.text ?? splitGraphemes(text);

export const cursorSplit = (tmpText: Top['tmpText'], node: { text: string; loc: NodeID }, cursor: IdCursor, start: number | undefined): Split => {
    const text = idText(tmpText, cursor, node);

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
