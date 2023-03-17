import { splitGraphemes } from '../../src/parse/parse';

export const calcOffset = (node: HTMLSpanElement, x: number) => {
    if (!node.firstChild) {
        return 0;
    }
    let range = new Range();
    const graphemes = splitGraphemes(node.textContent!);
    let offset = 0;
    let prevPos = null;
    const box = node.getBoundingClientRect();
    if (x <= box.left) {
        return 0;
    }
    if (x >= box.right) {
        return graphemes.length;
    }
    for (let i = 0; i < graphemes.length; i++) {
        range.setStart(node.firstChild, offset);
        range.setEnd(node.firstChild, offset);
        let dx = range.getBoundingClientRect().left - x;
        if (Math.abs(dx) < 3) {
            return i;
        }
        if (prevPos && prevPos < 0 && dx > 0) {
            return Math.abs(prevPos) < Math.abs(dx) ? i - 1 : i;
        }
        prevPos = dx;
        offset += graphemes[i].length;
    }
    return graphemes.length;
};

// export const clickPunct = (
//     isLeft: boolean,
//     idx: number,
//     i: number,
//     onodes: ONode[],
//     path: Path[],
//     state: UIState,
//     dispatch: React.Dispatch<Action>,
// ) => {
//     if (isLeft) {
//         for (let j = i; j >= 0; j--) {
//             const prev = onodes[j];
//             const ps = pathSelForNode(prev, idx, 'end', state.map);
//             if (ps) {
//                 console.log(ps);
//                 dispatch({
//                     type: 'select',
//                     at: [
//                         {
//                             sel: ps.sel,
//                             path: path.concat(ps.path),
//                         },
//                     ],
//                 });
//                 return;
//             }
//         }
//     } else {
//         for (let j = i + 1; j < onodes.length; j++) {
//             const prev = onodes[j];
//             const ps = pathSelForNode(prev, idx, 'start', state.map);
//             if (ps) {
//                 console.log(ps);
//                 dispatch({
//                     type: 'select',
//                     at: [
//                         {
//                             sel: ps.sel,
//                             path: path.concat(ps.path),
//                         },
//                     ],
//                 });
//                 return;
//             }
//         }
//     }
// };
