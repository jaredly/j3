import { Pattern, Type } from '../types/ast';

export const patternType = (pattern: Pattern): Type => {
    switch (pattern.type) {
        case 'number':
        case 'bool':
            return pattern;
        case 'local':
            return { type: 'any', form: pattern.form };
        case 'tag':
            return {
                type: 'tag',
                name: pattern.name,
                args: pattern.args.map(patternType),
                form: pattern.form,
            };
        case 'unresolved':
            return pattern;
        case 'record':
            return {
                type: 'record',
                form: pattern.form,
                open: true,
                spreads: [],
                entries: pattern.entries.map((entry) => ({
                    name: entry.name,
                    value: patternType(entry.value),
                })),
            };
    }
};
