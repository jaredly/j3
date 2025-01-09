// let's test some operations

import { splitGraphemes } from '../../src/parse/splitGraphemes';
import { fromMap, RecNodeT } from '../shared/cnodes';
import { cread } from '../shared/creader';
import { shape } from '../shared/shape';
import { applySel, applyUpdate } from './applyUpdate';
import { check } from './check.test';
import { handleDelete } from './handleDelete';
import { handleKey } from './handleKey';
import { handleNav } from './handleNav';
import { asTop, Config, id, idc, js, lisp, listc, round, smoosh, spaced, text } from './test-utils';
import { keyUpdate } from './ui/keyUpdate';
import { IdCursor } from './utils';

const testId = (init: RecNodeT<boolean>, cursor: IdCursor, out: RecNodeT<unknown>, text = '.', config: Config = js) => {
    let state = asTop(init, cursor);
    const up = handleKey(state, text, config);
    state = applyUpdate(state, up);
    expect(shape(fromMap(state.top.root, state.top.nodes, () => 0))).toEqual(shape(out));
};

// MARK: Text smooshed

// MARK: List smooshed, right?

test('list before pls', () => {
    let state = asTop(round([], true), listc('before'));
    state = applyUpdate(state, handleKey(state, 'A', js));
    check(state, smoosh([id('A', true), round([])]), idc(1));
});

test('list after', () => {
    let state = asTop(round([], true), listc('after'));
    state = applyUpdate(state, handleKey(state, 'A', js));
    check(state, smoosh([round([]), id('A', true)]), idc(1));
});

test('list smoosh end', () => {
    let state = asTop(smoosh([id('a'), round([], true)]), listc('after'));
    state = applyUpdate(state, handleKey(state, 'A', js));
    check(state, smoosh([id('a'), round([]), id('A', true)]), idc(1));
});

test('list smoosh start', () => {
    let state = asTop(smoosh([round([], true), id('a')]), listc('before'));
    state = applyUpdate(state, handleKey(state, 'A', js));
    check(state, smoosh([id('A', true), round([]), id('a')]), idc(1));
});

test('list insidesss', () => {
    let state = asTop(round([], true), listc('inside'));
    state = applyUpdate(state, handleKey(state, 'A', js));
    check(state, round([id('A', true)]), idc(1));
});

test('between twoo', () => {
    let state = asTop(smoosh([round([], true), round([])]), listc('after'));
    state = applyUpdate(state, handleKey(state, 'A', js));
    check(state, smoosh([round([]), id('A', true), round([])]), idc(1));
});

test('text after', () => {
    let state = asTop(id('hi', true), idc(2));
    state = applyUpdate(state, handleKey(state, '"', js));
    check(state, smoosh([id('hi'), text([], true)]), listc('inside'));
});

// MARK: Insert ID

test('same kind', () => {
    let state = asTop(id('hello', true), idc(2));
    state = applyUpdate(state, handleKey(state, 'A', js));
    check(state, id('heAllo', true), idc(3));
});

test('same kind punct', () => {
    let state = asTop(id('+++', true), idc(2));
    state = applyUpdate(state, handleKey(state, '=', js));
    check(state, id('++=+', true), idc(3));
});

test('start empty', () => {
    let state = asTop(id('', true), idc(0));
    state = applyUpdate(state, handleKey(state, '=', js));
    check(state, id('=', true), idc(1));
});

test('and smoosh', () => {
    let state = asTop(id('ab', true), idc(0));
    state = applyUpdate(state, handleKey(state, '=', js));
    check(state, smoosh([id('=', true), id('ab')]), idc(1));
});

test('smoosh to left', () => {
    let state = asTop(smoosh([id('#'), id('ab', true)]), idc(0));
    state = applyUpdate(state, handleKey(state, '=', js));
    check(state, smoosh([id('#=', true), id('ab')]), idc(2));
});

test('commit text change', () => {
    let state = asTop(round([id('hi', true)]), idc(2));
    state = applyUpdate(state, handleKey(state, 'A', js));
    state = applySel(state, handleNav('ArrowRight', state));
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
        smoosh([id(';', undefined, lisp), id('hello')]),
        ';',
        lisp,
    );
});

test('close it up spaced', () => {
    let state = asTop(id('i', true), idc(1));
    state = applyUpdate(state, handleKey(state, 'f', js));
    state = applyUpdate(state, handleKey(state, ' ', js));
    check(state, spaced([id('if'), id('', true)]), idc(0));
});

test('after list', () => {
    let state = asTop(round([id('')], true), listc('after'));
    state = applyUpdate(state, handleKey(state, 'a', js));
    check(state, smoosh([round([id('')]), id('a', true)]), idc(1));
});

test('newline list', () => {
    let state = asTop(round([], true), listc('inside'));
    state = applyUpdate(state, handleKey(state, '\n', js));
    check(state, round([id('', true)], false, true), idc(0));
});

test('newline list id', () => {
    let state = asTop(round([id('', true)]), idc(0));
    state = applyUpdate(state, handleKey(state, '\n', js));
    check(state, round([id('', true)], false, true), idc(0));
});

test('newline list 2', () => {
    let state = asTop(round([id('a', true)]), idc(1));
    state = applyUpdate(state, handleKey(state, '\n', js));
    check(state, round([id('a'), id('', true)], false, true), idc(0));
});

test('backspace in multiline unforces it', () => {
    let state = asTop(round([id('', true)], false, true), idc(0));
    state = applyUpdate(state, handleDelete(state));
    check(state, round([id('', true)]), idc(0));
});

// hmmm.
//
/*
so, the smooshing of it.

*/

test('decimal pls', () => {
    let state = asTop(id('2', true), idc(1));
    state = applyUpdate(state, handleKey(state, '.', js));
    check(state, id('2.', true), idc(2));
});

test('dot to decimal', () => {
    let state = asTop(id('.', true), idc(1));
    state = applyUpdate(state, handleKey(state, '2', js));
    check(state, id('.2', true), idc(2));
});

test('num and such', () => {
    let state = asTop(id('2', true), { type: 'id', end: 2, text: ['2', '3'] });
    state = applyUpdate(state, handleKey(state, '.', js));
    check(state, id('23.', true), idc(3));
});

test('num and smoosh', () => {
    let state = asTop(id('a', true, js), idc(1));
    state = applyUpdate(state, handleKey(state, '.', js));
    state = applyUpdate(state, handleKey(state, '2', js));
    check(state, smoosh([id('a'), id('.', false, js), id('2', true)]), idc(1));
});

test('num and num', () => {
    let state = asTop(smoosh([id('a'), id('.'), id('2', true)]), idc(1));
    state = applyUpdate(state, handleKey(state, '.', js));
    check(state, smoosh([id('a'), id('.'), id('2'), id('.', true)]), idc(1));
});

test('plus decimal', () => {
    let state = asTop(smoosh([id('+'), id('23', true)]), idc(2));
    state = applyUpdate(state, handleKey(state, '.', js));
    check(state, smoosh([id('+'), id('23.', true)]), idc(3));
});

test('fn(x)', () => {
    let state = asTop(id('f', true), { type: 'id', end: 2, text: ['f', 'n'] });
    state = applyUpdate(state, keyUpdate(state, '(', {}, undefined, js));
    check(state, smoosh([id('fn'), round([], true)]), listc('inside'));
});

test('localhost', () => {
    let state = cread(splitGraphemes('127.0.0.1'), js);
    check(state, id('127.0.0.1', true), idc(9));
});

test('localhost', () => {
    let state = cread(splitGraphemes('127.a.c.1'), js);
    check(state, id('127.a.c.1', true), idc(9));
});
