import { RecNodeT } from '../shared/cnodes';
import { applyUpdate } from './applyUpdate';
import { check } from './check.test';
import { handleIdKey } from './handleIdKey';
import { handleKey } from './handleKey';
import { handleShiftId, handleShiftNav } from './handleShiftNav';
import { handleWrap } from './handleWrap';
import { asTop, curly, id, idc, lisp, listc, round, smoosh, square, text, textc } from './test-utils';
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
