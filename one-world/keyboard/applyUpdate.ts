import { Id } from '../shared/cnodes';
import { Update, lastChild } from './lisp';
import { TestState } from './test-utils';

export function applyUpdate(state: TestState, update: Update) {
    const prev = state.sel;
    state = {
        sel: update.selection ?? state.sel,
        top: {
            nextLoc: update.nextLoc ?? state.top.nextLoc,
            nodes: { ...state.top.nodes, ...update.nodes },
            root: update.root ?? state.top.root,
        },
    };

    // This is "maybe commit text changes"
    if (prev.start.cursor.type === 'id' && prev.start.cursor.text != null && update.selection && update.selection.start.key !== prev.start.key) {
        const loc = lastChild(prev.start.path);
        if (!update.nodes[loc]) {
            state.top.nodes[loc] = {
                ...(state.top.nodes[loc] as Id<number>),
                text: prev.start.cursor.text.join(''),
            };
        }
    }
    return state;
}
