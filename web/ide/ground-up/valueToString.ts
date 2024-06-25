import { unwrapArray } from './round-1/parse';

export const valueToString = (v: any): string => {
    if (Array.isArray(v)) {
        return `[${v.map(valueToString).join(', ')}]`;
    }

    if (typeof v === 'object' && v && 'type' in v) {
        if (v.type === 'cons' || v.type === 'nil') {
            try {
                const un = unwrapArray(v);
                return '[' + un.map(valueToString).join(' ') + ']';
            } catch (err) {
                return 'invalid list';
            }
        }
        if (v.type === ',') {
            const items = [v[0]];
            while (v[1].type === ',') {
                v = v[1];
                items.push(v[0]);
            }
            items.push(v[1]);
            return `(, ${items.map(valueToString).join(' ')})`;
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
        // if (v.includes('"') && !v.includes("'")) {
        //     return (
        //         "'" + JSON.stringify(v).slice(1, -1).replace(/\\"/g, '"') + "'"
        //     );
        // }
        return JSON.stringify(v);
    }
    if (typeof v === 'function') {
        return v + ''; // '<function>';
    }
    if (v == null) return 'null';
    if (v === undefined) return 'undefined';
    if (typeof v === 'object') {
        if ('tag' in v && 'arg' in v) {
            return `('${v.tag} ${valueToString(v.arg)})`;
        }
        return `{${Object.keys(v)
            .map((k) => `${k} ${valueToString(v[k])}`)
            .join(' ')}}`;
    }

    return '' + v;
};
