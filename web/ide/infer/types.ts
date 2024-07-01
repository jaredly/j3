// import { Display } from '../../../src/to-ast/library';
// import { Node } from '../../../src/types/cst';
// import { Ctx } from './algw-cr/parse';

// export type Tree = { name: string; loc: number; children: Tree[] };

// export type TraceKind =
//     | 'infer:start'
//     | 'infer:end'
//     | 'tvar:new'
//     | 'misc'
//     | 'type:free'
//     | 'type:partial'
//     | 'type:fixed';

// export type Trace = {
//     locs: number[];
//     kind: TraceKind;
//     text: string;
//     state?: any;
// };

// export type Algo<E, T, B> = {
//     builtins: B;
//     parse: (node: Node, ctx: Ctx) => E | undefined;
//     infer: (
//         builtins: B,
//         term: E,
//         ctx: { display: Display; typs: { [key: string]: any } },
//     ) => T;
//     typToString: (t: T) => string;
//     getTrace: () => Trace[];
//     toTree?: (expr: E) => Tree;
// };

// export const algos: { [name: string]: Algo<any, any, any> } = {};
export const register = <E, T, B>(name: string, algo: any) => {
    // algos[name] = algo as Algo<any, any, any>;
};
