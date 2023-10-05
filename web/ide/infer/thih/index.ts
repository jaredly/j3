import {
    Expr,
    Type,
    addInst,
    addPreludeClasses,
    apply,
    fn,
    initialEnv,
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
                    kinds: [],
                    qual: {
                        type: 'Qual',
                        context: [],
                        head: fn(
                            tbuiltins.int,
                            fn(tbuiltins.int, tbuiltins.int),
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
