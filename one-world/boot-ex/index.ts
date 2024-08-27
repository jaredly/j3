import { parse } from './format';
import { kwds } from './kwds';
import { Evaluator } from './types';

export const BootExampleEvaluator: Evaluator<void, void, void> = {
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
    compile(top, info) {},
    evaluate(ir, irs) {},
    infer(top, infos) {},
    print(ir, irs) {
        return { code: '// printed', sourceMap: [] };
    },
};
