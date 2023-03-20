import { calcOffset } from './calcOffset';
import { UIState } from './ByHand';
import { calcCursorPos } from './Cursors';
import { Mods } from '../mods/getKeyUpdate';
import { cmpFullPath } from './isCoveredBySelection';
import { Path } from '../mods/path';

export const verticalMove = (
    state: UIState,
    up: boolean,
    mods: Mods,
): UIState => {
    const sel = state.at[0];
    const current = calcCursorPos(sel.end ?? sel.start, state.regs);
    console.log('vert', current, sel);
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
    return best
        ? {
              ...state,
              at: [
                  mods.shift
                      ? { start: sel.start, end: best }
                      : { start: best },
              ],
          }
        : state;
};

export const closestSelection = (
    regs: UIState['regs'],
    pos: { x: number; y: number },
    minY?: number,
    maxY?: number,
): Path[] | undefined => {
    let best = null as null | {
        top: number;
        dx: number;
        dy: number;
        sel: Path[];
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

            const sel: Path[] =
                which === 'main'
                    ? value.path.concat({
                          idx: +key,
                          type: 'subtext',
                          at: calcOffset(value.node, pos.x),
                      } satisfies Path)
                    : value.path.concat({
                          idx: +key,
                          type: which as 'end',
                      });
            best = { top: box.top, dx, dy, sel };
        });
    });
    return best?.sel;
};
