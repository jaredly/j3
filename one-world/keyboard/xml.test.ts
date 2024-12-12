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
