// Ok so here we convert from cst to ast

import { Expr, Term, Type } from '../types/ast';
import { getType } from '../get-type/get-types-new';
import { Ctx } from './library';

export type Result =
    | { type: 'local'; name: string; typ: Type; hash: number }
    | {
          type: 'global' | 'builtin';
          name: string;
          hash: string;
          typ: Type;
      };

// export const nextSym = (ctx: Ctx) => ctx.sym.current++;

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
