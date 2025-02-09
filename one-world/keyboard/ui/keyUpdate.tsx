import { splitGraphemes } from '../../../src/parse/splitGraphemes';
import { handleDelete } from '../handleDelete';
import { handleKey } from '../handleKey';
import { handleNav } from '../handleNav';
import { selUpdate } from '../update/updaters';
import { Mods, SelStart, Src, handleShiftNav, handleSpecial, handleTab, shiftExpand, wordNav } from '../handleShiftNav';
import { wrapKind, handleWrap, closerKind, handleClose } from '../handleWrap';
import { Config, TestState, js } from '../test-utils';
import { NodeSelection, Update } from '../utils';
import { KeyAction, moveA } from '../keyActionToUpdate';

export type Visual = {
    up: (sel: NodeSelection) => SelStart | null | void | undefined;
    down: (sel: NodeSelection) => SelStart | null | void | undefined;
    spans: Src[];
};

export const keyUpdate = (state: TestState, key: string, mods: Mods, visual?: Visual, config: Config = js): KeyAction[] | void => {
    if (key === 'Enter') key = '\n';
    if (key === 'Backspace') {
        return handleDelete(state);
    } else if (key === 'ArrowLeft' || key === 'ArrowRight') {
        if (mods.alt) {
            return wordNav(state, key === 'ArrowLeft', mods.shift);
        }
        if (mods.shift) {
            return handleShiftNav(state, key);
        }
        return moveA(handleNav(key, state));
    } else if (key === 'ArrowUp' || key === 'ArrowDown') {
        if (visual) {
            const next = (key === 'ArrowDown' ? visual.down : visual.up)(state.sel);
            if (mods.shift && next) {
                return [{ type: 'sel-expand', sel: next }];
            }
            return moveA(next);
        }
        return;
    } else if (key === 'Tab' || key === '\t') {
        return moveA(handleTab(state, !!mods.shift));
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
