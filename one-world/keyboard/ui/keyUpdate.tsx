import { splitGraphemes } from '../../../src/parse/splitGraphemes';
import { handleDelete } from '../handleDelete';
import { handleKey } from '../handleKey';
import { handleNav, selUpdate } from '../handleNav';
import { Mods, Src, handleShiftNav, handleSpecial, handleTab, shiftExpand, wordNav } from '../handleShiftNav';
import { wrapKind, handleWrap, closerKind, handleClose } from '../handleWrap';
import { Config, TestState, js } from '../test-utils';
import { NodeSelection, Update } from '../utils';

type Visual = {
    up: (sel: NodeSelection) => NodeSelection | null;
    down: (sel: NodeSelection) => NodeSelection | null;
    spans: Src[];
};

export const keyUpdate = (state: TestState, key: string, mods: Mods, visual?: Visual, config: Config = js): Update | void => {
    if (key === 'Enter') key = '\n';
    if (key === 'Backspace') {
        return handleDelete(state);
    } else if (key === 'ArrowLeft' || key === 'ArrowRight') {
        if (mods.alt) {
            const sel = wordNav(state, key === 'ArrowLeft', mods.shift);
            return sel ? { nodes: {}, selection: sel } : undefined;
        }
        if (mods.shift) {
            const selection = handleShiftNav(state, key);
            return selection ? { nodes: {}, selection } : undefined;
        }
        return selUpdate(handleNav(key, state));
    } else if (key === 'ArrowUp' || key === 'ArrowDown') {
        if (visual) {
            const next = (key === 'ArrowDown' ? visual.down : visual.up)(state.sel);
            if (mods.shift && next) {
                return { nodes: {}, selection: { start: state.sel.start, end: next.start } };
            }
            return next ? { nodes: {}, selection: next } : undefined;
        }
        return;
    } else if (key === 'Tab' || key === '\t') {
        return selUpdate(handleTab(state, !!mods.shift));
    } else if (mods.meta || mods.ctrl || mods.alt) {
        return handleSpecial(state, key, mods);
    } else if (splitGraphemes(key).length > 1) {
        console.log('ignoring', key);
    } else if (wrapKind(key)) {
        return handleWrap(state, key);
    } else if (closerKind(key)) {
        return handleClose(state, key);
    } else {
        // TODO ctrl-enter, need to pipe it in
        return handleKey(state, key, config, mods);
    }
};
