import { RecNodeT } from '../shared/cnodes';
import { shape } from '../shared/shape';
import { applySel, applyUpdate } from './applyUpdate';
import { check } from './check.test';
import { handleDelete, normalizeTextCursorSide } from './handleDelete';
import { handleKey } from './handleKey';
import { handleNav } from './handleNav';
import { root } from './root';
import { asTop, atPath, id, idc, lisp, listc, noText, round, selPath, smoosh, spaced, TestState, text, textc, tspan } from './test-utils';
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
    check(state, smoosh([round([], true), id('two')]), listc('inside'));
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

test('start list in smoosh', () => {
    let state = asTop(smoosh([id('a'), round([], true), id('b')]), listc('start'));
    validate(state);
    state = applyUpdate(state, handleDelete(state));
    check(state, id('ab', true), idc(1));
});

test('start list in smoosh with one sib', () => {
    let state = asTop(smoosh([id('a'), round([], true)]), listc('start'));
    validate(state);
    state = applyUpdate(state, handleDelete(state));
    check(state, id('a', true), idc(1));
});

test('start list in smoosh with one sib', () => {
    let state = asTop(round([smoosh([id('a'), round([], true)])]), listc('start'));
    validate(state);
    state = applyUpdate(state, handleDelete(state));
    check(state, round([id('a', true)]), idc(1));
});

test('start list', () => {
    let state = asTop(round([], true), listc('start'));
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

test('join why 2', () => {
    let state = asTop(spaced([id('one'), id('t', true)]), idc(1));
    state = applyUpdate(state, handleDelete(state));
    state = applyUpdate(state, handleDelete(state));
    check(state, id('one', true), idc(3));
});

test('join why broked', () => {
    let state = asTop(smoosh([id('a'), id('+', true)]), idc(1));
    state = applyUpdate(state, handleKey(state, 'b', lisp));
    state = applyUpdate(state, handleKey(state, 'c', lisp));
    state = applySel(state, handleNav('ArrowLeft', state));
    state = applyUpdate(state, handleDelete(state));
    check(state, smoosh([id('a'), id('+'), id('c', true)]), idc(0));
    // console.log(state.top.tmpText, state.sel.start.cursor);
    // console.log(state.sel.start.cursor, state.top.tmpText, state.top.nodes);
    state = applyUpdate(state, handleDelete(state));
    // console.log(state.sel.start.cursor, state.top.tmpText, state.top.nodes);
    check(state, id('ac', true), idc(1));
});

test('empty id in list', () => {
    let state = asTop(round([id('', true)]), idc(0));
    state = applyUpdate(state, handleDelete(state));
    state = applyUpdate(state, handleDelete(state));
    check(state, id('', true), idc(0));
});

test('empty list - smoosh  fix', () => {
    let state = asTop(smoosh([round([], true), id('hi')]), listc('inside'));
    state = applyUpdate(state, handleDelete(state));
    state = applyUpdate(state, handleDelete(state));
    check(state, id('hi', true), idc(0));
});

test('empty id in list - smoosh  fix', () => {
    let state = asTop(smoosh([round([id('', true)]), id('hi')]), idc(0));
    state = applyUpdate(state, handleDelete(state));
    state = applyUpdate(state, handleDelete(state));
    check(state, id('hi', true), idc(0));
});

test('space is weird', () => {
    let state = asTop(round([id('a'), id('', true)]), idc(0));
    state = applyUpdate(state, handleDelete(state));
    check(state, round([id('a', true)]), idc(1));
});

test('del two', () => {
    let state = asTop(round([id(''), id('', true)]), idc(0));
    state = applyUpdate(state, handleDelete(state));
    check(state, round([id('', true)]), idc(0));
});

test('text adfter', () => {
    let state = asTop(text([], true), listc('after'));
    state = applyUpdate(state, handleDelete(state));
    check(state, text([], true), listc('inside'));
});

test('text before', () => {
    let state = asTop(spaced([id('a'), text([], true)]), listc('before'));
    state = applyUpdate(state, handleDelete(state));
    check(state, smoosh([id('a'), text([], true)]), listc('before'));
});

test('text delete', () => {
    let state = asTop(text([tspan('')], true), textc(0, 0));
    state = applyUpdate(state, handleDelete(state));
    check(state, id('', true), idc(0));
});

test('text delete', () => {
    let state = asTop(text([tspan('aa')], true), textc(0, 0));
    state = applyUpdate(state, handleDelete(state));
    check(state, text([tspan('aa')], true), listc('before'));
});

test('text delete prev span', () => {
    let state = asTop(text([tspan('aa'), tspan('bb')], true), textc(1, 0));
    state = applyUpdate(state, handleDelete(state));
    check(state, text([tspan('a'), tspan('bb')], true), textc(0, 1));
});

test('text delete prev span tmp text', () => {
    let state = asTop(text([tspan('aa'), tspan('c')], true), textc(1, 0));
    // state.top.tmpText[`0:1`] = ['c'];
    state = applyUpdate(state, handleDelete(state));
    check(state, text([tspan('a'), tspan('c')], true), textc(0, 1));
});

test('text delete prev span empty', () => {
    let state = asTop(text([tspan('aa'), tspan('')], true), textc(1, 0));
    state = applyUpdate(state, handleDelete(state));
    check(state, text([tspan('a')], true), textc(0, 1));
});

test('text delete prev empty span', () => {
    let state = asTop(text([tspan('a'), tspan(''), tspan('b')], true), textc(2, 0));
    state = applyUpdate(state, handleDelete(state));
    check(state, text([tspan('b')], true), textc(0, 0));
});

test('text delete prev empty span', () => {
    let state = asTop(text([tspan('na'), tspan(''), tspan('b')], true), textc(2, 0));
    state = applyUpdate(state, handleDelete(state));
    check(state, text([tspan('n'), tspan('b')], true), textc(0, 1));
});

test('text delete prev empty span', () => {
    let state = asTop(text([tspan('na'), tspan(''), tspan('')], true), textc(2, 0));
    state = applyUpdate(state, handleDelete(state));
    check(state, text([tspan('n')], true), textc(0, 1));
});

test('text delete prev empty span to start', () => {
    let state = asTop(text([tspan(''), tspan('a')], true), textc(1, 0));
    state = applyUpdate(state, handleDelete(state));
    check(state, text([tspan('a')], true), listc('before'));
});

//

test('norm', () => {
    const side = { index: 2, cursor: -1 };
    expect(normalizeTextCursorSide([tspan('na'), tspan(''), tspan('')], side)).toEqual({ index: 0, cursor: 1 });
});

test('inside list', () => {
    let state = asTop(round([], true), listc('start'));
    validate(state);
    state = applyUpdate(state, handleDelete(state));
    check(state, id('', true), idc(0));
});

test('multi del thanks', () => {
    let state = asTop(round([id('one'), id('two', 1), id('three', 2)]), idc(0), idc(5));
    validate(state);
    state = applyUpdate(state, handleDelete(state));
    check(state, round([id('one'), id('', true)]), idc(0));
});

test('spaced idk', () => {
    let state = asTop(spaced([id('one'), id('two', 1), id('three', 2)]), idc(0), idc(5));
    validate(state);
    state = applyUpdate(state, handleDelete(state));
    check(state, spaced([id('one'), id('', true)]), idc(0));
});

test('smoosh please', () => {
    let state = asTop(smoosh([id('one'), id('.', 1), id('ho', 2)]), idc(0), idc(5));
    validate(state);
    state = applyUpdate(state, handleDelete(state));
    check(state, id('one', true), idc(3));
});

test('smoosh please nudge', () => {
    let state = asTop(smoosh([id('one', 1), id('.'), id('ho', 2)]), idc(3), idc(5));
    validate(state);
    state = applyUpdate(state, handleDelete(state));
    check(state, id('one', true), idc(3));
});
