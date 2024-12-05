import { applyUpdate } from './applyUpdate';
import { check } from './check.test';
import { handleDelete } from './handleDelete';
import { handleKey } from './handleKey';
import { handleClose, handleWrap } from './handleWrap';
import { asMultiTop, asTop, curly, id, idc, listc, round, smoosh, spaced, square, text, textc } from './test-utils';

test('round', () => {
    let state = asTop(id('', true), idc(0));
    state = applyUpdate(state, handleWrap(state, '('));
    check(state, round([id('', true)]), idc(0));
});

test('square', () => {
    let state = asTop(id('', true), idc(0));
    state = applyUpdate(state, handleWrap(state, '['));
    check(state, square([id('', true)]), idc(0));
});

test('curly', () => {
    let state = asTop(id('', true), idc(0));
    state = applyUpdate(state, handleWrap(state, '{'));
    check(state, curly([id('', true)]), idc(0));
});

test('text normal', () => {
    let state = asTop(text([{ type: 'text', text: '' }], true), textc(0, 0));
    state = applyUpdate(state, handleWrap(state, '{'));
    check(state, text([{ type: 'text', text: '{' }], true), textc(0, 1));
});

test('start of id', () => {
    let state = asTop(id('hi', true), idc(0));
    state = applyUpdate(state, handleWrap(state, '('));
    check(state, smoosh([round([], true), id('hi')]), listc('inside'));
});

test('start of id shift', () => {
    let state = asTop(id('hillo', true), idc(0, 2));
    state = applyUpdate(state, handleWrap(state, '('));
    check(state, smoosh([round([id('hi')], true), id('llo')]), listc('before'));
});

test('after id', () => {
    let state = asTop(id('hi', true), idc(2));
    state = applyUpdate(state, handleWrap(state, '('));
    check(state, smoosh([id('hi'), round([], true)]), listc('inside'));
});

test('middle of smoosh', () => {
    let state = asTop(smoosh([id('hi', true), id('+')]), idc(2));
    state = applyUpdate(state, handleWrap(state, '('));
    check(state, smoosh([id('hi'), round([], true), id('+')]), listc('inside'));
});

test('end of smoosh', () => {
    let state = asTop(smoosh([id('hi'), id('+', true)]), idc(1));
    state = applyUpdate(state, handleWrap(state, '('));
    check(state, smoosh([id('hi'), id('+'), round([], true)]), listc('inside'));
});

test('middle of an ID', () => {
    let state = asTop(id('hello', true), idc(2));
    state = applyUpdate(state, handleWrap(state, '('));
    check(state, smoosh([id('he'), round([], true), id('llo')]), listc('inside'));
});

test('close it up', () => {
    let state = asTop(round([id('hello', true)]), idc(2));
    state = applyUpdate(state, handleClose(state, ')'));
    check(state, round([id('hello')], true), listc('after'));
});

test('close it up spaced', () => {
    let state = asTop(round([spaced([id('hello', true), id('lol')])]), idc(2));
    state = applyUpdate(state, handleClose(state, ')'));
    check(state, round([spaced([id('hello'), id('lol')])], true), listc('after'));
});

test('start of smoosh', () => {
    let state = asTop(smoosh([id('hello', true), id('+')]), idc(0));
    state = applyUpdate(state, handleWrap(state, '('));
    check(state, smoosh([round([], true), id('hello'), id('+')]), listc('inside'));
});

test('wrap multi', () => {
    let state = asMultiTop(spaced([id('pre'), id('hello', 0), id('folks', 1)]), idc(0));
    state = applyUpdate(state, handleWrap(state, '('));
    check(state, spaced([id('pre'), round([spaced([id('hello', true), id('folks')])])]), idc(0));
});

test('wrap all of spaced', () => {
    let state = asMultiTop(round([spaced([id('pre', 0), id('hello'), id('folks', 1)])]), idc(0));
    state = applyUpdate(state, handleWrap(state, '{'));
    check(state, round([curly([spaced([id('pre', true), id('hello'), id('folks')])])]), idc(0));
});

// MARK: unwrap please
test('unwrap I think', () => {
    let state = asTop(round([curly([spaced([id('pre', true), id('hello'), id('folks')])])]), idc(0));
    state = applyUpdate(state, handleDelete(state));
    check(state, round([spaced([id('pre', true), id('hello'), id('folks')])]), idc(0));
});

test('unwrap in space', () => {
    let state = asTop(spaced([round([id('hello', true)]), id('folks')]), idc(0));
    state = applyUpdate(state, handleDelete(state));
    check(state, spaced([id('hello', true), id('folks')]), idc(0));
});

test('unwrap in space in space', () => {
    let state = asTop(spaced([round([spaced([id('hello', true), id('my')])]), id('folks')]), idc(0));
    state = applyUpdate(state, handleDelete(state));
    check(state, spaced([id('hello', true), id('my'), id('folks')]), idc(0));
});

test('unwrap in smoosh', () => {
    let state = asTop(smoosh([round([id('hello', true)]), id('+')]), idc(0));
    state = applyUpdate(state, handleDelete(state));
    check(state, smoosh([id('hello', true), id('+')]), idc(0));
});

test('unwrap smoosh in smoosh', () => {
    let state = asTop(smoosh([round([smoosh([id('hello', true), id('+')])]), id('a')]), idc(0));
    state = applyUpdate(state, handleDelete(state));
    check(state, smoosh([id('hello', true), id('+'), id('a')]), idc(0));
});

test('unwrap smoosh in smoosh join', () => {
    let state = asTop(smoosh([round([smoosh([id('hello', true), id('+')])]), id('+')]), idc(0));
    state = applyUpdate(state, handleDelete(state));
    check(state, smoosh([id('hello', true), id('++')]), idc(0));
});

test('unwrap in smoosh join', () => {
    let state = asTop(smoosh([id('ha'), round([id('hi', true)]), id('ho')]), idc(0));
    state = applyUpdate(state, handleDelete(state));
    check(state, id('hahiho', true), idc(2));
});

test('unwrap in smoosh join in child', () => {
    let state = asTop(round([smoosh([id('ha'), round([id('hi', true)]), id('ho')])]), idc(0));
    state = applyUpdate(state, handleDelete(state));
    check(state, round([id('hahiho', true)]), idc(2));
});

test.only('unwrap a spaced in a spaced', () => {
    let state = asTop(round([spaced([id('ha'), round([spaced([id('hi', true), id('ho')])]), id('he')])]), idc(0));
    state = applyUpdate(state, handleDelete(state));
    check(state, round([spaced([id('ha'), id('hi', true), id('ho'), id('he')])]), idc(0));
});
