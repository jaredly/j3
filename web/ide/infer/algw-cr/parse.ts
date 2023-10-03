import { Exp, Prim } from './types';
import { term, parse as hmxparse } from '../hmx/hmx';
import { Node } from '../../../../src/types/cst';
import { Display } from '../../../../src/to-ast/library';

export const parse = (node: Node, ctx: Ctx): Exp | undefined => {
    const res = hmxparse(node, ctx);
    return res ? _parse(res, ctx) : res;
};

const p = (prim: Prim, loc: number): Exp => ({ type: 'Prim', prim, loc });

export type Ctx = { errors: { [key: number]: string }; display: Display };

const _parse = (node: term, ctx: Ctx): Exp | undefined => {
    switch (node.type) {
        case 'if': {
            const cond = _parse(node.cond, ctx);
            const yes = _parse(node.yes, ctx);
            const no = _parse(node.no, ctx);
            return cond && yes && no
                ? {
                      type: 'App',
                      fn: {
                          type: 'App',
                          fn: {
                              type: 'App',
                              fn: {
                                  type: 'Prim',
                                  prim: { type: 'Cond' },
                                  loc: node.loc,
                              },
                              loc: node.loc,
                              arg: cond,
                          },
                          arg: yes,
                          loc: node.loc,
                      },
                      arg: no,
                      loc: node.loc,
                  }
                : undefined;
        }
        case 'var':
            if (node.name.match(/^[A-Z]/)) {
                // return {
                //     type: 'Prim',
                //     prim: {
                //         type: 'VariantInject',
                //         name: node.name,
                //     },
                // };
                return {
                    type: 'App',
                    fn: {
                        type: 'Prim',
                        prim: {
                            type: 'VariantInject',
                            name: node.name,
                        },
                        loc: node.loc,
                    },
                    arg: {
                        type: 'Prim',
                        prim: { type: 'RecordEmpty' },
                        loc: node.loc,
                    },
                    loc: node.loc,
                };
            }
            return { type: 'Var', name: node.name, loc: node.loc };
        case 'accessor':
            return {
                type: 'Prim',
                prim: {
                    type: 'RecordSelect',
                    name: node.id,
                },
                loc: node.loc,
            };
        case 'app': {
            const fn =
                node.fn.type === 'var' && node.fn.name.match(/^[A-Z]/)
                    ? ({
                          type: 'Prim',
                          prim: {
                              type: 'VariantInject',
                              name: node.fn.name,
                          },
                          loc: node.loc,
                      } as const)
                    : _parse(node.fn, ctx);
            const arg = _parse(node.arg, ctx);
            return fn && arg
                ? { type: 'App', fn, arg, loc: node.loc }
                : undefined;
        }
        case 'let': {
            const init = _parse(node.init, ctx);
            const body = _parse(node.body, ctx);
            return init && body
                ? {
                      type: 'Let',
                      name: node.name,
                      init,
                      body,
                      loc: node.loc,
                      nameloc: node.nameloc,
                  }
                : undefined;
        }
        case 'abs': {
            const body = _parse(node.body, ctx);
            return body
                ? {
                      type: 'Abs',
                      name: node.name,
                      body,
                      loc: node.loc,
                      nameloc: node.nameloc,
                  }
                : undefined;
        }
        case 'const':
            switch (node.value.type) {
                case 'bool':
                    return p(
                        { type: 'Bool', value: node.value.value },
                        node.loc,
                    );
                case 'number':
                    return p(
                        { type: 'Int', value: node.value.value },
                        node.loc,
                    );
            }
            ctx.errors[node.loc] = 'bad const';
            return undefined;
        case 'record': {
            let res: Exp = p({ type: 'RecordEmpty' }, node.loc);
            node.items
                .slice()
                .reverse()
                .forEach((item) => {
                    res = {
                        type: 'App',
                        fn: {
                            type: 'App',
                            fn: p(
                                { type: 'RecordExtend', name: item.name },
                                node.loc,
                            ),
                            arg: _parse(item.value, ctx) ?? {
                                type: 'Prim',
                                prim: { type: 'Bool', value: false },
                                loc: node.loc,
                            },
                            loc: node.loc,
                        },
                        arg: res,
                        loc: node.loc,
                    };
                });
            return res;
        }
    }
};
