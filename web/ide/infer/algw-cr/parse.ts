import { Exp, Prim } from './types';
import { term, parse as hmxparse } from '../hmx/hmx';
import { Node } from '../../../../src/types/cst';

export const parse = (
    node: Node,
    errors: { [key: number]: string },
): Exp | undefined => {
    const res = hmxparse(node, errors);
    return res ? _parse(res, errors) : res;
};

const p = (prim: Prim): Exp => ({ type: 'Prim', prim });

const _parse = (
    node: term,
    errors: { [key: number]: string },
): Exp | undefined => {
    switch (node.type) {
        case 'var':
            if (node.name.match(/^[A-Z]/)) {
                return {
                    type: 'Prim',
                    prim: {
                        type: 'VariantInject',
                        name: node.name,
                    },
                };
                // return {
                //     type: 'App',
                //     fn: {
                //         type: 'Prim',
                //         prim: {
                //             type: 'VariantInject',
                //             name: node.name,
                //         },
                //     },
                //     arg: { type: 'Prim', prim: { type: 'RecordEmpty' } },
                // };
            }
            return { type: 'Var', name: node.name };
        case 'accessor':
            return {
                type: 'Prim',
                prim: {
                    type: 'RecordSelect',
                    name: node.id,
                },
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
                      } as const)
                    : _parse(node.fn, errors);
            const arg = _parse(node.arg, errors);
            return fn && arg ? { type: 'App', fn, arg } : undefined;
        }
        case 'let': {
            const init = _parse(node.init, errors);
            const body = _parse(node.body, errors);
            return init && body
                ? { type: 'Let', name: node.name, init, body }
                : undefined;
        }
        case 'abs': {
            const body = _parse(node.body, errors);
            return body ? { type: 'Abs', name: node.name, body } : undefined;
        }
        case 'const':
            switch (node.value.type) {
                case 'bool':
                    return p({ type: 'Bool', value: node.value.value });
                case 'number':
                    return p({ type: 'Int', value: node.value.value });
            }
            errors[node.loc] = 'bad const';
            return undefined;
        case 'record': {
            let res: Exp = p({ type: 'RecordEmpty' });
            node.items
                .slice()
                .reverse()
                .forEach((item) => {
                    res = {
                        type: 'App',
                        fn: {
                            type: 'App',
                            fn: p({ type: 'RecordExtend', name: item.name }),
                            arg: _parse(item.value, errors) ?? {
                                type: 'Prim',
                                prim: { type: 'Bool', value: false },
                            },
                        },
                        arg: res,
                    };
                });
            return res;
        }
    }
};
