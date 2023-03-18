import { splitGraphemes } from '../../src/parse/parse';

export const realOffset = (
    node: HTMLElement,
    x: number,
    off = 0,
): null | number => {
    let range = new Range();
    for (let child of node.childNodes) {
        if (child.nodeName === '#text') {
            const graphemes = splitGraphemes(child.textContent!);
            let prevPos = null;
            let offset = 0;
            for (let i = 0; i < graphemes.length; i++) {
                range.setStart(child, offset);
                range.setEnd(child, offset);
                let dx = range.getBoundingClientRect().left - x;
                if (Math.abs(dx) < 2) {
                    return off + i;
                }
                if (prevPos != null && dx > 0) {
                    return off + (Math.abs(prevPos) < Math.abs(dx) ? i - 1 : i);
                }
                if (dx > 0) {
                    return off + i;
                }
                prevPos = dx;
                offset += graphemes[i].length;
            }
            off += graphemes.length;
        } else {
            const inner = realOffset(child as HTMLElement, x, off);
            if (inner != null) {
                return inner;
            }
            off += splitGraphemes(child.textContent!).length;
        }
    }
    return null;
};

export const calcOffset = (node: HTMLSpanElement, x: number) => {
    if (!node.firstChild) {
        return 0;
    }
    let offset = 0;
    let prevPos = null;
    const box = node.getBoundingClientRect();
    if (x <= box.left) {
        return 0;
    }

    const off = realOffset(node, x);
    if (off != null) {
        return off;
    }

    const graphemes = splitGraphemes(node.textContent!);
    return graphemes.length;
};
