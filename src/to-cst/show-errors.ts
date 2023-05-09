// import { Ctx } from '../to-ast/Ctx';
import { asTaskType } from '../get-type/asTaskType';
import { expandTask } from '../get-type/expandTask';
import { blank } from '../to-ast/builtins';
import { Ctx } from '../to-ast/library';
import { Type } from '../types/ast';
import type { Error } from '../types/types';
// import { makeRCtx } from './nodeForExpr';
import { nodeForType } from './nodeForType';
import { nodeToString } from './nodeToString';

export const errorToString = (error: Error, ctx: Ctx): string => {
    const nts = (n: Type): string => {
        const res = nodeToString(
            nodeForType(n, ctx.results.hashNames),
            ctx.results.hashNames,
        );
        if (n.type === 'task') {
            const tt = asTaskType(n, ctx);
            if (tt.type === 'task') {
                return res + ' <expanded task> ' + nts(expandTask(tt, blank));
            } else {
                return (
                    res +
                    ' <error expanding task> ' +
                    errorToString(tt.error, ctx)
                );
            }
        }
        return res;
    };
    switch (error.type) {
        case 'cannot apply local':
            return `Cannot apply local ${error.path.join('.')}`;
        case 'enum args mismatch':
            return `Enum mismatch at ${error.path.join('.')} - ('${
                error.tag
            } ${error.one.map(nts).join(', ')}) vs ('${error.tag} ${error.two
                .map(nts)
                .join(', ')}')`;
        case 'too few arguments':
            return `Expected ${nts(error.expected)}`;
        case 'unresolved':
            return error.reason ?? `identifier not linked`;
        case 'unparsed':
            return `Unparsed: ${nodeToString(
                error.form,
                ctx.results.hashNames,
            )}`;
        case 'misc':
            return error.message + (error.typ ? ' ' + nts(error.typ) : '');
        case 'case':
            return `unreachable case or something\nPattern type:${nts(
                error.pattern,
            )}\nAvailable type:${nts(error.target)}`;
        case 'not a task':
            return `Not a task: ${nts(error.target)}. Inner: ${errorToString(
                error.inner,
                ctx,
            )}`;
        case 'unification':
            return `Unable to unify the following types:\nFirst type: ${nts(
                error.one,
            )}\nSecond type: ${nts(error.two)}`;
        case 'invalid type':
            return `Invalid type.\nExpected: ${nts(
                error.expected,
            )}\nFound: ${nts(error.found)}${
                error.path.length ? '\nPath: ' + error.path.join(' -> ') : ''
            }`;
    }
    return `Some error happened ${error.type} : ${JSON.stringify(
        error,
        null,
        2,
    )}`;
};
