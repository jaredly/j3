// let's test some operations

import { applyUpdate } from './applyUpdate';
import { check } from './check.test';
import { handleDelete } from './handleDelete';
import { handleKey } from './handleKey';
import { handleNav } from './handleNav';
import { asTop, id, idc, js, lisp, list, listc, rich, round, smoosh, table, text, textc, tspan } from './test-utils';
import { keyUpdate } from './ui/keyUpdate';

test('xml before into tag', () => {
    let state = asTop(list({ type: 'tag', node: id('hello') })([], true), listc('before'));
    state = applyUpdate(state, keyUpdate(state, 'ArrowRight', {})!);
    check(state, list({ type: 'tag', node: id('hello', true) })([]), idc(0));
});

test('xml start', () => {
    let state = asTop(id('<', true, js), idc(1));
    state = applyUpdate(state, keyUpdate(state, '>', {})!);
    check(state, list({ type: 'tag', node: id('', true) })([]), idc(0));
});

test('xml out of start', () => {
    let state = asTop(list({ type: 'tag', node: id('hello', true) })([]), idc(0));
    state = applyUpdate(state, keyUpdate(state, 'ArrowLeft', {})!);
    check(state, list({ type: 'tag', node: id('hello') })([], true), listc('before'));
});

test('xml out of inner', () => {
    let state = asTop(list({ type: 'tag', node: id('hello') })([], true), listc('inside'));
    state = applyUpdate(state, keyUpdate(state, 'ArrowLeft', {})!);
    check(state, list({ type: 'tag', node: id('hello', true) })([]), idc(5));
});

test('xml out of child', () => {
    let state = asTop(list({ type: 'tag', node: id('hello') })([id('hi', true)]), idc(0));
    state = applyUpdate(state, keyUpdate(state, 'ArrowLeft', {})!);
    check(state, list({ type: 'tag', node: id('hello', true) })([id('hi')]), idc(5));
});
