import { splitGraphemes } from '../../../src/parse/splitGraphemes';
import { handleDelete } from '../handleDelete';
import { handleKey } from '../handleKey';
import { handleNav } from '../handleNav';
import { Mods, handleShiftNav, handleSpecial } from '../handleShiftNav';
import { wrapKind, handleWrap, closerKind, handleClose } from '../handleWrap';
import { TestState, js } from '../test-utils';

export const keyUpdate = (state: TestState, key: string, mods: Mods, config = js) => {
    if (key === 'Enter') key = '\n';
    if (key === 'Backspace') {
        return handleDelete(state);
    } else if (key === 'ArrowLeft' || key === 'ArrowRight') {
        return mods.shift ? handleShiftNav(state, key) : handleNav(key, state);
    } else if (mods.meta || mods.ctrl || mods.alt) {
        return handleSpecial(state, key, mods);
    } else if (splitGraphemes(key).length > 1) {
        console.log('ignoring', key);
    } else if (wrapKind(key)) {
        return handleWrap(state, key);
    } else if (closerKind(key)) {
        return handleClose(state, key);
    } else {
        return handleKey(state, key, config);
    }
};
