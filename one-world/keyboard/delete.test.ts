import { RecNodeT } from '../shared/cnodes';
import { shape } from '../shared/shape';
import { applyUpdate } from './applyUpdate';
import { handleDelete } from './handleDelete';
import { root } from './root';
import { asTop, atPath, id, idc, listc, noText, round, selPath, smoosh, spaced, TestState } from './test-utils';
import { Cursor } from './utils';
import { validate } from './validate';

// Should get 100% of 'handleDelete'

const check = (state: TestState, exp: RecNodeT<boolean>, cursor: Cursor) => {
    expect(shape(root(state))).toEqual(shape(exp));
    expect(state.sel.start.path.children).toEqual(atPath(state.top.root, state.top, selPath(exp)));
    expect(noText(state.sel.start.cursor)).toEqual(cursor);
};

test('deltes', () => {
    let state = asTop(id('helso', true), idc(3));
    validate(state);
    state = applyUpdate(state, handleDelete(state));
    check(state, id('heso', true), idc(2));
});

test('join spaced', () => {
    let state = asTop(spaced([id('one'), id('two', true)]), idc(0));
    validate(state);
    state = applyUpdate(state, handleDelete(state));
    check(state, id('onetwo', true), idc(3));
});

test('collapse smoosh', () => {
    let state = asTop(smoosh([id('one'), id('+', true), id('two')]), idc(1));
    validate(state);
    state = applyUpdate(state, handleDelete(state));
    check(state, id('onetwo', true), idc(3));
});

test('smoosh sel closer', () => {
    let state = asTop(smoosh([round([]), id('two', true)]), idc(0));
    validate(state);
    state = applyUpdate(state, handleDelete(state));
    check(state, smoosh([round([], true), id('two')]), listc('end'));
});

test('join deep smooshed', () => {
    let state = asTop(spaced([id('one'), smoosh([id('two', true), id('+')])]), idc(0));
    validate(state);
    state = applyUpdate(state, handleDelete(state));
    check(state, smoosh([id('onetwo', true), id('+')]), idc(3));
});

test('del smoosh prev', () => {
    let state = asTop(smoosh([id('...'), id('two', true)]), idc(0));
    validate(state);
    state = applyUpdate(state, handleDelete(state));
    check(state, smoosh([id('..', true), id('two')]), idc(2));
});
