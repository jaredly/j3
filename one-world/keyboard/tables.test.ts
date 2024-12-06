// let's test some operations

import { applyUpdate } from './applyUpdate';
import { check } from './check.test';
import { handleDelete } from './handleDelete';
import { handleKey } from './handleKey';
import { handleNav } from './handleNav';
import { asTop, id, idc, lisp, list, listc, round, smoosh, table, text, textc, tspan } from './test-utils';

test('table pls', () => {
    let state = asTop(round([], true), listc('inside'));
    state = applyUpdate(state, handleKey(state, '|', lisp)!);
    check(state, table('round', [], true), listc('inside'));
});

test('table w/ blank', () => {
    let state = asTop(round([id('', true)]), idc(0));
    state = applyUpdate(state, handleKey(state, '|', lisp)!);
    check(state, table('round', [[id('', true)]]), idc(0));
});

test('table n stuff', () => {
    let state = asTop(round([id('hi', true)]), idc(0));
    state = applyUpdate(state, handleKey(state, '|', lisp)!);
    check(state, table('round', [[id('hi', true)]]), idc(0));
});
