import { PathSel } from '../mods/navigate';
import { calcOffset } from './Render';
import { State, calcCursorPos } from './ByHand';

export const verticalMove = (state: State, up: boolean): State => {
    let best = null as null | { top: number; dx: number; sel: PathSel };
    const current = calcCursorPos(state.at.sel, state.regs);
    if (!current) {
        return state;
    }
    const hh = current.height / 2;
    Object.entries(state.regs).forEach(([key, nodes]) => {
        Object.entries(nodes).forEach(([which, value]) => {
            if (!value) {
                return;
            }
            const box = value.node.getBoundingClientRect();
            if (up) {
                if (box.top >= current.top - current.height / 2) {
                    return;
                }
            } else {
                if (box.top <= current.top + current.height / 2) {
                    return;
                }
            }
            const dx =
                current.left >= box.left && current.left <= box.right
                    ? 0
                    : Math.min(
                          Math.abs(current.left - box.left),
                          Math.abs(current.left - box.right),
                      );

            if (
                !best ||
                (up
                    ? box.top >= best.top - hh && dx <= best.dx
                    : box.top <= best.top + hh && dx <= best.dx)
            ) {
                const ps: PathSel = {
                    path:
                        which === 'main'
                            ? value.path
                            : value.path.concat({
                                  idx: +key,
                                  child: { type: which as 'end' },
                              }),
                    sel: {
                        idx: +key,
                        loc:
                            which === 'main'
                                ? calcOffset(value.node, current.left)
                                : (which as 'end'),
                    },
                };
                best = { top: box.top, dx: dx, sel: ps };
            }
        });
    });
    if (best) {
        return { ...state, at: best.sel };
    }
    return state;
};
