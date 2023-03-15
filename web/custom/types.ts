import { Ctx } from '../../src/to-ast/Ctx';
import { Map } from '../../src/types/mcst';
import { Path } from '../store';
import { Action, UIState } from './ByHand';

export type Reg = (
    node: HTMLSpanElement | null,
    idx: number,
    path: Path[],
    loc?: 'start' | 'end' | 'inside',
) => void;

export type RenderProps = {
    debug?: boolean;
    idx: number;
    map: Map;
    // state: UIState;
    reg: Reg;
    path: Path[];
    display: Ctx['display'];
    dispatch: React.Dispatch<Action>;
};
