import { Exp, fn } from './types';
import { typeInference } from './infer';
export { type Type as typ } from './types';
export { typToString } from './typToString';
export { parse } from './parse';
export const builtins = {};

export let trace: any[] = [];
export const getTrace = () => {
    const res = trace;
    trace = [];
    return res;
};
export const infer = (builtins: any, expr: Exp, what: any) => {
    trace.push(expr);
    return typeInference(
        {
            '+': {
                type: 'Scheme',
                vbls: {},
                body: fn({ type: 'Int' }, fn({ type: 'Int' }, { type: 'Int' })),
            },
        },
        expr,
        {
            state: {
                subst: {},
                supply: 0,
            },
        },
    );
};
