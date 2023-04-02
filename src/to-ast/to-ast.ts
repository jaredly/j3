// Ok so here we convert from cst to ast

import { Node } from '../types/cst';
import { Expr, Term, Type } from '../types/ast';
import { getType } from '../get-type/get-types-new';
import { any, Ctx, none } from './Ctx';
import { populateAutocompleteType } from './populateAutocomplete';
import { ensure } from './nodeToExpr';

export type Result =
    | { type: 'local'; name: string; typ: Type; hash: string }
    | {
          type: 'global' | 'builtin';
          name: string;
          hash: string;
          typ: Type;
      };

export const resolveType = (
    text: string,
    hash: string | undefined,
    ctx: Ctx,
    form: Node,
): Type => {
    // console.log('resolve typpe', text);
    if (!hash && text === any.form.text) {
        return { ...any, form };
    }
    if (!hash && text === none.form.text) {
        return { ...none, form };
    }
    if (!hash) {
        // console.log('res type no hash', text);
        populateAutocompleteType(ctx, text, form);
        ctx.display[form.loc.idx].style = { type: 'unresolved' };
        return {
            type: 'unresolved',
            form,
            reason: 'no hash specified',
        };
    }

    if (hash.startsWith(':builtin:')) {
        text = hash.slice(':builtin:'.length);
        const builtin = ctx.global.builtins.types[text];
        if (builtin) {
            ensure(ctx.display, form.loc.idx, {}).style = {
                type: 'id',
                hash: text,
                text,
            };
            return { type: 'builtin', name: text, form };
        }
    }

    const global = ctx.global.types[hash];
    if (global) {
        ensure(ctx.display, form.loc.idx, {}).style = {
            type: 'id',
            hash,
            text: ctx.global.reverseNames[hash],
            ann: global,
        };
        return { type: 'global', hash, form };
    }
    populateAutocompleteType(ctx, text, form);
    return {
        type: 'unresolved',
        form,
        reason: 'global or builtin missing',
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
                reverseNames: {
                    ...ctx.global.reverseNames,
                    [res.hash]: res.name,
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
                    [res.hash]: { expr: res, type },
                },
                names: {
                    ...ctx.global.names,
                    [res.name]: [
                        res.hash,
                        ...(ctx.global.names[res.name] || []),
                    ],
                },
                reverseNames: {
                    ...ctx.global.reverseNames,
                    [res.hash]: res.name,
                },
            },
        };
    }
    return ctx;
};
