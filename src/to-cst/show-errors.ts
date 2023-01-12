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
    }
    return `Some error happened ${error.type} : ${JSON.stringify(error)}`;
};
