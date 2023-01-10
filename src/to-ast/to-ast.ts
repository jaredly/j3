// Ok so here we convert from cst to ast

import { Loc, Node } from '../types/cst';
import { Expr, Term, TVar, Type } from '../types/ast';
import objectHash from 'object-hash';

export type Global = {
    builtins: {
        terms: { [hash: string]: Type };
        names: { [name: string]: string[] };
        namesBack: { [hash: string]: string };
        types: { [name: string]: TVar[] };
    };
    terms: { [hash: string]: Expr };
    names: { [name: string]: string[] };
    types: { [hash: string]: Type };
    typeNames: { [name: string]: string[] };
};

export type Local = {
    terms: { sym: number; name: string; type: Type }[];
    types: { sym: number; name: string; bound?: Type }[];
};

export type Ctx = {
    sym: { current: number };
    global: Global;
    local: Local;
    localMap: {
        terms: { [sym: number]: { name: string; type: Type } };
        types: { [sym: number]: { name: string; bound?: Type } };
    };
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
        Array: [
            { sym: 0, form: blank },
            {
                sym: 1,
                form: blank,
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
    const hash = objectHash(name + ' ' + noForm(type));
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
const tbool = btype('bool');
['<', '>', '<=', '>=', '==', '!='].map((name) =>
    builtinFn(basicBuiltins, name, [tint, tint], tbool),
);
['+', '-', '*', '/'].map((name) =>
    builtinFn(basicBuiltins, name, [tint, tint], tint),
);

export const emptyLocal: Local = { terms: [], types: [] };
export const initialGlobal: Global = {
    builtins: basicBuiltins,
    terms: {},
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

export const resolveExpr = (
    text: string,
    hash: string | undefined,
    ctx: Ctx,
    form: Node,
): Expr => {
    if (text === 'true' || text === 'false') {
        return { type: 'bool', value: text === 'true', form };
    }
    if (hash) {
        // if (hash === '#builtin') {
        //     return {
        //         type: 'builtin',
        //         hash: text,
        //         form,
        //     };
        // }
    }
    const local = ctx.local.terms.find((t) => t.name === text);
    if (local) {
        return { type: 'local', sym: local.sym, form };
    }
    if (ctx.global.names[text]) {
        return {
            type: 'global',
            hash: ctx.global.names[text][0],
            form,
        };
    }
    if (ctx.global.builtins.names[text]) {
        return {
            type: 'builtin',
            hash: ctx.global.builtins.names[text][0],
            form,
        };
    }
    return {
        type: 'unresolved',
        form,
        reason: `id "${text}" not resolved`,
    };
};

export const resolveType = (
    text: string,
    hash: string | undefined,
    ctx: Ctx,
    form: Node,
): Type => {
    if (hash) {
        if (hash === '#builtin') {
            return {
                type: 'builtin',
                name: text,
                form,
            };
        }
    }
    const local = ctx.local.types.find((t) => t.name === text);
    if (local) {
        return { type: 'local', sym: local.sym, form };
    }
    if (ctx.global.typeNames[text]) {
        return {
            type: 'global',
            hash: ctx.global.typeNames[text][0],
            form,
        };
    }
    if (ctx.global.builtins.types[text]) {
        return { type: 'builtin', name: text, form };
    }
    return {
        type: 'unresolved',
        form,
        reason: `id ${text} not resolved`,
    };
};

export const nodeToType = (form: Node, ctx: Ctx): Type => {
    switch (form.type) {
        case 'identifier': {
            return resolveType(form.text, form.hash, ctx, form);
        }
        case 'number':
            return {
                type: 'number',
                form,
                kind: form.raw.includes('.') ? 'float' : 'int',
                value: +form.raw,
            };
    }
    return { type: 'unresolved', form, reason: 'not impl type' };
};

export const nextSym = (ctx: Ctx) => ctx.sym.current++;

export const addDef = (res: Expr, ctx: Ctx) => {
    if (res.type === 'def') {
        return {
            ...ctx,
            global: {
                ...ctx.global,
                terms: {
                    ...ctx.global.terms,
                    [res.hash]: res,
                },
                names: {
                    ...ctx.global.names,
                    [res.name]: [
                        res.hash,
                        ...(ctx.global.names[res.name] || []),
                    ],
                },
            },
        };
    }
    return ctx;
};
