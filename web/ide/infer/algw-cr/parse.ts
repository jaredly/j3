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
        case 'match': {
            const target = _parse(node.target, ctx);
            if (!target) return;

            // (VariantElim label)
            // (fn [target (fn [arg] ret) (fn [otherwise] ret)] ret)
            // ((((VariantElim label) target) (fn [arg] ret)) (fn [otherwise] ret))

            const elim = (
                label: string,
                target: Exp,
                arg: string | null,
                body: Exp,
                // otherName: string,
                // otherwise: Exp,
                loc: number,
            ): Exp => ({
                type: 'App',
                fn: {
                    type: 'App',
                    fn: {
                        type: 'Prim',
                        prim: { type: 'VariantElim', name: label },
                        loc,
                    },
                    arg: target,
                    loc,
                },
                arg: {
                    type: 'Abs',
                    name: arg ?? '_',
                    nameloc: loc,
                    loc,
                    body,
                },
                loc,
                // },
                // arg: {
                //     type: 'Abs',
                //     name: otherName,
                //     nameloc: loc,
                //     loc,
                //     body: otherwise,
                // },
                // loc,
            });

            const fns: Exp[] = [];
            for (let i = 0; i < node.cases.length; i++) {
                const kase = node.cases[i];
                const body = _parse(kase.body, ctx);
                if (!body) return;
                const t =
                    fns.length === 0
                        ? target
                        : ({
                              type: 'Var',
                              name: `:match:${fns.length}`,
                              loc: -1,
                          } as const);
                // not matching a variant
                if (kase.label.match(/^[^A-Z]/) && !kase.arg) {
                    fns.push({
                        type: 'App',
                        fn: {
                            type: 'Abs',
                            name: kase.label,
                            body,
                            loc: kase.loc,
                            nameloc: kase.loc,
                        },
                        arg: t,
                        loc: kase.loc,
                    });
                } else {
                    const el = elim(kase.label, t, kase.arg, body, kase.loc);
                    if (i === node.cases.length - 1) {
                        // last one!
                        fns.push({
                            type: 'App',
                            fn: el,
                            arg: {
                                type: 'Prim',
                                prim: { type: 'ConsumeEmptyVariant' },
                                loc: kase.loc,
                            },
                            loc: kase.loc,
                        });
                    } else {
                        fns.push(el);
                    }
                }
            }

            let last = fns.pop()!;
            while (fns.length) {
                const i = fns.length;
                last = {
                    type: 'App',
                    fn: fns.pop()!,
                    loc: -1,
                    arg: {
                        type: 'Abs',
                        name: `:match:${i}`,
                        loc: -1,
                        nameloc: -1,
                        body: last,
                    },
                };
            }
            return last;

            // let num = 0;
            // let last: Exp | null = null
            // for (let i=node.cases.length - 1; i >= 0; i--) {
            //     const kase = node.cases[i]
            //     if (kase.label.match(/^[A-Z]/)) {
            //         last =
            //     }
            // }

            // const body = _parse(node.body, ctx);
            // if (!body) return;
            // const oth = node.otherwise ? _parse(node.otherwise, ctx) : null
            // if (!oth && node.otherwise) return;
            // return body
            //     ? {
            //           type: 'App',
            //           fn: {
            //               type: 'App',
            //               fn: {
            //                   type: 'Prim',
            //                   prim: { type: 'VariantElim', name: node.name },
            //                   loc: node.loc,
            //               },
            //               arg: {
            //                   type: 'Abs',
            //                   name: node.argname ?? '_',
            //                   nameloc: node.loc,
            //                   loc: node.loc,
            //                   body: body,
            //               },
            //               loc: node.loc,
            //           },
            //           arg: oth ?,
            //           loc: node.loc,
            //       }
            //     : undefined;
        }
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
                case 'string':
                    return p(
                        { type: 'String', value: node.value.value },
                        node.loc,
                    );
            }
            ctx.errors[node.loc] = 'bad const';
            return undefined;
        case 'record': {
            let res: Exp = p({ type: 'RecordEmpty' }, node.loc);
            if (node.spreads.length === 1) {
                const spread = _parse(node.spreads[0], ctx);
                if (!spread) return;
                res = spread;
            } else if (node.spreads.length) {
                ctx.errors[node.loc] = `too many spreads`;
                return;
            }
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
