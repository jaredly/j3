import { RecNodeT } from '../shared/cnodes';
import { applyUpdate } from './applyUpdate';
import { check } from './check.test';
import { handleIdKey } from './handleIdKey';
import { handleKey } from './handleKey';
import { handleShiftId, handleShiftNav, handleSpecial } from './handleShiftNav';
import { handleWrap } from './handleWrap';
import { asTop, curly, id, idc, lisp, listc, round, smoosh, square, text, textc, tspan } from './test-utils';
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
    check(state, text([tspan('he'), tspan('ll', { fontWeight: 'bold', textDecoration: 'underline' }), tspan('o')], true), {
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
    check(state, text([tspan('he'), tspan('ll'), tspan('o')], true), {
        ...textc(1, 2),
        start: { index: 1, cursor: 0 },
    });
});
