import { Id, Text } from '../shared/cnodes';
import { shape } from '../shared/shape';
import { TestState } from './test-utils';
import { lastChild, Update } from './utils';
import { validate } from './validate';
import { root } from './root';

export function applyUpdate(state: TestState, update: Update | void) {
    if (!update) return state;
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
            const node = state.top.nodes[loc] as Id<number>;
            state.top.nodes[loc] = {
                ...node,
                text: prev.start.cursor.text.join(''),
                ccls: prev.start.cursor.text.length === 0 ? undefined : node.ccls,
            };
        }
    }

    // This is "maybe commit text changes"
    if (
        prev.start.cursor.type === 'text' &&
        prev.start.cursor.end.text != null &&
        update.selection &&
        (update.selection.start.key !== prev.start.key ||
            update.selection.start.cursor.type !== 'text' ||
            update.selection.start.cursor.end.index !== prev.start.cursor.end.index)
    ) {
        const { end } = prev.start.cursor;
        const loc = lastChild(prev.start.path);
        if (!update.nodes[loc]) {
            const node = state.top.nodes[loc] as Text<number>;
            const spans = node.spans.slice();
            const span = spans[end.index];
            if (span.type === 'text') {
                spans[end.index] = { ...span, text: end.text!.join('') };
                state.top.nodes[loc] = {
                    ...node,
                    spans,
                };
            }
        }
    }

    try {
        validate(state);
    } catch (err) {
        console.log(JSON.stringify(state, null, 2));
        console.log(shape(root(state)));
        throw err;
    }
    return state;
}
