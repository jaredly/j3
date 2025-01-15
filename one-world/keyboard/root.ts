import { fromMap } from '../shared/cnodes';
import { lastChild, NodeSelection, Top } from './utils';

export const root = <T>(state: { top: Top; sel?: NodeSelection }, fromId: (n: number) => T = (x) => x as T) => {
    let nodes = state.top.nodes;
    // Object.keys(state.top.tmpText)
    if (state.sel) {
        const { cursor, path } = state.sel.start;
        if (cursor.type === 'id' && cursor.text) {
            const loc = lastChild(path);
            const node = nodes[loc];
            if (node.type === 'id') {
                nodes = {
                    ...nodes,
                    [loc]: {
                        ...node,
                        text: cursor.text.join(''),
                        ccls: cursor.text.length === 0 ? undefined : node.ccls,
                    },
                };
            }
        }
        if (cursor.type === 'text' && cursor.end.text) {
            const loc = lastChild(path);
            const node = nodes[loc];
            if (node.type === 'text') {
                const spans = node.spans.slice();
                const span = spans[cursor.end.index];
                if (span.type === 'text') {
                    spans[cursor.end.index] = { ...span, text: cursor.end.text.join('') };
                }
                nodes = { ...nodes, [loc]: { ...node, spans } };
            }
        }
    }

    let up = false;
    Object.keys(state.top.tmpText).forEach((key) => {
        if (!up) {
            up = true;
            state.top = { ...state.top, tmpText: { ...state.top.tmpText } };
            nodes = { ...state.top.nodes };
        }

        const node = nodes[+key];
        if (node.type === 'id') {
            nodes[+key] = { ...node, text: state.top.tmpText[key].join('') };
        }
        delete state.top.tmpText[key];
    });

    return fromMap(state.top.root, nodes, fromId);
};
