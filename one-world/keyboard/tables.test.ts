// let's test some operations

import { applyUpdate } from './applyUpdate';
import { check } from './check.test';
import { handleDelete } from './handleDelete';
import { handleKey } from './handleKey';
import { handleNav } from './handleNav';
import { asTop, id, idc, js, lisp, list, listc, rich, round, smoosh, table, text, textc, tspan } from './test-utils';
import { keyUpdate } from './ui/keyUpdate';

test('table pls', () => {
    let state = asTop(round([], true), listc('inside'));
    state = applyUpdate(state, handleKey(state, ':', lisp)!);
    check(state, table('round', [], true), listc('inside'));
});

test('table w/ blank', () => {
    let state = asTop(round([id('', true)]), idc(0));
    state = applyUpdate(state, handleKey(state, ':', lisp)!);
    check(state, table('round', [[id('', true)]]), idc(0));
});

test('table w/ empty', () => {
    let state = asTop(table('round', [], true), listc('inside'));
    state = applyUpdate(state, handleKey(state, 'a', lisp)!);
    check(state, table('round', [[id('a', true)]]), idc(1));
});

test('table n stuff', () => {
    let state = asTop(round([id('hi', true)]), idc(0));
    state = applyUpdate(state, handleKey(state, ':', lisp)!);
    check(state, table('round', [[id('hi', true)]]), idc(0));
});

test('table to before', () => {
    let state = asTop(table('round', [[id('hi', true)]]), idc(0));
    state = applyUpdate(state, handleNav('ArrowLeft', state)!);
    check(state, table('round', [[id('hi')]], true), listc('before'));
});

test('table to after', () => {
    let state = asTop(table('round', [[id('hi', true)]]), idc(2));
    state = applyUpdate(state, handleNav('ArrowRight', state)!);
    check(state, table('round', [[id('hi')]], true), listc('after'));
});

test('table into start', () => {
    let state = asTop(table('round', [[id('hi')]], true), listc('before'));
    state = applyUpdate(state, handleNav('ArrowRight', state)!);
    check(state, table('round', [[id('hi', true)]]), idc(0));
});

test('table into start empty', () => {
    let state = asTop(table('round', [], true), listc('before'));
    state = applyUpdate(state, handleNav('ArrowRight', state)!);
    check(state, table('round', [], true), listc('inside'));
});

test('table into end', () => {
    let state = asTop(table('round', [[id('hi')]], true), listc('after'));
    state = applyUpdate(state, handleNav('ArrowLeft', state)!);
    check(state, table('round', [[id('hi', true)]]), idc(2));
});

test('table into end empty', () => {
    let state = asTop(table('round', [], true), listc('after'));
    state = applyUpdate(state, handleNav('ArrowLeft', state)!);
    check(state, table('round', [], true), listc('inside'));
});

test('table add colukmn', () => {
    let state = asTop(table('round', [[id('hi', true)]]), idc(2));
    state = applyUpdate(state, handleKey(state, ':', js)!);
    check(state, table('round', [[id('hi'), id('', true)]]), idc(0));
});

test('table add row', () => {
    let state = asTop(table('round', [[id('hi', true)]]), idc(2));
    state = applyUpdate(state, handleKey(state, ';', js)!);
    check(state, table('round', [[id('hi')], [id('', true)]]), idc(0));
});

test('table add row - two cells', () => {
    let state = asTop(table('round', [[id('hi'), id('', true)]]), idc(0));
    state = applyUpdate(state, handleKey(state, ';', js)!);
    check(
        state,
        table('round', [
            [id('hi'), id('')],
            [id('', true), id('')],
        ]),
        idc(0),
    );
});

test('table nav between columns', () => {
    let state = asTop(table('round', [[id('hi', true), id('ho')]]), idc(2));
    state = applyUpdate(state, handleNav('ArrowRight', state)!);
    check(state, table('round', [[id('hi'), id('ho', true)]]), idc(0));
});

test('table nav between rows', () => {
    let state = asTop(table('round', [[id('hi'), id('ho', true)], [id('hm')]]), idc(2));
    state = applyUpdate(state, handleNav('ArrowRight', state)!);
    check(state, table('round', [[id('hi'), id('ho')], [id('hm', true)]]), idc(0));
});

test('table nav left between columns', () => {
    let state = asTop(table('round', [[id('hi'), id('ho', true)]]), idc(0));
    state = applyUpdate(state, handleNav('ArrowLeft', state)!);
    check(state, table('round', [[id('hi', true), id('ho')]]), idc(2));
});

test('table nav left between rows', () => {
    let state = asTop(table('round', [[id('hi'), id('ho')], [id('hm', true)]]), idc(0));
    state = applyUpdate(state, handleNav('ArrowLeft', state)!);
    check(state, table('round', [[id('hi'), id('ho', true)], [id('hm')]]), idc(2));
});

test('table del column', () => {
    let state = asTop(table('round', [[id('hi'), id('', true)]]), idc(0));
    state = applyUpdate(state, handleDelete(state)!);
    check(state, table('round', [[id('hi', true)]]), idc(2));
});

test('table del column join', () => {
    let state = asTop(table('round', [[id('hi'), id('ho', true)]]), idc(0));
    state = applyUpdate(state, handleDelete(state)!);
    check(state, table('round', [[id('hiho', true)]]), idc(2));
});

test('table del row? join', () => {
    let state = asTop(table('round', [[id('a'), id('hi')], [id('ho', true)]]), idc(0));
    state = applyUpdate(state, handleDelete(state)!);
    check(state, table('round', [[id('a'), id('hiho', true)]]), idc(2));
});

test('table del row? join smoosh', () => {
    let state = asTop(table('round', [[id('a'), id('hi')], [smoosh([id('ho', true), id('+')])]]), idc(0));
    state = applyUpdate(state, handleDelete(state)!);
    check(state, table('round', [[id('a'), smoosh([id('hiho', true), id('+')])]]), idc(2));
});

test('table del row? join double smoosh', () => {
    let state = asTop(table('round', [[id('a'), smoosh([id('+'), id('hi')])], [smoosh([id('ho', true), id('+')])]]), idc(0));
    state = applyUpdate(state, handleDelete(state)!);
    check(state, table('round', [[id('a'), smoosh([id('+'), id('hiho', true), id('+')])]]), idc(2));
});

test('tab into table', () => {
    let state = asTop(table('round', [[id('')]], true), listc('before'));
    state = applyUpdate(state, keyUpdate(state, 'Tab', {})!);
    check(state, table('round', [[id('', true)]]), idc(0));
});

test('rich table enter in text', () => {
    let state = asTop(table({ type: 'rich' }, [[id(''), text([tspan('hi')], true)]]), textc(0, 2));
    state = applyUpdate(state, keyUpdate(state, '\n', {})!);
    check(
        state,
        table({ type: 'rich' }, [
            [id(''), text([tspan('hi')])],
            [text([tspan('')], true), text([tspan('')])],
        ]),
        textc(0, 0),
    );
});

test('rich table delete row', () => {
    let state = asTop(table({ type: 'rich' }, [[text([tspan('hi')])], [text([tspan('')], true)]]), textc(0, 0));
    state = applyUpdate(state, keyUpdate(state, 'Backspace', {})!);
    state = applyUpdate(state, keyUpdate(state, 'Backspace', {})!);
    check(state, table({ type: 'rich' }, [[text([tspan('hi')], true)]]), textc(0, 2));
});
