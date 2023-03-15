import { PathSel } from '../mods/navigate';
import { calcOffset } from './RenderONode';
import { State, calcCursorPos } from './ByHand';

export const verticalMove = (state: State, up: boolean): State => {
    const current = calcCursorPos(state.at.sel, state.regs);
    if (!current) {
        return state;
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
    return best ? { ...state, at: best } : state;
};

export const closestSelection = (
    regs: State['regs'],
    pos: { x: number; y: number },
    minY?: number,
    maxY?: number,
): PathSel | undefined => {
    let best = null as null | {
        top: number;
        dx: number;
        dy: number;
        sel: PathSel;
    };
    Object.entries(regs).forEach(([key, nodes]) => {
        Object.entries(nodes).forEach(([which, value]) => {
            if (!value) {
                return;
            }
            const box = value.node.getBoundingClientRect();
            const dy =
                box.top <= pos.y && pos.y <= box.bottom
                    ? 0
                    : Math.min(
                          Math.abs(box.top - pos.y),
                          Math.abs(box.bottom - pos.y),
                      );
            const dx =
                box.left <= pos.x && pos.x <= box.right
                    ? 0
                    : Math.min(
                          Math.abs(box.left - pos.x),
                          Math.abs(box.right - pos.x),
                      );

            if (minY != null && minY > box.bottom) {
                return;
            }
            if (maxY != null && maxY < box.top) {
                return;
            }

            if (best) {
                if (best.dy < dy) {
                    return;
                }
                if (best.dy === dy) {
                    if (best.dx < dx) {
                        return;
                    }
                }
            }

            const sel: PathSel = {
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
                            ? calcOffset(value.node, pos.x)
                            : (which as 'end'),
                },
            };
            best = { top: box.top, dx, dy, sel };
        });
    });
    return best?.sel;
};
