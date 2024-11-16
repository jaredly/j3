import { fromMap } from '../shared/cnodes';
import { TestState } from './test-utils';
import { lastChild } from './utils';

export const root = (state: TestState) => {
    let nodes = state.top.nodes;
    if (state.sel.start.cursor.type === 'id' && state.sel.start.cursor.text) {
        const loc = lastChild(state.sel.start.path);
        const node = nodes[loc];
        if (node.type === 'id') {
            nodes = {
                ...nodes,
                [loc]: {
                    ...node,
                    text: state.sel.start.cursor.text.join(''),
                    punct: state.sel.start.cursor.text.length === 0 ? undefined : node.punct,
                },
            };
        }
    }
    return fromMap(state.top.root, nodes, () => 0);
};
