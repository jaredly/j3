import { shape } from '../shared/shape';
import { TestState } from './test-utils';
import { lastChild, NodeSelection, parentPath, Path, pathWithChildren, selStart, SelUpdate, Update } from './utils';
import { validate } from './validate';
import { root } from './root';
import { SelStart } from './handleShiftNav';
import { selUpdate } from './handleNav';
import { removeInPath } from './handleDelete';
import { maybeCommitTextChanges } from './maybeCommitTextChanges';

export const applySel = (state: TestState, sel: SelStart | void) => applyUpdate(state, selUpdate(sel));

// const addParent = (path: Path, )
const modId = (sel: SelStart, mod: Extract<SelUpdate, { type: 'id' }>) => {
    const at = lastChild(sel.path);
    if (at !== mod.from.loc) return sel;
    if (sel.cursor.type !== 'id') throw new Error(`selUpdate (id), but non-id cursor ${sel.cursor.type}`);
    if (sel.cursor.end < mod.from.offset) return sel;
    const newEnd = sel.cursor.end - mod.from.offset + mod.to.offset;
    return selStart(pathWithChildren(parentPath(sel.path), mod.to.loc), { type: 'id', end: newEnd });
};

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
        case 'id': {
            return { start: modId(sel.start, up), end: sel.end ? modId(sel.end, up) : undefined };
        }
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
            tmpText: state.top.tmpText,
        },
    };

    if (update.tmpText) {
        state.top.tmpText = { ...state.top.tmpText };
        Object.keys(update.tmpText).forEach((key) => {
            if (!update.tmpText![key]) {
                delete state.top.tmpText[key];
            } else {
                state.top.tmpText[key];
            }
        });
    }

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
    maybeCommitTextChanges<T>(prev, update, state);

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
