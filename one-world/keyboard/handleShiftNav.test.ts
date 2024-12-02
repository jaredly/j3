import { RecNodeT } from '../shared/cnodes';
import { applyUpdate } from './applyUpdate';
import { check } from './check.test';
import { handleKey } from './handleKey';
import { handleShiftNav, handleSpecial } from './handleShiftNav';
import { asTop, id, idc, lisp, smoosh, text, textc, textcs, tspan } from './test-utils';
import { Cursor } from './utils';

const run = (name: string, [init, cursor]: [RecNodeT<boolean>, Cursor], key: string, [exp, ecursor]: [RecNodeT<boolean>, Cursor]) => {
    test(name, () => {
        let state = asTop(init, cursor);
        state = applyUpdate(state, handleShiftNav(state, key));
        check(state, exp, ecursor);
    });
};

run(
    'id shift-left',
    //
    [id('hi', true), idc(0)],
    'ArrowRight',
    [id('hi', true), idc(1, 0)],
);

test('id shift-left and write', () => {
    let state = asTop(id('hillo', true), idc(2));
    state = applyUpdate(state, handleShiftNav(state, 'ArrowRight'));
    state = applyUpdate(state, handleShiftNav(state, 'ArrowRight'));
    state = applyUpdate(state, handleKey(state, 'M', lisp));
    check(state, id('hiMo', true), idc(3));
});

test('id at smoosh boundary', () => {
    let state = asTop(smoosh([id('ab', true), id('+')]), idc(2));
    state = applyUpdate(state, handleShiftNav(state, 'ArrowRight'));
    check(state, smoosh([id('ab'), id('+', true)]), idc(1, 0));
});

test('id at smoosh boundary left', () => {
    let state = asTop(smoosh([id('ab'), id('+', true)]), idc(0));
    state = applyUpdate(state, handleShiftNav(state, 'ArrowLeft'));
    check(state, smoosh([id('ab', true), id('+')]), idc(1, 2));
});

test('bold no shift', () => {
    let state = asTop(text([tspan('hello')], true), textc(0, 2));
    state = applyUpdate(state, handleSpecial(state, 'b', { meta: true }));
    check(state, text([tspan('he'), tspan('', { fontWeight: 'bold' }), tspan('llo')], true), textcs(1, 0, 1, 0));
});

test('bold no shift at end', () => {
    let state = asTop(text([tspan('hello')], true), textc(0, 5));
    state = applyUpdate(state, handleSpecial(state, 'b', { meta: true }));
    check(state, text([tspan('hello'), tspan('', { fontWeight: 'bold' })], true), textcs(1, 0, 1, 0));
});

test('a little bold/underline', () => {
    let state = asTop(text([tspan('hello')], true), textc(0, 2));
    state = applyUpdate(state, handleShiftNav(state, 'ArrowRight'));
    state = applyUpdate(state, handleShiftNav(state, 'ArrowRight'));
    state = applyUpdate(state, handleSpecial(state, 'b', { meta: true }));
    state = applyUpdate(state, handleSpecial(state, 'u', { meta: true }));
    state = applyUpdate(state, handleSpecial(state, 'i', { meta: true }));
    check(state, text([tspan('he'), tspan('ll', { fontStyle: 'italic', fontWeight: 'bold', textDecoration: 'underline' }), tspan('o')], true), {
        ...textc(1, 2),
        start: { index: 1, cursor: 0 },
    });
});

test('undooo the boldliness', () => {
    let state = asTop(text([tspan('hello')], true), textc(0, 2));
    state = applyUpdate(state, handleShiftNav(state, 'ArrowRight'));
    state = applyUpdate(state, handleShiftNav(state, 'ArrowRight'));
    state = applyUpdate(state, handleSpecial(state, 'b', { meta: true }));
    state = applyUpdate(state, handleSpecial(state, 'u', { meta: true }));
    state = applyUpdate(state, handleSpecial(state, 'b', { meta: true }));
    state = applyUpdate(state, handleSpecial(state, 'u', { meta: true }));
    state = applyUpdate(state, handleSpecial(state, 'i', { meta: true }));
    state = applyUpdate(state, handleSpecial(state, 'i', { meta: true }));
    check(state, text([tspan('hello')], true), {
        ...textc(0, 4),
        start: { index: 0, cursor: 2 },
    });
});

test('join stuffs', () => {
    let state = asTop(text([tspan('hello folks')], true), textcs(0, 6, 0, 11));
    state = applyUpdate(state, handleSpecial(state, 'b', { meta: true }));
    check(state, text([tspan('hello '), tspan('folks', { fontWeight: 'bold' })], true), textcs(1, 5, 1, 0));
});

test('style across spans', () => {
    let state = asTop(text([tspan('ab'), tspan('cd', { fontWeight: 'bold' })], true), textcs(0, 1, 1, 1));
    state = applyUpdate(state, handleSpecial(state, 'i', { meta: true }));
    check(
        state,
        text(
            [
                tspan('a'),
                tspan('b', { fontStyle: 'italic' }),
                tspan('c', { fontWeight: 'bold', fontStyle: 'italic' }),
                tspan('d', { fontWeight: 'bold' }),
            ],
            true,
        ),
        textcs(2, 1, 1, 0),
    );
});

// MARK: text shift

test('right across span', () => {
    let state = asTop(text([tspan('ab'), tspan('cd')], true), textc(0, 2));
    state = applyUpdate(state, handleShiftNav(state, 'ArrowRight'));
    check(state, text([tspan('ab'), tspan('cd')], true), textcs(1, 1, 0, 2));
});

test('left across span', () => {
    let state = asTop(text([tspan('ab'), tspan('cd')], true), textc(1, 0));
    state = applyUpdate(state, handleShiftNav(state, 'ArrowLeft'));
    check(state, text([tspan('ab'), tspan('cd')], true), textcs(0, 1, 1, 0));
});
