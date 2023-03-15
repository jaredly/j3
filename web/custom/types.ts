import { Ctx } from '../../src/to-ast/Ctx';
import { MNode } from '../../src/types/mcst';
import { rainbow } from '../old/Nodes';
import { getNodes } from '../overheat/getNodes';
import { ONodeOld } from '../overheat/types';
import { Path, Selection } from '../store';
import { Action, State } from './ByHand';
import { RenderONode } from './RenderONode';

export type Reg = (
    node: HTMLSpanElement | null,
    idx: number,
    path: Path[],
    loc?: 'start' | 'end' | 'inside',
) => void;

export type RenderProps = {
    idx: number;
    state: State;
    reg: Reg;
    path: Path[];
    display: Ctx['display'];
    dispatch: React.Dispatch<Action>;
};
