import { Type } from './types';

const letters = 'abcdefghijklmno';

export const typToString = (
    t: Type,
    seen: { [key: string]: string } = {},
): string => {
    switch (t.type) {
        case 'Var':
            if (!seen[t.v.name]) {
                seen[t.v.name] = letters[Object.keys(seen).length];
            }
            return "'" + seen[t.v.name];
        case 'Int':
        case 'Bool':
        case 'RowEmpty':
            return t.type;
        case 'Fun':
            return `(fn [${typToString(t.arg, seen)}] ${typToString(
                t.body,
                seen,
            )})`;
        case 'Record':
            return `{${typToString(t.body, seen)}}`;
        case 'Variant': {
            const options = [];
            let at = t.body;
            while (at.type === 'RowExtend') {
                if (
                    at.head.type === 'Record' &&
                    at.head.body.type === 'RowEmpty'
                ) {
                    options.push(at.name);
                } else {
                    options.push(`(${at.name} ${typToString(at.head, seen)})`);
                }
                at = at.tail;
            }
            options.push(typToString(at, seen));
            return `[${options.join(' ')}]`;
        }
        case 'RowExtend':
            return `${t.name} ${typToString(t.head, seen)}${
                t.tail.type === 'RowEmpty'
                    ? ''
                    : ' ..' + typToString(t.tail, seen)
            }`;
    }
};
