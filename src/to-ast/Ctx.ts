import { Loc, Node } from '../types/cst';
import { Expr, TVar, Type } from '../types/ast';
import objectHash from 'object-hash';
import { Report } from '../get-type/get-types-new';
import { Layout } from '../types/mcst';

export type AutoCompleteResult = {
    type: 'replace';
    text: string;
    hash: string;
    ann?: Type;
}; // TODO also autofixers probably?

export type Ctx = {
    errors: Report['errors'];
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
        namesBack: { [hash: string]: string };
        types: { [name: string]: TVar[] };
    };
    terms: { [hash: string]: Expr };
    termTypes: { [hash: string]: Type };
    names: { [name: string]: string[] };
    types: { [hash: string]: Type };
    typeNames: { [name: string]: string[] };
};

export type Local = {
    terms: { sym: number; name: string; type: Type }[];
    types: { sym: number; name: string; bound?: Type }[];
};

export type NodeStyle = 'italic' | 'pairs' | 'bold' | 'inferred';

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
    namesBack: {},
    terms: {},
};

export const noForm = (obj: any): any => {
    if (Array.isArray(obj)) {
        return obj.map(noForm);
    }
    if (typeof obj === 'object') {
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
    name: string,
    type: Type,
) => {
    const hash = objectHash(name + ' ' + JSON.stringify(noForm(type)));
    if (builtins.terms[hash]) {
        throw new Error(`Dupliocate hash?? ${hash}`);
    }
    builtins.names[name] = [hash].concat(builtins.names[name] ?? []);
    builtins.terms[hash] = type;
    builtins.namesBack[hash] = name;
};

export const builtinFn = (
    builtins: Global['builtins'],

    name: string,
    args: Type[],
    body: Type,
) => {
    addBuiltin(builtins, name, {
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
['<', '>', '<=', '>=', '==', '!='].map((name) => {
    builtinFn(basicBuiltins, name, [tint, tint], tbool);
    builtinFn(basicBuiltins, name, [tuint, tuint], tbool);
    builtinFn(basicBuiltins, name, [tfloat, tfloat], tbool);
});
['+', '-', '*', '/'].map((name) => {
    builtinFn(basicBuiltins, name, [tint, tint], tint);
    builtinFn(basicBuiltins, name, [tuint, tuint], tuint);
    builtinFn(basicBuiltins, name, [tfloat, tfloat], tfloat);
});
builtinFn(basicBuiltins, 'toString', [tint], tstring);
builtinFn(basicBuiltins, 'toString', [tbool], tstring);
addBuiltin(basicBuiltins, 'debugToString', {
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
    termTypes: {},
    names: {},
    types: {},
    typeNames: {},
};

export const newCtx = (): Ctx => {
    return {
        sym: { current: 0 },
        global: initialGlobal,
        local: emptyLocal,
        localMap: { terms: {}, types: {} },
        errors: {},
        display: {},
    };
};

export const noloc: Loc = { start: -1, end: -1, idx: -1 };

export const nil: Expr = {
    type: 'record',
    entries: [],
    form: {
        type: 'list',
        values: [],
        loc: noloc,
    },
};

export const nilt: Type = {
    type: 'record',
    entries: [],
    open: false,
    form: {
        type: 'list',
        values: [],
        loc: noloc,
    },
};
