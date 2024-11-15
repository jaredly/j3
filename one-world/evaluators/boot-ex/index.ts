import { parse } from './format';
import { kwds } from './kwds';
import { Evaluator } from './types';

export const BootExampleEvaluator: Evaluator<void, void, void> = {
    kwds,
    parse(node, cursor) {
        return parse(node, cursor);
    },
    combineMutuallyRecursive(tops) {},
    macrosToExpand(node) {
        return [];
    },
    compile(top, info) {
        return { byLoc: {} };
    },
    evaluate(ir, irs) {},
    infer(top, infos) {
        return { errors: [], typeForLoc: [], info: null };
    },
    print(ir, irs) {
        return { code: '// printed', sourceMap: [] };
    },
};
