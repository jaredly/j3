// Ok so here we convert from cst to ast

import { Expr, Type } from '../types/ast';
import { Ctx } from './library';

export type Result =
    | { type: 'local' | 'toplevel'; name: string; typ: Type; hash: number }
    | {
          type: 'global' | 'builtin';
          name: string;
          hash: string;
          typ: Type;
      };

export const addDef = (res: Expr, ctx: Ctx): Ctx => {
    return {
        ...ctx,
        results: {
            ...ctx.results,
            toplevel: {
                ...ctx.results.toplevel,
                [res.form.loc]: res,
            },
        },
    };
};
