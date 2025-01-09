import * as d2 from './dsl2';
import { asTop, id, idc, spaced } from '../keyboard/test-utils';
import { root } from '../keyboard/root';
import { lastChild } from '../keyboard/utils';
import { Src } from '../keyboard/handleShiftNav';

const src = (idx: number, last = idx): Src => ({ left: [{ id: '', idx }], right: [{ id: '', idx: last }] });

test('id', () => {
    const state = asTop(id('hi'), idc(0));
    // const state = asTop(spaced([id('let'), id('x'), id('='), id('', true)]), idc(0));
    const rootNode = root(state, (idx) => [{ id: '', idx }]);
    const parsed = d2.expr(d2.just).match({ nodes: [rootNode], loc: [] }, 0, d2.ictx);
    if (parsed.type === 'match') {
        expect(parsed.result).toEqual({
            consumed: 1,
            result: {
                name: 'hi',
                type: 'var',
                src: src(0),
            },
        });
    }
});

test('let stmt', () => {
    const state = asTop(spaced([id('let'), id('x'), id('='), id('', true)]), idc(0));
    const rootNode = root(state, (idx) => [{ id: '', idx }]);
    const parsed = d2.stmt(d2.just).match({ nodes: [rootNode], loc: [] }, 0, d2.ictx);
    if (parsed.type === 'match') {
        expect(parsed.ctx.bad).toEqual([]);
        // expect(parsed.ctx.path.map((m) => m.describe())).toEqual([]);
        expect(parsed.result).toEqual({
            consumed: 1,
            result: {
                pat: { type: 'var', name: 'x', src: src(2) },
                type: 'let',
                value: { type: 'var', name: '', src: src(4) },
                src: src(1, 4),
            },
        });
    } else {
        expect(parsed).toMatchObject({ type: 'match' });
    }
});

test.skip('let missing', () => {
    const state = asTop(spaced([id('let'), id('x'), id('=')]), idc(0));
    const rootNode = root(state, (idx) => [{ id: '', idx }]);
    const parsed = d2.stmt(d2.just).match({ nodes: [rootNode], loc: [] }, 0, d2.ictx);
    if (parsed.type === 'matcher') throw new Error('incomplete');
    expect(parsed.ctx.path.map((p) => p.describe())).toEqual([]);
    expect(parsed).toEqual({
        type: 'failed',
    });
});
