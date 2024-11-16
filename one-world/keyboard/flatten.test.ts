import { RecNodeT } from '../shared/cnodes';
import { shape } from '../shared/shape';
import { applyUpdate } from './applyUpdate';
import { handleKey } from './handleKey';
import { root } from './root';
import { asTop, atPath, id, idc, js, listc, noText, round, selPath, smoosh, spaced, TestState, text } from './test-utils';
import { Cursor } from './utils';
import { validate } from './validate';

const check = (state: TestState, exp: RecNodeT<boolean>, cursor: Cursor) => {
    expect(shape(root(state))).toEqual(shape(exp));
    expect(state.sel.start.path.children).toEqual(atPath(state.top.root, state.top, selPath(exp)));
    expect(noText(state.sel.start.cursor)).toEqual(cursor);
};

// MARK: space sep

test('smoosh in space in sep', () => {
    let state = asTop(
        round([
            spaced([
                //
                id('1'),
                //
                smoosh([
                    //
                    id('+'),
                    id('a', true),
                    id('.'),
                    id('b'),
                ]),
                id('2'),
            ]),
        ]),
        idc(1),
    );
    state = applyUpdate(state, handleKey(state, ';', js)!);
    check(
        state,
        round([
            //
            spaced([id('1'), smoosh([id('+'), id('a')])]),
            spaced([smoosh([id('.', true), id('b')]), id('2')]),
        ]),
        idc(0),
    );
});

test('id in round', () => {
    let state = asTop(round([id('abc', true)]), idc(3));
    validate(state);
    state = applyUpdate(state, handleKey(state, ';', js)!);
    check(state, round([id('abc'), id('', true)]), idc(0));
});

test('id in round - start', () => {
    let state = asTop(round([id('abc', true)]), idc(0));
    validate(state);
    state = applyUpdate(state, handleKey(state, ';', js)!);
    check(state, round([id(''), id('abc', true)]), idc(0));
});

test('id in round - mid', () => {
    let state = asTop(round([id('abc', true)]), idc(2));
    validate(state);
    state = applyUpdate(state, handleKey(state, ';', js)!);
    check(state, round([id('ab'), id('c', true)]), idc(0));
});

// MARK: space in smooshed in space

test('smoosh id after', () => {
    let state = asTop(spaced([id('one'), smoosh([id('+'), id('abc', true)])]), idc(3));
    state = applyUpdate(state, handleKey(state, ' ', js)!);
    check(state, spaced([id('one'), smoosh([id('+'), id('abc')]), id('', true)]), idc(0));
});

test('smoosh id before', () => {
    let state = asTop(spaced([id('one'), smoosh([id('+', true), id('abc')])]), idc(0));
    state = applyUpdate(state, handleKey(state, ' ', js)!);
    check(state, spaced([id('one'), id(''), smoosh([id('+', true), id('abc')])]), idc(0));
});

test('smoosh id smoosh split (start)', () => {
    let state = asTop(spaced([id('one'), smoosh([id('+'), id('abc', true)])]), idc(0));
    state = applyUpdate(state, handleKey(state, ' ', js)!);
    check(state, spaced([id('one'), id('+'), id('abc', true)]), idc(0));
});

test('smoosh id smoosh split (end)', () => {
    let state = asTop(spaced([id('one'), smoosh([id('+', true), id('abc')])]), idc(1));
    state = applyUpdate(state, handleKey(state, ' ', js)!);
    check(state, spaced([id('one'), id('+'), id('abc', true)]), idc(0));
});

test('smoosh id id split', () => {
    let state = asTop(spaced([id('one'), smoosh([id('+'), id('abc', true)])]), idc(1));
    state = applyUpdate(state, handleKey(state, ' ', js)!);
    check(state, spaced([id('one'), smoosh([id('+'), id('a')]), id('bc', true)]), idc(0));
});

// MARK: space in smooshed

test('smoosh id after in', () => {
    let state = asTop(smoosh([id('+'), id('abc', true)]), idc(3));
    state = applyUpdate(state, handleKey(state, ' ', js)!);
    check(state, spaced([smoosh([id('+'), id('abc')]), id('', true)]), idc(0));
});

test('smoosh id before', () => {
    let state = asTop(smoosh([id('+', true), id('abc')]), idc(0));
    state = applyUpdate(state, handleKey(state, ' ', js)!);
    check(state, spaced([id(''), smoosh([id('+', true), id('abc')])]), idc(0));
});

test('smoosh id split id', () => {
    let state = asTop(smoosh([id('+'), id('abc', true)]), idc(1));
    state = applyUpdate(state, handleKey(state, ' ', js)!);
    check(state, spaced([smoosh([id('+'), id('a')]), id('bc', true)]), idc(0));
});

test('smoosh id split smoosh (start)', () => {
    let state = asTop(smoosh([id('+'), id('abc', true)]), idc(0));
    state = applyUpdate(state, handleKey(state, ' ', js)!);
    check(state, spaced([id('+'), id('abc', true)]), idc(0));
});

test('smoosh id split smoosh (end)', () => {
    let state = asTop(smoosh([id('+', true), id('abc')]), idc(1));
    state = applyUpdate(state, handleKey(state, ' ', js)!);
    check(state, spaced([id('+'), id('abc', true)]), idc(0));
});

test('smoosh round split smoosh ', () => {
    let state = asTop(smoosh([round([], true), id('abc')]), listc('after'));
    state = applyUpdate(state, handleKey(state, ' ', js)!);
    check(state, spaced([round([]), id('abc', true)]), idc(0));
});

test('smoosh round split smoosh (before)', () => {
    let state = asTop(smoosh([round([], true), id('abc')]), listc('before'));
    state = applyUpdate(state, handleKey(state, ' ', js)!);
    check(state, spaced([id(''), smoosh([round([], true), id('abc')])]), listc('before'));
});

// MARK: ID spaced

test('id mid', () => {
    let state = asTop(id('abc', true), idc(1));
    state = applyUpdate(state, handleKey(state, ' ', js)!);
    check(state, spaced([id('a'), id('bc', true)]), idc(0));
});

test('id start', () => {
    let state = asTop(id('abc', true), idc(0));
    state = applyUpdate(state, handleKey(state, ' ', js)!);
    check(state, spaced([id(''), id('abc', true)]), idc(0));
});

test('id end', () => {
    let state = asTop(id('abc', true), idc(3));
    state = applyUpdate(state, handleKey(state, ' ', js)!);
    check(state, spaced([id('abc'), id('', true)]), idc(0));
});

test('round start', () => {
    let state = asTop(round([], true), listc('before'));
    state = applyUpdate(state, handleKey(state, ' ', js)!);
    check(state, spaced([id(''), round([], true)]), listc('before'));
});

test('round end', () => {
    let state = asTop(round([], true), listc('after'));
    state = applyUpdate(state, handleKey(state, ' ', js)!);
    check(state, spaced([round([]), id('', true)]), idc(0));
});

test('round inside', () => {
    let state = asTop(round([], true), listc('inside'));
    state = applyUpdate(state, handleKey(state, ' ', js)!);
    check(state, round([spaced([id(''), id('', true)])]), idc(0));
});

test('text start', () => {
    let state = asTop(text([], true), listc('before'));
    state = applyUpdate(state, handleKey(state, ' ', js)!);
    check(state, spaced([id(''), text([], true)]), listc('before'));
});

test('text end', () => {
    let state = asTop(text([], true), listc('after'));
    state = applyUpdate(state, handleKey(state, ' ', js)!);
    check(state, spaced([text([]), id('', true)]), idc(0));
});

// MARK: Two spaced

test('id two end', () => {
    let state = asTop(spaced([id('one'), id('two', true)]), idc(3));
    state = applyUpdate(state, handleKey(state, ' ', js)!);
    check(state, spaced([id('one'), id('two'), id('', true)]), idc(0));
});

test('id two start', () => {
    let state = asTop(spaced([id('one'), id('two', true)]), idc(0));
    state = applyUpdate(state, handleKey(state, ' ', js)!);
    check(state, spaced([id('one'), id(''), id('two', true)]), idc(0));
});

test('id two mid', () => {
    let state = asTop(spaced([id('one'), id('two', true)]), idc(1));
    state = applyUpdate(state, handleKey(state, ' ', js)!);
    check(state, spaced([id('one'), id('t'), id('wo', true)]), idc(0));
});

test('list two start', () => {
    let state = asTop(spaced([id('one'), round([], true)]), listc('before'));
    state = applyUpdate(state, handleKey(state, ' ', js)!);
    check(state, spaced([id('one'), id(''), round([], true)]), listc('before'));
});

test('list two end', () => {
    let state = asTop(spaced([id('one'), round([], true)]), listc('after'));
    state = applyUpdate(state, handleKey(state, ' ', js)!);
    check(state, spaced([id('one'), round([]), id('', true)]), idc(0));
});

test('id one spaced end', () => {
    let state = asTop(spaced([id('one', true), id(''), id('two')]), idc(3));
    state = applyUpdate(state, handleKey(state, ' ', js)!);
    check(state, spaced([id('one'), id('', true), id('two')]), idc(0));
});
