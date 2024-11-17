import { fromMap } from '../shared/cnodes';
import { TestState } from './test-utils';
import { lastChild } from './utils';

export const root = (state: TestState) => {
    let nodes = state.top.nodes;
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
    return fromMap(state.top.root, nodes, () => 0);
};
