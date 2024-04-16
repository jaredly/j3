import { unwrapArray } from './round-1/parse';

export const valueToString = (v: any): string => {
    if (Array.isArray(v)) {
        return `[${v.map(valueToString).join(', ')}]`;
    }

    if (typeof v === 'object' && v && 'type' in v) {
        if (v.type === 'cons' || v.type === 'nil') {
            const un = unwrapArray(v);
            return '[' + un.map(valueToString).join(' ') + ']';
        }

        let args = [];
        for (let i = 0; i in v; i++) {
            args.push(v[i]);
        }
        return `(${v.type}${args
            .map((arg) => ' ' + valueToString(arg))
            .join('')})`;
    }
    if (typeof v === 'string') {
        if (v.includes('"') && !v.includes("'")) {
            return (
                "'" + JSON.stringify(v).slice(1, -1).replace(/\\"/g, '"') + "'"
            );
        }
        return JSON.stringify(v); // + 'umraw' + v;
    }
    if (typeof v === 'function') {
        return '<function>';
    }

    return '' + v;
};
