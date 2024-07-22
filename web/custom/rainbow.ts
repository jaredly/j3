import { MNode } from '../../src/types/mcst';

const raw = '1b9e77d95f027570b3e7298a66a61ee6ab02a6761d666666';
export const rainbow: string[] = ['#669'];
for (let i = 0; i < raw.length; i += 6) {
    rainbow.push('#' + raw.slice(i, i + 6));
}

// We'll start at depth=1, so this just rolls it one over
rainbow.unshift(rainbow.pop()!);

export const parseHex = (hex: string) => {
    const r = hex.slice(1, 3);
    const g = hex.slice(3, 5);
    const b = hex.slice(5);
    return { r: parseInt(r, 16), g: parseInt(g, 16), b: parseInt(b, 16) };
};

export function getRainbowHashColor(hash: string | number) {
    const idx =
        typeof hash === 'number'
            ? Math.floor(hash * (rainbow.length / 5 - 1))
            : parseInt(hash, 16);
    const color = rainbow[idx % rainbow.length];
    return color;
}

// https://github.com/darkskyapp/string-hash/blob/master/index.js
export function fasthash(str: string) {
    var hash = 5381,
        i = str.length;

    while (i) {
        hash = (hash * 33) ^ str.charCodeAt(--i);
    }

    /* JavaScript does bitwise operations (like XOR, above) on 32-bit signed
     * integers. Since we want the results to be always positive, convert the
     * signed int to an unsigned by doing an unsigned bitshift. */
    return hash >>> 0;
}

const specials = [
    'defn',
    'def',
    'deftype',
    'typealias',
    'fn',
    'match',
    'defnrec',
    'fnrec',
    'if',
    'let',
    'proide',
    'match',
];

export const nodeColor = (type: MNode['type'], text?: string | null) => {
    return specials.includes(text!)
        ? '#814d4d'
        : (type === 'identifier' || type === 'accessText') && text != null
        ? getRainbowHashColor(fasthash(text))
        : colors[type];
};

export const stringColor = '#ff9b00';
export const colors: {
    [key: string]: string;
} = {
    identifier: '#5bb6b7',
    comment: '#616162',
    tag: '#82f682',
    number: '#8585ff', //'#4848a5',
    string: 'yellow',
    stringText: stringColor,
    unparsed: 'red',
};
