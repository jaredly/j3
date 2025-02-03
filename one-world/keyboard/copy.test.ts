import { RecNodeT } from '../shared/cnodes';
import { shape } from '../shared/shape';
import { applySel, applyUpdate } from './applyUpdate';
import { check } from './check.test';
import { handleDelete, normalizeTextCursorSide } from './handleDelete';
import { handleKey } from './handleKey';
import { handleNav } from './handleNav';
import { handleCopyMulti } from './handleWrap';
import { root } from './root';
import { asTop, atPath, id, idc, lisp, listc, noText, round, selPath, smoosh, spaced, TestState, text, textc, tspan } from './test-utils';
import { Cursor } from './utils';
import { validate } from './validate';

test('full smoosh', () => {
    let state = asTop(smoosh([id('hello', 1), id('+'), id('folks', 2)]), idc(0), idc(2));
    validate(state);
    const result = handleCopyMulti(state);
    if (!result) throw new Error('uynable to copy');
    expect(shape(result.tree)).toEqual(shape(smoosh([id('hello'), id('+'), id('fo')])));
    expect(result.single).toBe(false);
});

test('partial smoosh', () => {
    let state = asTop(smoosh([id('hello', 1), id('+'), id('folks', 2)]), idc(2), idc(2));
    validate(state);
    const result = handleCopyMulti(state);
    if (!result) throw new Error('uynable to copy');
    expect(shape(result.tree)).toEqual(shape(smoosh([id('llo'), id('+'), id('fo')])));
    expect(result.single).toBe(false);
});

test('single id', () => {
    let state = asTop(smoosh([id('hello', 1), id('+'), id('folks')]), idc(0), idc(5));
    validate(state);
    const result = handleCopyMulti(state);
    if (!result) throw new Error('uynable to copy');
    expect(shape(result.tree)).toEqual(shape(id('hello')));
    expect(result.single).toBe(true);
});

test('partial id', () => {
    let state = asTop(smoosh([id('hello', 1), id('+'), id('folks')]), idc(1), idc(3));
    validate(state);
    const result = handleCopyMulti(state);
    if (!result) throw new Error('uynable to copy');
    expect(shape(result.tree)).toEqual(shape(id('el')));
    expect(result.single).toBe(true);
});

// START HERE
test.only('collapse singleton', () => {
    let state = asTop(round([id('hi', 1), smoosh([id('hello', 2), id('+'), id('folks')])]), idc(0), idc(5));
    validate(state);
    const result = handleCopyMulti(state);
    if (!result) throw new Error('uynable to copy');
    expect(shape(result.tree)).toEqual(shape(round([id('hi'), id('hello')])));
    expect(result.single).toBe(true);
});
