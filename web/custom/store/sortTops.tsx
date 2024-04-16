import { NUIState } from '../UIState';
import { fromMCST } from '../../../src/types/mcst';
import { findTops } from '../../ide/ground-up/findTops';
import { FullEvalator } from '../../ide/ground-up/FullEvalator';
import { layout } from '../../../src/layout';
import { NUIResults } from './Store';
import { filterNulls } from '../old-stuff/reduce';
import { depSort } from './depSort';
import { Node } from '../../../src/types/cst';

type Tops = ReturnType<typeof findTops>;
export type LocedName = { name: string; loc: number; kind: 'type' | 'value' };
export type SortedInfo<Stmt> = {
    id: number;
    top: Tops[0];
    node: Node;
    stmt: void | null | Stmt;
    names: LocedName[];
    deps: LocedName[];
};
