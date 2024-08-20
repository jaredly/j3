import { parse } from './format';
import { kwds } from './kwds';
import { Evaluator } from './types';

export const BootExampleEvaluator: Evaluator<void, void> = {
    kwds: kwds,
    parse(node, cursor) {
        const res = parse(node);
        if (cursor) {
            return {
                ...res,
                autocomplete: {
                    kinds: ['kwd', 'value', 'kwd:toplevel'],
                    local: [],
                },
            };
        }
        return res;
    },
    asExpr(top) {
        return null;
    },
};
