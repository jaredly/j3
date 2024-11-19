import { applyUpdate } from './applyUpdate';
import { check } from './check.test';
import { handleKey } from './handleKey';
import { handleWrap } from './handleWrap';
import { asTop, curly, id, idc, listc, round, smoosh, square, text, textc } from './test-utils';

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
    check(state, round([id('hi', true)]), idc(0));
});

test('after id', () => {
    let state = asTop(id('hi', true), idc(2));
    state = applyUpdate(state, handleWrap(state, '('));
    check(state, smoosh([id('hi'), round([], true)]), listc('inside'));
});

test('middle of smoosh', () => {
    let state = asTop(smoosh([id('hi', true), id('+')]), idc(2));
    state = applyUpdate(state, handleWrap(state, '('));
    check(state, smoosh([id('hi'), round([id('+', true)])]), idc(0));
});

test('end of smoosh', () => {
    let state = asTop(smoosh([id('hi'), id('+', true)]), idc(1));
    state = applyUpdate(state, handleWrap(state, '('));
    check(state, smoosh([id('hi'), id('+'), round([], true)]), listc('inside'));
});

test('middle of an ID', () => {
    let state = asTop(id('hello', true), idc(2));
    state = applyUpdate(state, handleWrap(state, '('));
    check(state, smoosh([id('he'), round([id('llo')], true)]), listc('before'));
});
