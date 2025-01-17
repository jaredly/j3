import { Id, Text } from '../shared/cnodes';
import { TestState } from './test-utils';
import { NodeSelection, Update, SelUpdate, lastChild } from './utils';

export function maybeCommitTextChanges<T extends TestState>(prev: NodeSelection, update: Update, state: T) {
    const selId = lastChild(state.sel.start.path);
    let up = false;
    Object.keys(state.top.tmpText).forEach((key) => {
        if (key.includes(':')) {
            const [loc, idx] = key.split(':');
            if (+loc !== selId) {
                const node = state.top.nodes[+loc];
                if (node.type === 'text') {
                    const spans = node.spans.slice();
                    const span = spans[+idx];
                    if (span.type !== 'text') {
                        throw new Error(`not a text span`);
                    }
                    spans[+idx] = { ...span, text: state.top.tmpText[key].join('') };
                    state.top.nodes[+loc] = { ...node, spans };
                    delete state.top.tmpText[key];
                }
            }
        } else {
            if (key !== selId + '') {
                if (!up) {
                    up = true;
                    state.top = { ...state.top, tmpText: { ...state.top.tmpText }, nodes: { ...state.top.nodes } };
                }

                const node = state.top.nodes[+key];
                if (node.type === 'id') {
                    state.top.nodes[+key] = {
                        ...node,
                        text: state.top.tmpText[key].join(''),
                        ccls: state.top.tmpText[key].length === 0 ? undefined : node.ccls,
                    };
                    delete state.top.tmpText[key];
                    // console.log('yooo');
                }
            }
        }
    });
}
