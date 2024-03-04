import { Ctx } from '../../src/to-ast/Ctx';
import { Map } from '../../src/types/mcst';
import { Path } from '../../src/state/path';
import { Action, UIState } from './UIState';

export type Reg = (
    node: HTMLSpanElement | null,
    idx: number,
    path: Path[],
    loc?: 'start' | 'end' | 'inside' | 'outside',
) => void;

export type RenderProps = {
    debug?: boolean;
    firstLineOnly?: boolean;
    idx: number;
    map: Map;
    hashNames: Ctx['hashNames'];
    selection: UIState['at'];
    reg: Reg;
    path: Path[];
    display: Ctx['display'];
    // TODO make this fancier, probably
    errors: { [loc: number]: string[] };
    dispatch: React.Dispatch<Action>;
};
