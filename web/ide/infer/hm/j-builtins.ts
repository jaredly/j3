import { Env as JEnv, infer, polytype, typ, typToString } from './j';

export const fn = (args: typ[], ret: typ): typ => ({
    type: 'fn',
    args,
    ret,
    loc: -1,
});
export const num: typ = { type: 'lit', name: 'number', loc: -1 };
export const pt = (typ: typ): polytype => ({ typevars: [], typ });

export const builtins: JEnv = {
    '+': pt(fn([num, num], num)),
    '*': pt(fn([num, num], num)),
    sqrt: pt(fn([num], num)),
};
