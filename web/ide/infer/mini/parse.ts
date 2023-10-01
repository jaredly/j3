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
        case 'record': {
            let res: expression = { type: 'RecordEmpty', pos: node.loc };
            if (!node.items.length) {
                return res;
            }
            const rows = node.items.map((row) => ({
                name: row.name,
                expr: _parse(row.value, errors)!,
            }));
            if (rows.some((r) => !r.expr)) {
                return;
            }
            return { type: 'RecordExtend', expr: res, pos: node.loc, rows };
        }
        case 'const': {
            if (node.value.type === 'number') {
                return {
                    type: 'PrimApp',
                    prim: { type: 'PIntegerConstant', value: node.value.value },
                    pos: node.loc,
                    expr: [],
                };
            }
            if (node.value.type === 'string') {
                return {
                    type: 'PrimApp',
                    prim: { type: 'PCharConstant', value: node.value.value },
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
        case 'accessor': {
            return {
                type: 'Lambda',
                pat: { type: 'PVar', name: 'x', pos: node.loc },
                expr: {
                    type: 'RecordAccess',
                    expr: {
                        type: 'Var',
                        name: 'x',
                        pos: node.loc,
                    },

                    name: node.id,
                    pos: node.loc,
                },
                pos: node.loc,
            };
        }
        case 'app': {
            const arg = _parse(node.arg, errors);
            if (node.fn.type === 'accessor') {
                return arg
                    ? {
                          type: 'RecordAccess',
                          name: node.fn.id,
                          expr: arg,
                          pos: node.loc,
                      }
                    : undefined;
            }
            const fn = _parse(node.fn, errors);
            return fn && arg
                ? { type: 'App', fn, arg, pos: node.loc }
                : undefined;
        }
    }
};
