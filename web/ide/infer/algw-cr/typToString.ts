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
            return "'" + seen[t.v.name]; // + ':' + t.v.name;
        case 'Int':
        case 'Bool':
        case 'RowEmpty':
            return t.type;
        case 'Fun':
            return `(fn [${typToString(t.arg, seen)}] ${typToString(
                t.body,
                seen,
            )})`;
        case 'Record': {
            if (t.body.type === 'RowEmpty') {
                return '()';
            }
            const { options, at } = expandRows(t, seen);
            const res = options.map(
                ([name, value]) => `${name} ${typToString(value, seen)}`,
            );
            if (at.type !== 'RowEmpty') {
                res.push('..' + typToString(at, seen));
            }
            return `{${res.join(' ')}}`;
        }
        case 'Variant': {
            const { options, at } = expandRows(t, seen);
            const res = [];
            options.forEach(([name, value]) => {
                if (value.type === 'Record' && value.body.type === 'RowEmpty') {
                    res.push(name);
                } else {
                    res.push(`(${name} ${typToString(value, seen)})`);
                }
            });
            if (at.type !== 'RowEmpty') {
                res.push(typToString(at, seen));
            }
            return `[${res.join(' ')}]`;
        }
        case 'RowExtend':
            return `${t.name} ${typToString(t.head, seen)}${
                t.tail.type === 'RowEmpty'
                    ? ''
                    : ' ..' + typToString(t.tail, seen)
            }`;
    }
};
function expandRows(
    t: { type: 'Variant' | 'Record'; body: Type },
    seen: { [key: string]: string },
) {
    const options: [string, Type][] = [];
    let at = t.body;
    while (at.type === 'RowExtend') {
        options.push([at.name, at.head]);
        at = at.tail;
    }
    return { options, at };
}
