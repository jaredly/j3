import {
    Expr,
    Type,
    addInst,
    addPreludeClasses,
    apply,
    fn,
    initialEnv,
    kf,
    star,
    builtins as tbuiltins,
    tiProgram,
} from './types';

export { parse } from './parse';
export { type Type as typ, printType as typToString } from './types';
export const builtins = {};
export let trace: any[] = [];
export const getTrace = () => {
    const res = trace;
    trace = [];
    return res;
};
export const infer = (builtins: any, expr: Expr, display: any): Type => {
    trace.push(expr);

    let env = addPreludeClasses(initialEnv);
    // env = addInst([], { type: 'IsIn', id: 'Integral', t: tbuiltins.int })(env);
    env = addInst([], { type: 'IsIn', id: 'Num', t: tbuiltins.int })(env);

    const assump = tiProgram(
        env,
        [
            {
                type: 'Assump',
                id: '+',
                scheme: {
                    type: 'Forall',
                    kinds: [{ type: 'Star' }],
                    qual: {
                        type: 'Qual',
                        context: [
                            {
                                type: 'IsIn',
                                id: 'Num',
                                t: { type: 'Gen', num: 0 },
                            },
                        ],
                        head: fn(
                            { type: 'Gen', num: 0 },
                            fn(
                                { type: 'Gen', num: 0 },
                                { type: 'Gen', num: 0 },
                            ),
                        ),
                    },
                },
            },
            {
                type: 'Assump',
                id: ',',
                scheme: {
                    type: 'Forall',
                    kinds: [{ type: 'Star' }, { type: 'Star' }],
                    qual: {
                        type: 'Qual',
                        context: [],
                        head: fn(
                            { type: 'Gen', num: 0 },
                            fn(
                                { type: 'Gen', num: 1 },
                                {
                                    type: 'App',
                                    fn: {
                                        type: 'App',
                                        fn: {
                                            type: 'Con',
                                            con: {
                                                type: 'TC',
                                                id: ',',
                                                k: kf(star, kf(star, star)),
                                            },
                                        },
                                        arg: { type: 'Gen', num: 0 },
                                    },
                                    arg: { type: 'Gen', num: 1 },
                                },
                            ),
                        ),
                    },
                },
            },
        ],
        [[[], [[['result', [[[], expr]]]]]]],
    );
    trace.push(assump);

    console.log(assump);
    // apply(assump[0].scheme.qual.context, assump[0].scheme.qual.head);
    return assump[0].scheme.qual.head;
};
