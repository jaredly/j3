// Ok so here we convert from cst to ast

import { Node } from '../types/cst';
import { Expr, Term, Type } from '../types/ast';
import { getType } from '../get-type/get-types-new';
import { Ctx } from './Ctx';

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
    if (ctx.global.names[text]?.length) {
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

export const nextSym = (ctx: Ctx) => ctx.sym.current++;

export const addDef = (res: Expr, ctx: Ctx): Ctx => {
    if (res.type === 'deftype') {
        return {
            ...ctx,
            global: {
                ...ctx.global,
                types: {
                    ...ctx.global.types,
                    [res.hash]: res.value,
                },
                typeNames: {
                    ...ctx.global.typeNames,
                    [res.name]: [
                        res.hash,
                        ...(ctx.global.typeNames[res.name] || []),
                    ],
                },
            },
        };
    }
    if (res.type === 'def') {
        const type = getType(res.value, ctx);
        if (!type) {
            console.warn(`Trying to add a def that doesnt give a type`);
            return ctx;
        }
        return {
            ...ctx,
            global: {
                ...ctx.global,
                terms: {
                    ...ctx.global.terms,
                    [res.hash]: res,
                },
                termTypes: {
                    ...ctx.global.termTypes,
                    [res.hash]: type,
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
