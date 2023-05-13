import { blank } from '../to-ast/Ctx';
import { CompilationResults, Ctx } from '../to-ast/library';
import { nodeForType } from '../to-cst/nodeForType';
import { nodeToString } from '../to-cst/nodeToString';
import { Node, Type } from '../types/ast';
import { MatchError } from '../types/types';
import { applyAndResolve, expandEnumItems } from './applyAndResolve';
import { Report, errf, recordMap } from './get-types-new';
import { matchesTypeBetter } from './matchesTypeMap';

export type TypeArgs = { [idx: number]: Type[] };

export const matchesType = (
    candidate: Type,
    expected: Type,
    ctx: Ctx,
    form: Node,
    report?: Report,
    typeArgs?: TypeArgs,
): boolean => {
    const result = _matchOrExpand(candidate, expected, ctx, [], typeArgs);
    if (result !== true) {
        if (report) {
            let err = result;
            if (
                err.type !== 'invalid type' ||
                err.found !== candidate ||
                err.expected !== expected
            ) {
                err = {
                    type: 'invalid type',
                    form,
                    found: candidate,
                    expected,
                    path: [],
                    inner: err,
                };
            }
            errf(report, form, err);
        }
        return false;
    }
    return true;
};

export const inv = (
    candidate: Type,
    expected: Type,
    path: string[],
): MatchError => ({
    type: 'invalid type',
    expected,
    found: candidate,
    form: blank,
    path,
    // type: 'misc',
    // path,
    // form: blank,
    // message: 'um here we are' + new Error().stack,
});

export const isLoopy = (t: Type): boolean => {
    return (
        t.type === 'loop' ||
        t.type === 'recur' ||
        (t.type === 'apply' && isLoopy(t.target))
    );
};

export const _matchOrExpand = (
    candidate: Type,
    expected: Type,
    ctx: Ctx,
    path: string[],
    typeArgs?: TypeArgs,
): MatchError | true => {
    if (true) {
        return matchesTypeBetter(candidate, expected, {
            ctx,
            can: { path: [] },
            exp: { path: [] },
            typeArgs,
        });
    }
};

export const typeToString = (
    type: Type,
    hashNames: CompilationResults['hashNames'],
) => nodeToString(nodeForType(type, hashNames), hashNames);

export const _matchesType = (
    candidate: Type,
    expected: Type,
    ctx: Ctx,
    path: string[],
    typeArgs?: TypeArgs,
): MatchError | true => {
    throw new Error('nop');
};
