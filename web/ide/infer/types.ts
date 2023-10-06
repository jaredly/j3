import { Display } from '../../../src/to-ast/library';
import { Node } from '../../../src/types/cst';
import { Ctx } from './algw-cr/parse';

export type Algo<E, T, B> = {
    builtins: B;
    parse: (node: Node, ctx: Ctx) => E | undefined;
    infer: (
        builtins: B,
        term: E,
        ctx: { display: Display; typs: { [key: string]: any } },
    ) => T;
    typToString: (t: T) => string;
    getTrace: () => any[];
};

export const algos: { [name: string]: Algo<any, any, any> } = {};
export const register = <E, T, B>(name: string, algo: Algo<E, T, B>) => {
    algos[name] = algo as Algo<any, any, any>;
};
