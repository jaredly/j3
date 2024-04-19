import { Node } from '../../../src/types/cst';
import { findTops } from '../../ide/ground-up/findTops';

type Tops = ReturnType<typeof findTops>;
export type LocedName = {
    name: string;
    loc: number;
    kind: 'type' | 'value' | 'tcls';
};
export type SortedInfo<Stmt> = {
    id: number;
    top: Tops[0];
    node: Node;
    stmt: void | null | Stmt;
    names: LocedName[];
    deps: LocedName[];
};
