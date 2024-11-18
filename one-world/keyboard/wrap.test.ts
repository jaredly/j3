import { applyUpdate } from './applyUpdate';
import { check } from './check.test';
import { handleKey } from './handleKey';
import { handleWrap } from './handleWrap';
import { asTop, id, idc, round } from './test-utils';

test('hello', () => {
    let state = asTop(id('', true), idc(0));
    state = applyUpdate(state, handleWrap(state, '('));
    check(state, round([id('', true)]), idc(0));
});
