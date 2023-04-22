import { Ctx } from '../../src/to-ast/Ctx';
import { Map } from '../../src/types/mcst';
import { Path } from '../mods/path';
import { Action, UIState } from './UIState';

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
    hashNames: Ctx['hashNames'];
    selection: UIState['at'];
    reg: Reg;
    path: Path[];
    display: Ctx['display'];
    errors: Ctx['errors'];
    dispatch: React.Dispatch<Action>;
};
