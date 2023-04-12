import { Expr, Loc, Node, TRecord, Type } from '../types/ast';
import objectHash from 'object-hash';
import { Global, noForm } from './Ctx';

export const noloc: Loc = { start: -1, end: -1, idx: -1 };

export const blank: Node = {
    type: 'blank',
    loc: { start: -1, end: -1, idx: -1 },
};

export const btype = (v: string): Type => ({
    type: 'builtin',
    form: blank,
    name: v,
});

export const basicBuiltins: Global['builtins'] = {
    types: {
        uint: [],
        texture: [],
        int: [],
        float: [],
        bool: [],
        string: [],
        bytes: [],
        'attachment-handle': [],
        array: [
            { sym: 0, form: blank, name: 'Value' },
            {
                sym: 1,
                form: blank,
                name: 'Length',
                default_: {
                    type: 'builtin',
                    name: 'uint',
                    form: blank,
                },
            },
        ],
    },
    names: {},
    terms: {},
};

export const addBuiltin = (
    builtins: Global['builtins'],
    reverseNames: { [key: string]: string },
    name: string,
    type: Type,
) => {
    const hash = objectHash(name + ' ' + JSON.stringify(noForm(type)));
    if (builtins.terms[hash]) {
        throw new Error(`Dupliocate hash?? ${hash}`);
    }
    builtins.names[name] = [hash].concat(builtins.names[name] ?? []);
    builtins.terms[hash] = type;
    reverseNames[hash] = name;
    return hash;
};

export const builtinFn = (
    builtins: Global['builtins'],
    reverseNames: { [key: string]: string },

    name: string,
    args: Type[],
    body: Type,
) => {
    return addBuiltin(builtins, reverseNames, name, {
        type: 'fn',
        args,
        body,
        form: blank,
    });
};
const tint = btype('int');
const tuint = btype('uint');
const tfloat = btype('float');
const tbool = btype('bool');
const tstring = btype('string');
const tbytes = btype('bytes');
const thandle = btype('attachment-handle');

export const fileBase: Type = {
    type: 'record',
    form: blank,
    open: false,
    spreads: [],
    entries: [
        {
            name: 'name',
            value: tstring,
        },
        {
            name: 'mime',
            value: tstring,
        },
    ],
};

export const extendRecord = (
    t: TRecord,
    entries: TRecord['entries'],
): TRecord => ({
    ...t,
    entries: t.entries.concat(entries),
});

export const fileLazy = extendRecord(fileBase, [
    { name: 'handle', value: thandle },
]);

export const imageFileBase = extendRecord(fileBase, [
    { name: 'width', value: tuint },
    { name: 'height', value: tuint },
]);

export const imageFileLazy = extendRecord(imageFileBase, [
    { name: 'handle', value: thandle },
]);
export const basicReverse: { [key: string]: string } = {};

export const mathHashes: {
    int: { [key: string]: string };
    uint: { [key: string]: string };
    float: { [key: string]: string };
} = { int: {}, float: {}, uint: {} };
['<', '>', '<=', '>=', '==', '!='].map((name) => {
    mathHashes.int[name] = builtinFn(
        basicBuiltins,
        basicReverse,
        name,
        [tint, tint],
        tbool,
    );
    mathHashes.uint[name] = builtinFn(
        basicBuiltins,
        basicReverse,
        name,
        [tuint, tuint],
        tbool,
    );
    mathHashes.float[name] = builtinFn(
        basicBuiltins,
        basicReverse,
        name,
        [tfloat, tfloat],
        tbool,
    );
});
['+', '-', '*', '/'].map((name) => {
    mathHashes.int[name] = builtinFn(
        basicBuiltins,
        basicReverse,
        name,
        [tint, tint],
        tint,
    );
    mathHashes.uint[name] = builtinFn(
        basicBuiltins,
        basicReverse,
        name,
        [tuint, tuint],
        tuint,
    );
    mathHashes.float[name] = builtinFn(
        basicBuiltins,
        basicReverse,
        name,
        [tfloat, tfloat],
        tfloat,
    );
});
builtinFn(basicBuiltins, basicReverse, '==', [tbool, tbool], tbool);
builtinFn(basicBuiltins, basicReverse, 'toString', [tint], tstring);
builtinFn(basicBuiltins, basicReverse, 'toString', [tbool], tstring);
builtinFn(
    basicBuiltins,
    basicReverse,
    'has-prefix?',
    [tstring, tstring],
    tbool,
);
addBuiltin(basicBuiltins, basicReverse, 'reduce', {
    type: 'tfn',
    body: {
        type: 'fn',
        body: {
            type: 'local',
            form: blank,
            sym: 1,
        },
        args: [
            {
                type: 'apply',
                target: {
                    type: 'builtin',
                    form: blank,
                    name: 'array',
                },
                form: blank,
                args: [
                    {
                        type: 'local',
                        form: blank,
                        sym: 0,
                    },
                ],
            },
            {
                type: 'local',
                form: blank,
                sym: 1,
            },
            {
                type: 'fn',
                form: blank,
                body: {
                    type: 'local',
                    form: blank,
                    sym: 1,
                },
                args: [
                    {
                        type: 'local',
                        form: blank,
                        sym: 0,
                    },
                    {
                        type: 'local',
                        form: blank,
                        sym: 1,
                    },
                ],
            },
        ],
        form: blank,
    },
    args: [
        {
            form: blank,
            sym: 0,
            name: 'Input',
        },
        {
            form: blank,
            sym: 1,
            name: 'Output',
        },
    ],
    form: blank,
});
// We want it to be generic, which is the trick
// and ... at this point, do we have to actually do a type
// system?
// builtinFn(
//     basicBuiltins,
//     basicReverse,
//     'reduce',
// )
const record = (entries: TRecord['entries']): TRecord => ({
    type: 'record',
    entries,
    form: { type: 'blank', loc: noloc },
    open: false,
    spreads: [],
});
builtinFn(
    basicBuiltins,
    basicReverse,
    'texture-get',
    [
        btype('texture'),
        record([
            { name: 'x', value: tfloat },
            { name: 'y', value: tfloat },
        ]),
    ],
    record([
        { name: 'x', value: tfloat },
        { name: 'y', value: tfloat },
        { name: 'z', value: tfloat },
        { name: 'w', value: tfloat },
    ]),
);
addBuiltin(basicBuiltins, basicReverse, 'debugToString', {
    type: 'tfn',
    args: [{ sym: 0, form: blank, name: 'Value' }],
    body: {
        type: 'fn',
        args: [{ type: 'local', sym: 0, form: blank }],
        body: tstring,
        form: blank,
    },
    form: blank,
});

export const nil: Expr = {
    type: 'record',
    entries: [],
    spreads: [],
    form: {
        type: 'list',
        values: [],
        loc: noloc,
    },
};

export const any = {
    type: 'any',
    form: {
        type: 'identifier',
        text: '𝕌',
        loc: noloc,
    },
} satisfies Type;

export const none = {
    type: 'none',
    form: {
        type: 'identifier',
        text: '⍉',
        loc: noloc,
    },
} satisfies Type;

export const nilt = {
    type: 'record',
    entries: [],
    open: false,
    spreads: [],
    form: {
        type: 'list',
        values: [],
        loc: noloc,
    },
} satisfies Type;
