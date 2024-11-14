import { Id } from '../shared/cnodes';
import { TestState } from './test-utils';
import { lastChild, Update } from './utils';
import { validate } from './validate';

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
    Object.keys(update.nodes).forEach((key) => {
        if (update.nodes[+key] === null) {
            delete state.top.nodes[+key];
        } else {
            state.top.nodes[+key] = update.nodes[+key]!;
        }
    });

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
    try {
        validate(state);
    } catch (err) {
        console.log(JSON.stringify(state, null, 2));
        throw err;
    }
    return state;
}
