import { Ctx } from '../to-ast/Ctx';
import type { Error } from '../types/types';
// import { makeRCtx } from './nodeForExpr';
import { nodeForType } from './nodeForType';
import { nodeToString } from './nodeToString';

export const errorToString = (error: Error, ctx: Ctx): string => {
    // const rctx = makeRCtx(ctx);
    switch (error.type) {
        case 'cannot apply local':
            return `Cannot apply local ${error.path.join('.')}`;
        case 'enum args mismatch':
            return `Enum mismatch at ${error.path.join('.')} - ('${
                error.tag
            } ${error.one
                .map((x) => nodeToString(nodeForType(x, ctx), ctx.hashNames))
                .join(', ')}) vs ('${error.tag} ${error.two
                .map((x) => nodeToString(nodeForType(x, ctx), ctx.hashNames))
                .join(', ')}')`;
        case 'unresolved':
            return `identifier not linked`;
        case 'unparsed':
            return `Unparsed: ${nodeToString(error.form, ctx.hashNames)}`;
        case 'misc':
            return error.message;
        case 'invalid type':
            return `Invalid type.\nExpected: ${nodeToString(
                nodeForType(error.expected, ctx),
                ctx.hashNames,
            )}\nFound: ${nodeToString(
                nodeForType(error.found, ctx),
                ctx.hashNames,
            )}`;
    }
    return `Some error happened ${error.type} : ${JSON.stringify(
        error,
        null,
        2,
    )}`;
};
