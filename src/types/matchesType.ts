import { blank, Ctx } from '../to-ast/to-ast';
import { Node, Type } from './ast';
import { Error } from './types';
import { errf, Report } from './get-types-new';

export const matchesType = (
    candidate: Type,
    expected: Type,
    ctx: Ctx,
    form: Node,
    report?: Report,
): boolean => {
    const result = _matchesType(candidate, expected, ctx, []);
    if (result !== true) {
        if (report) {
            errf(report, form, result);
        }
        return false;
    }
    return true;
};

export const inv = (
    candidate: Type,
    expected: Type,
    path: string[],
): Error => ({
    type: 'invalid type',
    expected,
    found: candidate,
    form: blank,
    path,
});

export const _matchesType = (
    candidate: Type,
    expected: Type,
    ctx: Ctx,
    path: string[],
): Error | true => {
    // TODO: a @macro type? prolly
    switch (candidate.type) {
        case 'number': {
            if (expected.type === 'number') {
                return candidate.type === expected.type &&
                    candidate.value === expected.value
                    ? true
                    : inv(candidate, expected, path);
            } else if (expected.type === 'builtin') {
                return (
                    expected.name === candidate.kind ||
                    inv(candidate, expected, path)
                );
            }
            return inv(candidate, expected, path);
        }
        case 'bool': {
            if (expected.type === 'bool') {
                return (
                    candidate.value === expected.value ||
                    inv(candidate, expected, path)
                );
            } else if (expected.type === 'builtin') {
                return (
                    expected.name === 'bool' || inv(candidate, expected, path)
                );
            }
            return inv(candidate, expected, path);
        }
        case 'builtin':
            return (
                (expected.type === 'builtin' &&
                    candidate.name === expected.name) ||
                inv(candidate, expected, path)
            );
    }
    return inv(candidate, expected, path);
};
