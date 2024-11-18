import { RecNodeT } from '../shared/cnodes';
import { shape } from '../shared/shape';
import { applyUpdate } from './applyUpdate';
import { check } from './check.test';
import { handleDelete } from './handleDelete';
import { handleKey } from './handleKey';
import { handleNav } from './handleNav';
import { root } from './root';
import { asTop, atPath, id, idc, lisp, listc, noText, round, selPath, smoosh, spaced, TestState, text, textc } from './test-utils';
import { Cursor } from './utils';
import { validate } from './validate';

// Should get 100% of 'handleDelete'

test('at start', () => {
    let state = asTop(smoosh([id('helso', true), id('+')]), idc(0));
    validate(state);
    state = applyUpdate(state, handleDelete(state));
    check(state, smoosh([id('helso', true), id('+')]), idc(0));
});

test('zero', () => {
    let state = asTop(id('h', true), idc(1));
    validate(state);
    const m = handleDelete(state);
    state = applyUpdate(state, m);
    check(state, id('', true), idc(0));
});

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

test('inside list in smoosh', () => {
    let state = asTop(smoosh([id('a'), round([], true), id('b')]), listc('inside'));
    validate(state);
    state = applyUpdate(state, handleDelete(state));
    check(state, id('ab', true), idc(1));
});

test('inside list in smoosh with one sib', () => {
    let state = asTop(smoosh([id('a'), round([], true)]), listc('inside'));
    validate(state);
    state = applyUpdate(state, handleDelete(state));
    check(state, id('a', true), idc(1));
});

test('inside list in smoosh with one sib', () => {
    let state = asTop(round([smoosh([id('a'), round([], true)])]), listc('inside'));
    validate(state);
    state = applyUpdate(state, handleDelete(state));
    check(state, round([id('a', true)]), idc(1));
});

test('inside list', () => {
    let state = asTop(round([], true), listc('inside'));
    validate(state);
    state = applyUpdate(state, handleDelete(state));
    check(state, id('', true), idc(0));
});

test('before smoosh', () => {
    let state = asTop(smoosh([id('hi'), round([], true)]), listc('before'));
    validate(state);
    state = applyUpdate(state, handleDelete(state));
    check(state, smoosh([id('h', true), round([])]), idc(1));
});

test('before space', () => {
    let state = asTop(spaced([id('hi'), round([], true)]), listc('before'));
    state = applyUpdate(state, handleDelete(state));
    check(state, smoosh([id('hi'), round([], true)]), listc('before'));
});

test('smoosh blank id', () => {
    let state = asTop(smoosh([round([]), id('h', true)]), idc(1));
    state = applyUpdate(state, handleDelete(state));
    check(state, round([], true), listc('after'));
});

test('smoosh blank id start', () => {
    let state = asTop(smoosh([id('h', true), round([])]), idc(1));
    state = applyUpdate(state, handleDelete(state));
    check(state, round([], true), listc('before'));
});

test('text pls', () => {
    let state = asTop(text([{ type: 'text', text: 'hi' }], true), textc(0, 1));
    state = applyUpdate(state, handleDelete(state));
    check(state, text([{ type: 'text', text: 'i' }], true), textc(0, 0));
});

test('text pls empty', () => {
    let state = asTop(text([], true), listc('inside'));
    state = applyUpdate(state, handleDelete(state));
    check(state, id('', true), idc(0));
});

test('join why', () => {
    let state = asTop(spaced([id('one'), id('two', true)]), idc(0));
    state = applyUpdate(state, handleDelete(state));
    check(state, id('onetwo', true), idc(3));
});

test('join why', () => {
    let state = asTop(spaced([id('one'), id('t', true)]), idc(1));
    state = applyUpdate(state, handleDelete(state));
    state = applyUpdate(state, handleDelete(state));
    check(state, id('one', true), idc(3));
});

test.only('join why broked', () => {
    let state = asTop(smoosh([id('a'), id('+', true)]), idc(1));
    state = applyUpdate(state, handleKey(state, 'b', lisp));
    state = applyUpdate(state, handleKey(state, 'c', lisp));
    state = applyUpdate(state, handleNav('ArrowLeft', state));
    state = applyUpdate(state, handleDelete(state));
    check(state, smoosh([id('a'), id('+'), id('c', true)]), idc(0));
    state = applyUpdate(state, handleDelete(state));
    check(state, id('ac', true), idc(1));
});
