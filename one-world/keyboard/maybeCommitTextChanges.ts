import { Id, Text } from '../shared/cnodes';
import { TestState } from './test-utils';
import { NodeSelection, Update, SelUpdate, lastChild } from './utils';

export function maybeCommitTextChanges<T extends TestState>(prev: NodeSelection, update: Update, state: T) {
    // if (prev.start.cursor.type === 'id' && prev.start.cursor.text != null && update.selection) {
    //     const updated = Array.isArray(update.selection)
    //         ? (update.selection.find((s) => s.type === 'move') as Extract<SelUpdate, { type: 'move' }>)?.to
    //         : update.selection;
    //     if (updated.start.key !== prev.start.key) {
    //         const loc = lastChild(prev.start.path);

    //         if (!update.nodes[loc] && state.top.nodes[loc]) {
    //             const node = state.top.nodes[loc] as Id<number>;
    //             state.top.nodes[loc] = {
    //                 ...node,
    //                 text: prev.start.cursor.text.join(''),
    //                 ccls: prev.start.cursor.text.length === 0 ? undefined : node.ccls,
    //             };
    //         }
    //     }
    // }

    // This is "maybe commit text changes"
    // if (prev.start.cursor.type === 'text' && prev.start.cursor.end.text != null) {
    //     const updated = Array.isArray(update.selection)
    //         ? (update.selection.find((s) => s.type === 'move') as Extract<SelUpdate, { type: 'move' }>)?.to
    //         : update.selection
    //         ? update.selection
    //         : undefined;
    //     if (
    //         updated?.start.key !== prev.start.key ||
    //         updated?.start.cursor.type !== 'text' ||
    //         updated?.start.cursor.end.index !== prev.start.cursor.end.index
    //     ) {
    //         const { end } = prev.start.cursor;
    //         const loc = lastChild(prev.start.path);
    //         if (!update.nodes[loc] && state.top.nodes[loc]) {
    //             const node = state.top.nodes[loc] as Text<number>;
    //             const spans = node.spans.slice();
    //             const span = spans[end.index];
    //             if (span.type === 'text') {
    //                 spans[end.index] = { ...span, text: end.text!.join('') };
    //                 state.top.nodes[loc] = {
    //                     ...node,
    //                     spans,
    //                 };
    //             }
    //         }
    //     }
    // }

    const selId = lastChild(state.sel.start.path);
    // console.log('com', update.tmpText, selId);
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
