import { expression } from './types';
import { term, parse as hmxparse } from '../hmx/hmx';
import { Node } from '../../../../src/types/cst';
import { Ctx } from '../algw-cr/parse';

export const parse = (node: Node, ctx: Ctx): expression | undefined => {
    const res = hmxparse(node, ctx);
    return res ? _parse(res, ctx.errors) : res;
};

const _parse = (
    node: term,
    errors: { [key: number]: string },
): expression | undefined => {
    switch (node.type) {
        case 'if': {
            const cond = _parse(node.cond, errors);
            const yes = _parse(node.yes, errors);
            const no = _parse(node.no, errors);
            return cond && yes && no
                ? {
                      type: 'If',
                      cond,
                      yes,
                      no,
                      pos: node.loc,
                  }
                : undefined;
        }
        case 'let': {
            const expr = _parse(node.body, errors);
            const init = _parse(node.init, errors);
            return expr && init
                ? {
                      type: 'Binding',
                      expr,
                      pos: node.loc,
                      binding: {
                          type: 'BindValue',
                          pos: node.loc,
                          defs: [
                              {
                                  pat: {
                                      type: 'PVar',
                                      name: node.name,
                                      pos: node.nameloc,
                                  },
                                  pos: node.nameloc,
                                  expr: init,
                              },
                          ],
                      },
                  }
                : undefined;
        }
        case 'record': {
            let res: expression = { type: 'RecordEmpty', pos: node.loc };
            if (!node.items.length) {
                return res;
            }
            if (node.spreads.length > 1) {
                errors[node.loc] = 'multiple spreads not supported atm';
                return;
            }
            if (node.spreads.length) {
                const spread = _parse(node.spreads[0], errors);
                if (!spread) return;
                res = spread;
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
            if (node.value.type === 'bool') {
                return {
                    type: 'PrimApp',
                    prim: { type: 'PBoolean', value: node.value.value },
                    pos: node.loc,
                    expr: [],
                };
            }
            errors[node.loc] = 'sorry only int const';
            return;
        }
        case 'var':
            if (node.name.match(/^[A-Z]/)) {
                return {
                    type: 'Variant',
                    pos: node.loc,
                    label: node.name,
                    arg: null,
                };
            }
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
            if (node.fn.type === 'var' && node.fn.name.match(/^[A-Z]/)) {
                return arg
                    ? {
                          type: 'Variant',
                          arg,
                          label: node.fn.name,
                          pos: node.loc,
                      }
                    : undefined;
            }
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
