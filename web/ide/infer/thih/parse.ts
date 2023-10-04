import { Expr } from './types';
import { term, parse as hmxparse } from '../hmx/hmx';
import { Node } from '../../../../src/types/cst';
import { Display } from '../../../../src/to-ast/library';
import { Ctx } from '../algw-cr/parse';

export const parse = (node: Node, ctx: Ctx): Expr | undefined => {
    const res = hmxparse(node, ctx);
    return res ? _parse(res, ctx) : res;
};

const _parse = (node: term, ctx: Ctx): Expr | undefined => {
    switch (node.type) {
        case 'var': {
            return { type: 'Var', id: node.name, loc: node.loc };
        }
        case 'app': {
            const fn = _parse(node.fn, ctx);
            const arg = _parse(node.arg, ctx);
            return fn && arg
                ? { type: 'Ap', fn, arg, loc: node.loc }
                : undefined;
        }
    }
};
