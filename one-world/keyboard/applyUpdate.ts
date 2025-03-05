import { shape } from '../shared/shape';
import { CTState } from './CTState';
import { addInPath, removeInPath } from './handleDelete';
import { SelStart } from './handleShiftNav';
import { KeyAction, keyActionToUpdate, selUpdate } from './keyActionToUpdate';
import { root } from './root';
import { TestState } from './test-utils';
import { applyCTreeUpdate } from './update/crdt/ctree.test';
import { lastChild, NodeSelection, parentPath, pathWithChildren, selStart, SelUpdate, Update } from './utils';
import { validate } from './validate';

export const applySel = <T extends TestState>(state: T, sel: SelStart | void): T => applyNormalUpdate(state, selUpdate(sel));

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
        case 'addparent':
            return {
                start: selStart(addInPath(sel.start.path, up.loc, up.parent), sel.start.cursor),
                end: sel.end ? selStart(addInPath(sel.end.path, up.loc, up.parent), sel.end.cursor) : undefined,
            };

        // case 'unwrapList':
        // case 'delete':
        case 'id': {
            return { start: modId(sel.start, up), end: sel.end ? modId(sel.end, up) : undefined };
        }
    }
};

export const applyNormalUpdate = <T extends TestState>(state: T, update: null | undefined | void | Update): T => {
    if (!update) return state;
    state = {
        ...state,
        top: {
            nextLoc: update.nextLoc ?? state.top.nextLoc,
            nodes: { ...state.top.nodes, ...update.nodes },
            root: update.root ?? state.top.root,
            tmpText: state.top.tmpText,
        },
    };

    if (Array.isArray(update.selection)) {
        update.selection.forEach((selup) => {
            const sel = applySelUp(state.sel, selup);
            if (sel) state.sel = sel;
            else {
                console.warn(`unable to apply selection update`, state.sel, selup);
            }
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

    try {
        validate(state);
    } catch (err) {
        // console.log(JSON.stringify(state, null, 2));
        console.log(shape(root(state)));
        throw err;
    }
    return state;
};

export let TESTING_CTREE = false;
export const testCtree = (yes: boolean) => {
    TESTING_CTREE = yes;
};

export function applyUpdate<T extends TestState>(state: T, update: KeyAction[] | null | void, debug = false): T {
    if (TESTING_CTREE) {
        return applyCTreeUpdate(state as any, update, debug) as any;
    }
    return _applyUpdate(state, update);
}

export function _applyUpdate<T extends TestState>(state: T, update: KeyAction[] | null | void): T {
    if (!update) return state;
    for (let sub of update) {
        state = applyNormalUpdate(state, keyActionToUpdate(state, sub));
    }
    return state;
}
