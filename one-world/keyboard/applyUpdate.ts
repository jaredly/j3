import { Id, Text } from '../shared/cnodes';
import { shape } from '../shared/shape';
import { TestState } from './test-utils';
import { lastChild, NodeSelection, Path, selStart, SelUpdate, Update } from './utils';
import { validate } from './validate';
import { root } from './root';
import { SelStart } from './handleShiftNav';
import { selUpdate } from './handleNav';
import { removeInPath } from './handleDelete';

export const applySel = (state: TestState, sel: SelStart | void) => applyUpdate(state, selUpdate(sel));

// const addParent = (path: Path, )

export const applySelUp = (sel: NodeSelection, up: SelUpdate): NodeSelection => {
    switch (up.type) {
        case 'move':
            return up.to;
        // case 'reparent':
        case 'unparent':
            return {
                start: selStart(removeInPath(sel.start.path, up.loc), sel.start.cursor),
                end: sel.end ? selStart(removeInPath(sel.end.path, up.loc), sel.end.cursor) : undefined,
            };
        // case 'addparent':
        // case 'unwrapList':
        // case 'delete':
        case 'id':
            return sel;
    }
};

export function applyUpdate<T extends TestState>(state: T, update: Update | null | void): T {
    if (!update) return state;
    const prev = state.sel;
    state = {
        ...state,
        top: {
            nextLoc: update.nextLoc ?? state.top.nextLoc,
            nodes: { ...state.top.nodes, ...update.nodes },
            root: update.root ?? state.top.root,
        },
    };
    if (Array.isArray(update.selection)) {
        // sel: update.selection ?? state.sel,
        update.selection.forEach((selup) => {
            state.sel = applySelUp(state.sel, selup);
        });
    } else if (update.selection) {
        state.sel = update.selection;
    }

    Object.keys(update.nodes).forEach((key) => {
        if (update.nodes[+key] === null) {
            delete state.top.nodes[+key];
        } else {
            state.top.nodes[+key] = update.nodes[+key]!;
        }
    });

    // This is "maybe commit text changes"
    if (prev.start.cursor.type === 'id' && prev.start.cursor.text != null && update.selection) {
        const updated = Array.isArray(update.selection)
            ? (update.selection.find((s) => s.type === 'move') as Extract<SelUpdate, { type: 'move' }>)?.to
            : update.selection;
        if (updated.start.key !== prev.start.key) {
            const loc = lastChild(prev.start.path);

            if (!update.nodes[loc] && state.top.nodes[loc]) {
                const node = state.top.nodes[loc] as Id<number>;
                state.top.nodes[loc] = {
                    ...node,
                    text: prev.start.cursor.text.join(''),
                    ccls: prev.start.cursor.text.length === 0 ? undefined : node.ccls,
                };
            }
        }
    }

    // if (prev.start.cursor.type === 'id' && prev.start.cursor.text != null && update.selection && update.selection.start.key !== prev.start.key) {
    //     const loc = lastChild(prev.start.path);

    //     if (!update.nodes[loc] && state.top.nodes[loc]) {
    //         const node = state.top.nodes[loc] as Id<number>;
    //         state.top.nodes[loc] = {
    //             ...node,
    //             text: prev.start.cursor.text.join(''),
    //             ccls: prev.start.cursor.text.length === 0 ? undefined : node.ccls,
    //         };
    //     }
    // }

    // This is "maybe commit text changes"
    if (prev.start.cursor.type === 'text' && prev.start.cursor.end.text != null) {
        const updated = Array.isArray(update.selection)
            ? (update.selection.find((s) => s.type === 'move') as Extract<SelUpdate, { type: 'move' }>)?.to
            : update.selection
            ? update.selection
            : undefined;
        if (
            updated?.start.key !== prev.start.key ||
            updated?.start.cursor.type !== 'text' ||
            updated?.start.cursor.end.index !== prev.start.cursor.end.index
        ) {
            const { end } = prev.start.cursor;
            const loc = lastChild(prev.start.path);
            if (!update.nodes[loc] && state.top.nodes[loc]) {
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
    }

    // if (
    //     prev.start.cursor.type === 'text' &&
    //     prev.start.cursor.end.text != null &&
    //     update.selection &&
    //     (update.selection.start.key !== prev.start.key ||
    //         update.selection.start.cursor.type !== 'text' ||
    //         update.selection.start.cursor.end.index !== prev.start.cursor.end.index)
    // ) {
    // }

    try {
        validate(state);
    } catch (err) {
        console.log(JSON.stringify(state, null, 2));
        console.log(shape(root(state)));
        throw err;
    }
    return state;
}
