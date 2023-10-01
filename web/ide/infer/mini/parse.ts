import { expression } from './types';
import { term, parse as hmxparse } from '../hmx/hmx';
import { Node } from '../../../../src/types/cst';

export const parse = (
    node: Node,
    errors: { [key: number]: string },
): expression | undefined => {
    const res = hmxparse(node, errors);
    return res ? _parse(res, errors) : res;
};

const _parse = (
    node: term,
    errors: { [key: number]: string },
): expression | undefined => {
    switch (node.type) {
        case 'const': {
            if (node.value.type === 'number') {
                return {
                    type: 'PrimApp',
                    prim: { type: 'PIntegerConstant', value: node.value.value },
                    pos: node.loc,
                    expr: [],
                };
            }
            errors[node.loc] = 'sorry only int const';
            return;
        }
        case 'var':
            return { type: 'Var', name: node.name, pos: node.loc };
        case 'abs':
            const expr = _parse(node.body, errors);
            return expr
                ? {
                      type: 'Lambda',
                      pat: { type: 'PVar', name: node.name, pos: node.nameloc },
                      expr: expr,
                      pos: node.loc,
                  }
                : undefined;
    }
};
