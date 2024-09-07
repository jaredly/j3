import { Path } from '../../src/state/path';

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

    // From NUIState
    // map: Map;
    // selection: UIState['at'];
    // reg: Reg;

    path: Path[];

    // From "compilation"
    // hashNames: Ctx['hashNames'];
    // display: Ctx['display'];
    // TODO make this fancier, probably
    // errors: { [loc: number]: string[] };
    // dispatch: React.Dispatch<Action>;
};
