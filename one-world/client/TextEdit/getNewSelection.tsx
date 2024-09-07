import { splitGraphemes } from '../../../src/parse/splitGraphemes';

export type EditState = {
    text?: string[];
    sel: number;
    start?: number;
};

// const selectionPosition = (node: HTMLElement, x: number) => {
// }

export const realOffset = (
    range: Range,
    node: HTMLElement,
    pos: { x: number; y: number },
    off = 0,
): null | number => {
    for (let child of node.childNodes) {
        if (child.nodeName === '#text') {
            const graphemes = splitGraphemes(child.textContent!);
            let prevPos = null;
            let offset = 0;
            for (let i = 0; i <= graphemes.length; i++) {
                range.setStart(child, 0);
                range.setEnd(child, offset);
                const rb = range.getBoundingClientRect();
                if (pos.y > rb.bottom || pos.y < rb.top) {
                    if (i < graphemes.length) {
                        offset += graphemes[i].length;
                    }
                    continue;
                }
                if (rb.right > pos.x) {
                    if (prevPos) {
                        if (prevPos.dx < Math.abs(pos.x - rb.right)) {
                            return prevPos.off + off;
                        }
                    }
                    return offset + off;
                }
                prevPos = { dx: Math.abs(rb.right - pos.x), off: offset };
                if (i < graphemes.length) {
                    offset += graphemes[i].length;
                }
            }
            off += graphemes.length;
        } else {
            // the cursor element
            if ((child as HTMLElement).style.width === '0px') {
                continue;
            }
            const inner = realOffset(range, child as HTMLElement, pos, off);
            if (inner != null) {
                return inner;
            }
            off += splitGraphemes(child.textContent!).length;
        }
    }
    return null;
};

export function getNewSelection(
    state: EditState | null,
    node: HTMLSpanElement,
    pos: { x: number; y: number },
    shift: boolean,
    range: Range,
) {
    const sel = realOffset(range, node, pos);
    if (sel == null) return state ?? { sel: 0, start: 0 };
    return {
        sel,
        start: shift ? state?.start ?? state?.sel : undefined,
    };
}
