import { RecNodeT } from '../shared/cnodes';
import { applyUpdate } from './applyUpdate';
import { check } from './check.test';
import { handleKey } from './handleKey';
import { handleShiftNav, handleSpecial } from './handleShiftNav';
import { asTop, id, idc, lisp, text, textc, textcs, tspan } from './test-utils';
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

test('join stuffs', () => {
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
        textc(1, 0, 2, 1),
    );
});
