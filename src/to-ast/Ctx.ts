import { Loc, Node } from '../types/cst';
import { Expr, NumberKind, TRecord, TVar, Type } from '../types/ast';
import objectHash from 'object-hash';
import { Report } from '../get-type/get-types-new';
import { Layout, MNodeContents } from '../types/mcst';

export type AutoCompleteReplace = {
    type: 'replace';
    text: string;
    node: MNodeContents;
    exact: boolean;
    ann: Type;
};

export type AutoCompleteResult =
    | AutoCompleteReplace
    | { type: 'info'; text: string }; // TODO also autofixers probably?

export type Mod =
    | {
          type: 'tannot';
          node: Node;
      }
    | { type: 'hash'; hash: string };

export type Ctx = {
    errors: Report['errors'];
    mods: {
        [idx: number]: Mod[];
    };
    display: {
        [idx: number]: {
            style?: NodeStyle;
            layout?: Layout;
            autoComplete?: AutoCompleteResult[];
        };
    };
    sym: { current: number };
    global: Global;
    local: Local;
    localMap: {
        terms: { [sym: number]: { name: string; type: Type } };
        types: { [sym: number]: { name: string; bound?: Type } };
    };
};

export type Global = {
    builtins: {
        terms: { [hash: string]: Type };
        names: { [name: string]: string[] };
        types: { [name: string]: TVar[] };
    };
    terms: { [hash: string]: { expr: Expr; type: Type } };
    names: { [name: string]: string[] };
    types: { [hash: string]: Type };
    typeNames: { [name: string]: string[] };
    reverseNames: { [hash: string]: string };
};

export type Local = {
    terms: { sym: number; name: string; type: Type }[];
    types: { sym: number; name: string; bound?: Type }[];
};

export type NodeStyle =
    | { type: 'tag' }
    | { type: 'record-attr' }
    | { type: 'let-pairs' }
    | { type: 'unresolved' }
    | { type: 'number'; kind: NumberKind }
    | { type: 'id-decl'; hash: string }
    | {
          type: 'id';
          hash: string;
          ann?: Type;
          text?: string;
      };

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
        int: [],
        float: [],
        bool: [],
        string: [],
        bytes: [],
        'attachment-handle': [],
        Array: [
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

export const noForm = (obj: any): any => {
    if (Array.isArray(obj)) {
        return obj.map(noForm);
    }
    if (obj && typeof obj === 'object') {
        const res: any = {};
        Object.keys(obj).forEach((k) => {
            if (k !== 'form') {
                res[k] = noForm(obj[k]);
            }
        });
        return res;
    }
    return obj;
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

const basicReverse: { [key: string]: string } = {};

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

export const emptyLocal: Local = { terms: [], types: [] };
export const initialGlobal: Global = {
    builtins: basicBuiltins,
    terms: {},
    names: {},
    types: {},
    typeNames: {},
    reverseNames: { ...basicReverse },
};

export const newCtx = (): Ctx => {
    return {
        sym: { current: 0 },
        global: initialGlobal,
        local: emptyLocal,
        localMap: { terms: {}, types: {} },
        errors: {},
        display: {},
        mods: {},
    };
};

export const noloc: Loc = { start: -1, end: -1, idx: -1 };

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
