import * as d2 from './dsl2';
import { asTop, id, idc, spaced } from '../keyboard/test-utils';
import { root } from '../keyboard/root';
import { lastChild } from '../keyboard/utils';

test('lol', () => {
    const state = asTop(id('hi'), idc(0));
    // const state = asTop(spaced([id('let'), id('x'), id('='), id('', true)]), idc(0));
    const rootNode = root(state, (idx) => [{ id: '', idx }]);
    const parsed = d2.expr(d2.just)({ nodes: [rootNode], loc: [] }, 0);
    expect(parsed).toEqual({
        type: 'finished',
        consumed: 1,
        result: {
            name: 'hi',
            type: 'var',
            src: { left: [{ id: '', idx: 0 }], right: [{ id: '', idx: 0 }] },
        },
    });
});

test('lettj', () => {
    // const state = asTop(id('hi'), idc(0));
    const state = asTop(spaced([id('let'), id('x'), id('='), id('', true)]), idc(0));
    const rootNode = root(state, (idx) => [{ id: '', idx }]);
    const parsed = d2.expr(d2.just)({ nodes: [rootNode], loc: [] }, 0);
    expect(parsed).toEqual({
        type: 'finished',
        consumed: 1,
        result: {
            name: 'hi',
            type: 'var',
            src: { left: [{ id: '', idx: 0 }], right: [{ id: '', idx: 0 }] },
        },
    });
});
