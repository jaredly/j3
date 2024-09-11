import { parse } from './format';
import { kwds } from './kwds';
import { Evaluator } from './types';

export const BootExampleEvaluator: Evaluator<void, void, void> = {
    kwds,
    parse(node, cursor) {
        return parse(node, cursor);
    },
    macrosToExpand(node) {
        return [];
    },
    compile(top, info) {
        return { named: {} };
    },
    evaluate(ir, irs) {},
    infer(top, infos) {},
    print(ir, irs) {
        return { code: '// printed', sourceMap: [] };
    },
};
