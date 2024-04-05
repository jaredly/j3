import { NUIState } from './UIState';
import { calcCursorPos } from './Cursors';
import { Mods, StateSelect } from '../../src/state/getKeyUpdate';
import { closestSelection } from './closestSelection';

export const verticalMove = (
    state: NUIState,
    up: boolean,
    mods: Mods,
): StateSelect | void => {
    const sel = state.at[0];
    const current = calcCursorPos(sel.end ?? sel.start, state.regs);
    if (!current) {
        return;
    }
    const best = closestSelection(
        state.regs,
        {
            x: current.left,
            y:
                current.top +
                current.height / 2 -
                current.height * (up ? 1 : -1),
        },
        !up ? current.top + current.height + 5 : undefined,
        !up ? undefined : current.top - 5,
    );
    if (best) {
        if (mods.shift) {
            return {
                type: 'select',
                selection: sel.start,
                selectionEnd: best,
            };
        } else {
            return { type: 'select', selection: best };
        }
    }
};
