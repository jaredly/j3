import { Assump, Expr } from './types';
import { term, parse as hmxparse } from '../hmx/hmx';
import { Node } from '../../../../src/types/cst';
import { Display } from '../../../../src/to-ast/library';
import { Ctx } from '../algw-cr/parse';
import { trace } from '.';

export const parse = (node: Node, ctx: Ctx): Expr | undefined => {
    const res = hmxparse(node, ctx);
    return res ? _parse(res, ctx) : res;
};

const BoolA: Assump = {
    type: 'Assump',
    id: 'Bool',
    scheme: {
        type: 'Forall',
        kinds: [],
        qual: {
            type: 'Qual',
            context: [],
            head: {
                type: 'Con',
                con: {
                    type: 'TC',
                    id: 'Bool',
                    k: { type: 'Star' },
                },
            },
        },
    },
};

const _parse = (node: term, ctx: Ctx): Expr | undefined => {
    switch (node.type) {
        case 'abs': {
            const body = _parse(node.body, ctx);
            return body
                ? {
                      type: 'Abs',
                      pats: [
                          {
                              type: 'Var',
                              id: node.name,
                          },
                      ],
                      body,
                      loc: node.loc,
                  }
                : undefined;
        }
        case 'let': {
            const init = _parse(node.init, ctx);
            const body = _parse(node.body, ctx);
            return init && body
                ? {
                      type: 'Let',
                      body,
                      loc: node.loc,
                      group: [[], [[[node.name, [[[], init]]]]]],
                  }
                : undefined;
        }
        case 'var': {
            return { type: 'Var', id: node.name, loc: node.loc };
        }
        case 'const': {
            switch (node.value.type) {
                case 'bool':
                    return {
                        type: 'Const',
                        loc: node.loc,
                        assump: BoolA,
                    };
                case 'number':
                    return {
                        type: 'Lit',
                        loc: node.loc,
                        lit: {
                            type:
                                Math.floor(node.value.value) ===
                                node.value.value
                                    ? 'Int'
                                    : 'Float',
                            value: node.value.value,
                        },
                    };
                case 'string':
                    return {
                        type: 'Lit',
                        loc: node.loc,
                        lit: {
                            type: 'Str',
                            value: node.value.value,
                        },
                    };
            }
        }
        case 'app': {
            const fn = _parse(node.fn, ctx);
            const arg = _parse(node.arg, ctx);
            return fn && arg
                ? { type: 'Ap', fn, arg, loc: node.loc }
                : undefined;
        }
        case 'if': {
            const cond = _parse(node.cond, ctx);
            const yes = _parse(node.yes, ctx);
            const no = _parse(node.no, ctx);
            return cond && yes && no
                ? [cond, yes, no].reduce(
                      (fn, arg): Expr => ({
                          type: 'Ap',
                          fn,
                          arg,
                          loc: node.loc,
                      }),
                      { type: 'Var', id: 'if', loc: node.loc },
                  )
                : undefined;
        }
    }
    trace.push(`type ${node.type}`);
};
