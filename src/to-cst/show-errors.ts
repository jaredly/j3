import { Ctx } from '../to-ast/to-ast';
import type { Error } from '../types/types';
import { nodeForType } from './nodeForExpr';
import { nodeToString } from './nodeToString';

export const errorToString = (error: Error, ctx: Ctx): string => {
    switch (error.type) {
        case 'cannot apply local':
            return `Cannot apply local ${error.path.join('.')}`;
        case 'enum args mismatch':
            return `Enum mismatch at ${error.path.join('.')} - ('${
                error.tag
            } ${error.one
                .map((x) => nodeToString(nodeForType(x, ctx)))
                .join(', ')}) vs ('${error.tag} ${error.two
                .map((x) => nodeToString(nodeForType(x, ctx)))
                .join(', ')}')`;
        case 'unresolved':
            return `Unresolved identifier: ${nodeToString(error.form)}`;
        case 'invalid type':
            return `Invalid type.\nExpected: ${nodeToString(
                nodeForType(error.expected, ctx),
            )}\nFound: ${nodeToString(nodeForType(error.found, ctx))}`;
    }
    return `Some error happened ${error.type} : ${JSON.stringify(error)}`;
};
