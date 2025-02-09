import { shape } from '../shared/shape';
import { applyUpdate } from './applyUpdate';
import { check } from './check.test';
import { KeyAction } from './keyActionToUpdate';
import { CopiedValues, handleCopyMulti } from './update/multi-change';
import { asTop, id, idc, round, smoosh, spaced, TestState } from './test-utils';
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

test('collapse copied singleton', () => {
    let state = asTop(round([id('hi', 1), smoosh([id('hello', 2), id('+'), id('folks')])]), idc(0), idc(5));
    validate(state);
    const result = handleCopyMulti(state);
    if (!result) throw new Error('uynable to copy');
    expect(shape(result.tree)).toEqual(shape(round([id('hi'), id('hello')])));
    expect(result.single).toBe(false);
});

const handlePaste = (state: TestState, data: CopiedValues): KeyAction[] => [
    {
        type: 'paste',
        path: state.sel.start.path,
        cursor: state.sel.start.cursor,
        values: data,
    },
];

test('paste into here', () => {
    let state = asTop(round([id('hello'), id('', true)]), idc(0));
    validate(state);
    state = applyUpdate(
        state,
        handlePaste(state, {
            single: true,
            tree: id('ho'),
        }),
    );
    check(state, round([id('hello'), id('ho', true)]), idc(0), idc(2));
});

test('paste into id', () => {
    let state = asTop(id('hello', true), idc(2));
    validate(state);
    state = applyUpdate(
        state,
        handlePaste(state, {
            single: true,
            tree: id('ho'),
        }),
    );
    check(state, id('hehollo', true), idc(2), idc(4));
});

test('splice it up', () => {
    let state = asTop(round([id('hello'), id('', true)]), idc(0));
    validate(state);
    state = applyUpdate(
        state,
        handlePaste(state, {
            single: false,
            tree: round([id('a'), id('b')]),
        }),
    );
    check(state, round([id('hello'), id('a', 1), id('b', 2)]), idc(0), idc(1));
});

test('pasting spaced...', () => {
    let state = asTop(round([id('hello'), id('', true)]), idc(0));
    validate(state);
    state = applyUpdate(
        state,
        handlePaste(state, {
            single: false,
            tree: spaced([id('a'), id('b')]),
        }),
    );
    check(state, round([id('hello'), spaced([id('a', 1), id('b', 2)])]), idc(0), idc(1));
});
