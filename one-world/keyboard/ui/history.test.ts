import { RecNodeT } from '../../shared/cnodes';
import { parser } from '../../syntaxes/dsl3';
import { applySel, applyUpdate } from '../applyUpdate';
import { check } from '../check.test';
import { handleDelete } from '../handleDelete';
import { handleKey } from '../handleKey';
import { handleNav, selUpdate } from '../handleNav';
import { Mods, SelStart } from '../handleShiftNav';
import { asTop, bullet, checks, controlc, id, idc, lisp, list, listc, rich, round, smoosh, TestState, text, textc, tspan } from '../test-utils';
import { keyUpdate } from '../ui/keyUpdate';
import { Cursor } from '../utils';
import { Action, AppState } from './App';
import { applyAppUpdate, initialAppState } from './history';

export const appStateToTestState = (state: AppState): TestState => {
    return {
        top: state.top,
        sel: state.selections[0],
    };
};

test('a little history', () => {
    let state = initialAppState;
    state = applyAppUpdate(state, { type: 'key', key: '(', mods: { shift: true }, config: parser.config });
    check(appStateToTestState(state), round([id('', true)]), idc(0));
    state = applyAppUpdate(state, { type: 'undo' });
    check(appStateToTestState(state), id('', true), idc(0));
    // let state = asTop(text([], true), listc('before'));
    // state = applyUpdate(state, handleKey(state, 'A', lisp)!);
    // check(state, smoosh([id('A', true), text([])]), idc(1));
});

const keyAction = (key: string, mods: Mods = {}): Action => ({ type: 'key', key, mods, config: parser.config });

test.skip('some history', () => {
    let state = initialAppState;
    state = applyAppUpdate(state, keyAction('(', { shift: true }));
    state = applyAppUpdate(state, keyAction('a'));
    state = applyAppUpdate(state, keyAction('b'));
    state = applyAppUpdate(state, keyAction('c'));
    check(appStateToTestState(state), round([id('abc', true)]), idc(3));
    state = applyAppUpdate(state, { type: 'undo' });
    check(appStateToTestState(state), round([id('', true)]), idc(0));
    state = applyAppUpdate(state, { type: 'redo' });
    check(appStateToTestState(state), round([id('abc', true)]), idc(3));
});

test.skip('some history', () => {
    let state = initialAppState;
    state = applyAppUpdate(state, keyAction('a'), true);
    state = applyAppUpdate(state, keyAction('b'), true);
    state = applyAppUpdate(state, keyAction('c'), true);
    check(appStateToTestState(state), id('abc', true), idc(3));
    state = applyAppUpdate(state, { type: 'undo' });
    check(appStateToTestState(state), id('ab', true), idc(2));
    state = applyAppUpdate(state, { type: 'redo' });
    check(appStateToTestState(state), id('abc', true), idc(3));
    // check(appStateToTestState(state), round([id('', true)]), idc(0));
    // state = applyAppUpdate(state, { type: 'redo' });
    // check(appStateToTestState(state), round([id('abc', true)]), idc(3));
});
