import { Exp, fn } from './types';
import { typeInference } from './infer';
export { type Type as typ } from './types';
export { typToString } from './typToString';
export { parse } from './parse';
export const builtins = {};

export const getTrace = () => [];
export const infer = (builtins: any, expr: Exp, what: any) => {
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
