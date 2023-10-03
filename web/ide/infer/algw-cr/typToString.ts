import { Type } from './types';

export const typToString = (t: Type): string => {
    switch (t.type) {
        case 'Var':
            // if (t.v.constraint) {
            //     return JSON.stringify(t.v);
            // }
            return t.v.name;
        case 'Int':
        case 'Bool':
        case 'RowEmpty':
            return t.type;
        case 'Fun':
            return `(fn [${typToString(t.arg)}] ${typToString(t.body)})`;
        case 'Record':
            return `{${typToString(t.body)}}`;
        case 'Variant':
            return `{v ${typToString(t.body)}}`;
        case 'RowExtend':
            return `${t.name}=${typToString(t.head)}${
                t.tail.type === 'RowEmpty' ? '' : ' ..' + typToString(t.tail)
            }`;
    }
};
