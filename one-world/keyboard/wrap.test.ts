import { applyUpdate } from './applyUpdate';
import { check } from './check.test';
import { handleKey } from './handleKey';
import { handleWrap } from './handleWrap';
import { asTop, id, idc, round, smoosh } from './test-utils';

test('hello', () => {
    let state = asTop(id('', true), idc(0));
    state = applyUpdate(state, handleWrap(state, '('));
    check(state, round([id('', true)]), idc(0));
});

test('start of id', () => {
    let state = asTop(id('hi', true), idc(0));
    state = applyUpdate(state, handleWrap(state, '('));
    check(state, round([id('hi', true)]), idc(0));
});

test('after id', () => {
    let state = asTop(id('hi', true), idc(2));
    state = applyUpdate(state, handleWrap(state, '('));
    check(state, smoosh([id('hi'), round([id('', true)])]), idc(0));
});

test('end of smoosh', () => {
    let state = asTop(smoosh([id('hi', true), id('+')]), idc(2));
    state = applyUpdate(state, handleWrap(state, '('));
    check(state, round([id('', true)]), idc(0));
});
