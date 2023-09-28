import { Node } from '../../../src/types/cst';

export type Algo<E, T, B> = {
    builtins: B;
    parse: (node: Node) => E;
    infer: (builtins: B, term: E) => T;
    typToString: (t: T) => string;
};
