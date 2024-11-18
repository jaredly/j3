// let's test some operations

import { fromMap, RecNodeT } from '../shared/cnodes';
import { shape } from '../shared/shape';
import { applyUpdate } from './applyUpdate';
import { check } from './check.test';
import { handleKey } from './handleKey';
import { handleNav } from './handleNav';
import { asTop, id, idc, lisp, listc, round, smoosh, text } from './test-utils';
import { IdCursor } from './utils';

const testId = (init: RecNodeT<boolean>, cursor: IdCursor, out: RecNodeT<unknown>, text = '.') => {
    let state = asTop(init, cursor);
    const up = handleKey(state, text, lisp);
    state = applyUpdate(state, up);
    expect(shape(out)).toEqual(shape(fromMap(state.top.root, state.top.nodes, () => 0)));
};

// MARK: Text smooshed

// MARK: List smooshed, right?

test('list before pls', () => {
    let state = asTop(round([], true), listc('before'));
    state = applyUpdate(state, handleKey(state, 'A', lisp));
    check(state, smoosh([id('A', true), round([])]), idc(1));
});

test('list after', () => {
    let state = asTop(round([], true), listc('after'));
    state = applyUpdate(state, handleKey(state, 'A', lisp));
    check(state, smoosh([round([]), id('A', true)]), idc(1));
});

test('list smoosh end', () => {
    let state = asTop(smoosh([id('a'), round([], true)]), listc('after'));
    state = applyUpdate(state, handleKey(state, 'A', lisp));
    check(state, smoosh([id('a'), round([]), id('A', true)]), idc(1));
});

test('list smoosh start', () => {
    let state = asTop(smoosh([round([], true), id('a')]), listc('before'));
    state = applyUpdate(state, handleKey(state, 'A', lisp));
    check(state, smoosh([id('A', true), round([]), id('a')]), idc(1));
});

test('list insidesss', () => {
    let state = asTop(round([], true), listc('inside'));
    state = applyUpdate(state, handleKey(state, 'A', lisp));
    check(state, round([id('A', true)]), idc(1));
});

test('between twoo', () => {
    let state = asTop(smoosh([round([], true), round([])]), listc('after'));
    state = applyUpdate(state, handleKey(state, 'A', lisp));
    check(state, smoosh([round([]), id('A', true), round([])]), idc(1));
});

test('text after', () => {
    let state = asTop(id('hi', true), idc(2));
    state = applyUpdate(state, handleKey(state, '"', lisp));
    check(state, smoosh([id('hi'), text([], true)]), listc('inside'));
});

// MARK: Insert ID

test('same kind', () => {
    let state = asTop(id('hello', true), idc(2));
    state = applyUpdate(state, handleKey(state, 'A', lisp));
    check(state, id('heAllo', true), idc(3));
});

test('same kind punct', () => {
    let state = asTop(id('+++', true), idc(2));
    state = applyUpdate(state, handleKey(state, '=', lisp));
    check(state, id('++=+', true), idc(3));
});

test('start empty', () => {
    let state = asTop(id('', true), idc(0));
    state = applyUpdate(state, handleKey(state, '=', lisp));
    check(state, id('=', true), idc(1));
});

test('and smoosh', () => {
    let state = asTop(id('ab', true), idc(0));
    state = applyUpdate(state, handleKey(state, '=', lisp));
    check(state, smoosh([id('=', true), id('ab')]), idc(1));
});

test('smoosh to left', () => {
    let state = asTop(smoosh([id('#'), id('ab', true)]), idc(0));
    state = applyUpdate(state, handleKey(state, '=', lisp));
    check(state, smoosh([id('#=', true), id('ab')]), idc(2));
});

test('commit text change', () => {
    let state = asTop(round([id('hi', true)]), idc(2));
    state = applyUpdate(state, handleKey(state, 'A', lisp));
    state = applyUpdate(state, handleNav('ArrowRight', state));
    check(state, round([id('hiA')], true), listc('after'));
});

// MARK: Split smoosh

test('smoosh start (round)', () => {
    testId(
        //
        round([id('hello', true)]),
        { type: 'id', end: 0 },
        round([smoosh([id('.'), id('hello')])]),
    );
});

test('smoosh mid (round)', () => {
    testId(
        //
        round([id('hello', true)]),
        { type: 'id', end: 3 },
        round([smoosh([id('hel'), id('.'), id('lo')])]),
    );
});

test('smoosh end (round)', () => {
    testId(
        //
        round([id('hello', true)]),
        { type: 'id', end: 5 },
        round([smoosh([id('hello'), id('.')])]),
    );
});

test('smoosh start (smoosh)', () => {
    testId(
        //
        round([smoosh([id('hello', true), id('.')])]),
        { type: 'id', end: 0 },
        round([smoosh([id('.'), id('hello'), id('.')])]),
    );
});

test('smoosh start join (smoosh)', () => {
    testId(
        //
        round([smoosh([id('+'), id('hello', true), id('.')])]),
        { type: 'id', end: 0 },
        round([smoosh([id('+='), id('hello'), id('.')])]),
        '=',
    );
});

test('smoosh start list (smoosh)', () => {
    testId(
        //
        round([smoosh([round([]), id('hello', true)])]),
        { type: 'id', end: 0 },
        round([smoosh([round([]), id('.'), id('hello')])]),
    );
});

test('smoosh mid (smoosh)', () => {
    testId(
        //
        round([smoosh([id('hello', true), id('.')])]),
        { type: 'id', end: 3 },
        round([smoosh([id('hel'), id('.'), id('lo'), id('.')])]),
    );
});

test('smoosh end (smoosh)', () => {
    testId(
        //
        round([smoosh([id('.'), id('hello', true)])]),
        { type: 'id', end: 5 },
        round([smoosh([id('.'), id('hello'), id('.')])]),
    );
});

test('smoosh end join (smoosh)', () => {
    testId(
        //
        round([smoosh([id('.'), id('hello', true), id('+')])]),
        { type: 'id', end: 5 },
        round([smoosh([id('.'), id('hello'), id('=+')])]),
        '=',
    );
});

test('smoosh end list (smoosh)', () => {
    testId(
        //
        round([smoosh([id('hello', true), round([])])]),
        { type: 'id', end: 5 },
        round([smoosh([id('hello'), id('.'), round([])])]),
    );
});

test('comment out', () => {
    testId(
        //
        id('hello', true),
        { type: 'id', end: 0 },
        smoosh([id(';'), id('hello')]),
        ';',
    );
});
