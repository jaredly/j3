import { EditState } from './Id';

export function getNewSelection(
    text: string[],
    state: EditState | null,
    // evt: React.MouseEvent<HTMLSpanElement, MouseEvent>,
    node: HTMLSpanElement,
    x: number,
    shift: boolean,
    range: Range,
) {
    let sel = text.length;

    if (state) {
        if (state.start != null && state.start !== state.sel) {
            const mid = node.firstElementChild!.nextElementSibling!;
            const box = mid.getBoundingClientRect();
            const [left, right] =
                state.start < state.sel
                    ? [state.start, state.sel]
                    : [state.sel, state.start];
            if (x < box.left) {
                sel = offsetInNode(
                    range,
                    node.firstChild!,
                    text.slice(0, left),
                    x,
                );
            } else if (x < box.right) {
                sel =
                    offsetInNode(
                        range,
                        mid.firstChild!,
                        text.slice(left, right),
                        x,
                    ) + left;
            } else {
                sel =
                    offsetInNode(range, node.lastChild!, text.slice(right), x) +
                    right;
            }
        } else {
            const one = node.firstChild!;
            const mid = node.firstElementChild!;
            const ob = mid.getBoundingClientRect();
            if (ob.right > x) {
                sel = offsetInNode(range, one, text.slice(0, sel), x);
            } else {
                sel =
                    offsetInNode(
                        range,
                        node.lastChild!,
                        text.slice(state.sel),
                        x,
                    ) + state.sel;
            }
        }
    } else {
        sel = offsetInNode(range, node.firstChild!, text, x);
    }
    return {
        sel,
        start: shift ? state?.start ?? state?.sel : undefined,
    };
}
const offsetInNode = (
    range: Range,
    node: ChildNode,
    text: string[],
    x: number,
) => {
    let offset = 0;
    for (let i = 0; i < text.length; i++) {
        range.setStart(node, offset);
        range.setEnd(node, offset);
        offset += text[i].length;
        const rb = range.getBoundingClientRect();
        // console.log(rb.left)
        if (Math.abs(rb.left - x) < 5 || rb.left > x) {
            return i;
        }
    }
    return text.length;
};
