// Ok now we find out if any of this works.

import { id, round, smoosh } from '../keyboard/test-utils';
import * as g from './gleam';

test('gleam please', () => {
    expect(g.parse(id('yolo'), g.expr)).toEqual({
        data: { kind: 'id', value: 'yolo' },
        error: [],
        consume: 1,
    });
});

test('named', () => {
    expect(g.parse(id('ho'), g.named('hi', g.id))?.data).toEqual({ hi: 'ho' });
});

test('id', () => {
    expect(g.parse(id('ho'), g.id)?.data).toEqual('ho');
    expect(g.parse(round([]), g.id)).toEqual(null);
});

test('matches', () => {
    expect(g.matches([g.named('one', g.id), g.id, g.list('round', g.id)])([id('a'), id('b'), round([])], 0)).toEqual({
        consume: 3,
        data: { one: 'a' },
        error: [],
    });
    expect(g.matches([g.named('one', g.id), g.id, g.list('round', g.id)])([id('a'), id('b')], 0)).toEqual(null);
});

test('multi', () => {
    expect(g.multi(g.id)([id('a'), id('b'), round([])], 0)).toEqual({
        consume: 2,
        data: ['a', 'b'],
        error: [],
    });
    // expect(g.matches([g.named('one', g.id), g.id, g.list('round', g.id)])([id('a'), id('b')], 0)).toEqual(null);
});

test('lets do some smooshes?', () => {
    expect(g.parse(smoosh([id('+'), id('hello'), round([id('123'), id('yes')]), id('.'), id('please')]), g.expr)).toEqual({
        data: { kind: 'id', value: 'yolo' },
        error: [],
    });
});
