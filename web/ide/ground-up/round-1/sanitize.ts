// The builtins

const sanMap = {
    '-': '_',
    '+': '$pl',
    '*': '$ti',
    '=': '$eq',
    '>': '$gt',
    '<': '$lt',
    "'": '$qu',
    '"': '$dq',
    ',': '$co',
    '/': '$sl',
    ';': '$semi',
    '@': '$at',
    '!': '$ex',
    '|': '$bar',
    '()': '$unit',
    ':': '$cl',
    '.': '$do',
    '?': '$qe',
    $: '$$',
};

const kwds =
    'case new var const let if else return super break while for default eval';
const rx: [RegExp, string][] = [];
kwds.split(' ').forEach((kwd) =>
    rx.push([new RegExp(`^${kwd}$`, 'g'), '$' + kwd]),
);

export const sanitize = (raw: string) => {
    if (raw == null) debugger;
    for (let [key, val] of Object.entries(sanMap)) {
        raw = raw.replaceAll(key, val);
    }
    rx.forEach(([rx, res]) => {
        raw = raw.replaceAll(rx, res);
    });
    return raw;
};
