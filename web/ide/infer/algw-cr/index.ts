import { Exp, fn } from './types';
import { typeInference } from './infer';
import { Display } from '../../../../src/to-ast/library';
import { register } from '../types';
export { type Type as typ } from './types';
import { typToString } from './typToString';
import { parse } from './parse';
export const builtins = {};

export let trace: any[] = [];
export const getTrace = () => {
    const res = trace;
    trace = [];
    return res;
};
export const infer = (builtins: any, expr: Exp, display: Display) => {
    trace.push(expr);
    return typeInference(
        {
            '+': {
                type: 'Scheme',
                vbls: {},
                body: fn(
                    { type: 'Int', loc: -1 },
                    fn({ type: 'Int', loc: -1 }, { type: 'Int', loc: -1 }, -1),
                    -1,
                ),
            },
        },
        expr,
        {
            state: {
                subst: {},
                supply: 0,
            },
            display,
        },
    );
};

register('algw-cr', {
    builtins,
    infer,
    parse,
    typToString,
    getTrace,
});
