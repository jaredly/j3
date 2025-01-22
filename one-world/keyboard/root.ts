import { fromMap } from '../shared/cnodes';
import { lastChild, NodeSelection, Top } from './utils';

export const root = <T>(state: { top: Top; sel?: NodeSelection }, fromId: (n: number) => T = (x) => x as T) => {
    let nodes = state.top.nodes;
    // Object.keys(state.top.tmpText)
    // if (state.sel) {
    //     const { cursor, path } = state.sel.start;
    //     // if (cursor.type === 'id' && cursor.text) {
    //     //     const loc = lastChild(path);
    //     //     const node = nodes[loc];
    //     //     if (node.type === 'id') {
    //     //         nodes = {
    //     //             ...nodes,
    //     //             [loc]: {
    //     //                 ...node,
    //     //                 text: cursor.text.join(''),
    //     //                 ccls: cursor.text.length === 0 ? undefined : node.ccls,
    //     //             },
    //     //         };
    //     //     }
    //     // }
    //     // if (cursor.type === 'text' && cursor.end.text) {
    //     //     const loc = lastChild(path);
    //     //     const node = nodes[loc];
    //     //     if (node.type === 'text') {
    //     //         const spans = node.spans.slice();
    //     //         const span = spans[cursor.end.index];
    //     //         if (span.type === 'text') {
    //     //             spans[cursor.end.index] = { ...span, text: cursor.end.text.join('') };
    //     //         }
    //     //         nodes = { ...nodes, [loc]: { ...node, spans } };
    //     //     }
    //     // }
    // }

    // const tmpText = { ...state.top.tmpText };
    // let up = false;
    // Object.keys(tmpText).forEach((key) => {
    //     if (!up) {
    //         up = true;
    //         state.top = { ...state.top, tmpText: { ...tmpText } };
    //         nodes = { ...state.top.nodes };
    //     }
    //     if (key.includes(':')) {
    //         const [loc, idx] = key.split(':');
    //         const node = nodes[+loc];
    //         if (node.type === 'text') {
    //             const spans = node.spans.slice();
    //             const span = spans[+idx];
    //             if (span.type !== 'text') {
    //                 throw new Error(`not a text span`);
    //             }
    //             spans[+idx] = { ...span, text: tmpText[key].join('') };
    //             nodes[+loc] = { ...node, spans };
    //         }
    //     } else {
    //         const node = nodes[+key];
    //         if (node.type === 'id') {
    //             nodes[+key] = { ...node, text: tmpText[key].join(''), ccls: tmpText[key].length === 0 ? undefined : node.ccls };
    //         }
    //     }
    // });

    return fromMap(state.top.root, nodes, fromId);
};
