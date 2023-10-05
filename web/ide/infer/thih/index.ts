import {
    Assump,
    Expr,
    Scheme,
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
export { type Scheme as typ, printScheme as typToString } from './types';
export const builtins: Assump[] = [
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
                    fn({ type: 'Gen', num: 0 }, { type: 'Gen', num: 0 }),
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
];
export let trace: any[] = [];
export const getTrace = () => {
    const res = trace;
    trace = [];
    return res;
};
export const infer = (builtins: Assump[], expr: Expr, display: any): Scheme => {
    trace.push(expr);

    if (expr.type === 'Var') {
        const defn = builtins.find((b) => b.id === expr.id);
        if (defn) {
            return defn.scheme; //.scheme//.qual.head;
        }
    }

    let env = addPreludeClasses(initialEnv);
    // env = addInst([], { type: 'IsIn', id: 'Integral', t: tbuiltins.int })(env);
    env = addInst([], { type: 'IsIn', id: 'Num', t: tbuiltins.int })(env);
    env = addInst([], { type: 'IsIn', id: 'Floating', t: tbuiltins.double })(
        env,
    );

    const assump = tiProgram(env, builtins, [
        [[], [[['result', [[[], expr]]]]]],
    ]);
    trace.push(assump);

    console.log(assump);
    // apply(assump[0].scheme.qual.context, assump[0].scheme.qual.head);
    return assump[0].scheme; //.scheme.qual.head;
};
