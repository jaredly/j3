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
};

const kwds = 'case var if return';
const rx: [RegExp, string][] = [];
kwds.split(' ').forEach((kwd) =>
    rx.push([new RegExp(`^${kwd}$`, 'g'), '$' + kwd]),
);

export const sanitize = (raw: string) => {
    for (let [key, val] of Object.entries(sanMap)) {
        raw = raw.replaceAll(key, val);
    }
    rx.forEach(([rx, res]) => {
        raw = raw.replaceAll(rx, res);
    });
    return raw;
};