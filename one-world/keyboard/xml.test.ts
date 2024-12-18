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
    state = applyUpdate(state, keyUpdate(state, '/', {})!);
    check(state, list({ type: 'tag', node: id('', true) })([id('')]), idc(0));
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

test('space inside xml just makes an id', () => {
    let state = asTop(list({ type: 'tag', node: id('hello') })([], true), listc('inside'));
    state = applyUpdate(state, keyUpdate(state, ' ', {})!);
    check(state, list({ type: 'tag', node: id('hello') })([id('', true)]), idc(0));
});

test('del inside xml rms the child', () => {
    let state = asTop(list({ type: 'tag', node: id('hello') })([id('', true)]), idc(0));
    state = applyUpdate(state, keyUpdate(state, 'Backspace', {})!);
    check(state, list({ type: 'tag', node: id('hello') })([], true), listc('inside'));
});

test('del inside empty xml moves the cursor', () => {
    let state = asTop(list({ type: 'tag', node: id('hello') })([], true), listc('inside'));
    state = applyUpdate(state, keyUpdate(state, 'Backspace', {})!);
    check(state, list({ type: 'tag', node: id('hello', true) })([]), idc(5));
});

test('del tag del node', () => {
    let state = asTop(list({ type: 'tag', node: id('', true) })([]), idc(0));
    state = applyUpdate(state, keyUpdate(state, 'Backspace', {})!);
    check(state, id('', true), idc(0));
});

test('lets do some attribute', () => {
    let state = asTop(list({ type: 'tag', node: id('hello', true) })([]), idc(5));
    state = applyUpdate(state, keyUpdate(state, ' ', {})!);
    check(state, list({ type: 'tag', node: id('hello'), attributes: table('curly', [], true) })([]), listc('inside'));
});

test('lets do a dot', () => {
    let state = asTop(list({ type: 'tag', node: id('hello', true) })([]), idc(5));
    state = applyUpdate(state, keyUpdate(state, '.', {})!);
    check(state, list({ type: 'tag', node: smoosh([id('hello'), id('.', true)]) })([]), idc(1));
});

test('del in tag', () => {
    let state = asTop(list({ type: 'tag', node: smoosh([id('hello'), id('.', true)]), attributes: id('lol') })([]), idc(1));
    state = applyUpdate(state, keyUpdate(state, 'Backspace', {}, undefined, lisp)!);
    check(state, list({ type: 'tag', node: id('hello', true), attributes: id('lol') })([]), idc(5));
});

test('attributes del', () => {
    let state = asTop(list({ type: 'tag', node: id('hello', true), attributes: table('curly', [], true) })([]), listc('inside'));
    state = applyUpdate(state, keyUpdate(state, 'Backspace', {})!);
    check(state, list({ type: 'tag', node: id('hello', true) })([]), idc(5));
});

test('attributes write', () => {
    let state = asTop(list({ type: 'tag', node: id('hello'), attributes: table('curly', [], true) })([]), listc('inside'));
    state = applyUpdate(state, keyUpdate(state, 'a', {})!);
    check(state, list({ type: 'tag', node: id('hello'), attributes: table('curly', [[id('a', true)]]) })([]), idc(1));
});

test('> to get to end of childless', () => {
    let state = asTop(list({ type: 'tag', node: id('hello', true) })([]), idc(5));
    state = applyUpdate(state, keyUpdate(state, '>', {})!);
    check(state, list({ type: 'tag', node: id('hello') })([], true), listc('after'));
});

test('> to get inside childful', () => {
    let state = asTop(list({ type: 'tag', node: id('hello', true) })([id('hi')]), idc(5));
    state = applyUpdate(state, keyUpdate(state, '>', {})!);
    check(state, list({ type: 'tag', node: id('hello') })([id('hi', true)]), idc(0));
});

// test('<hello> should make it happen pls', () => {
//     let state = asTop(smoosh([id('<'), id('hello')]), idc(5));
//     state = applyUpdate(state, keyUpdate(state, '>', {})!);
//     check(state, list({ type: 'tag', node: id('hello') })([id('hi', true)]), idc(0));
// });
