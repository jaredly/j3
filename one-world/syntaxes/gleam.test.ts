// Ok now we find out if any of this works.

import { id, js, round, smoosh } from '../keyboard/test-utils';
import { RecNode } from '../shared/cnodes';
// import * as g from './gleam';
import * as g from './gleam2';
import * as d from './dsl';
import { Matcher, MatchError } from './dsl';
import { cread } from '../shared/creader';
import { splitGraphemes } from '../../src/parse/splitGraphemes';
import { root } from '../keyboard/root';

const ctx: d.Ctx = { matchers: g.matchers, kwds: g.kwds };

test('long thing', () => {
    const text = 'let x = nide.s + 32 / 3 - 5 ^ 2 + if x > 2 {2} else {4} - (fn(x) {x - 2})(5)';
    const state = cread(splitGraphemes(text), js);
    const gleam = d.parse(
        g.matchers.stmt,
        root(state, (idx) => [{ id: '', idx }]),
        { matchers: g.matchers, kwds: g.kwds },
    );
    expect(gleam.bads).toEqual([]);
});

// test('gleam id', () => {
//     expect(d.parse(g.matchers.expr, id('yolo'), ctx).result).toEqual({ type: 'local', name: 'yolo' });
// });

// test('attr pls', () => {
//     const attr = id('please', null as any, undefined, { type: 'toplevel', kind: 'attribute', loc: { id: '', idx: 0 } });
//     const pres = d.parse(g.matchers.expr, smoosh([id('hello'), id('.'), attr]), ctx);

//     expect(pres.bads).toEqual([]);
//     expect(pres.result).toEqual({
//         type: 'smooshed',
//         prefixes: [],
//         base: { type: 'local', name: 'hello' },
//         suffixes: [{ type: 'attribute', attr: attr }],
//     });
// });

// test('attr wrong kind...', () => {
//     const attr = id<any>('please');
//     const pres = d.parse(g.matchers.expr, smoosh([id('hello'), id('.'), attr]), ctx);

//     expect(pres.bads).toEqual([]);
//     expect(pres.result).toEqual({
//         type: 'smooshed',
//         prefixes: [],
//         base: { type: 'local', name: 'hello' },
//         suffixes: [{ type: 'attribute', attr: attr }],
//     });
// });

// test('lets do some smooshes?', () => {
//     const plus = id<any>('+');
//     const pres = d.parse(g.matchers.expr, smoosh([plus, id('hello'), round([id('123'), id('yes')])]), ctx);

//     expect(pres.bads).toEqual([]);
//     expect(pres.result).toEqual({
//         type: 'smooshed',
//         prefixes: [plus],
//         base: { type: 'local', name: 'hello' },
//         suffixes: [
//             {
//                 type: 'call',
//                 items: [
//                     { type: 'local', name: '123' },
//                     { type: 'local', name: 'yes' },
//                 ],
//             },
//         ],
//     });
// });

// test('gleam please', () => {
//     expect(g.parse(id('yolo'), g.expr)).toEqual({
//         data: { kind: 'id', value: 'yolo' },
//         error: [],
//         consume: 1,
//     });
// });

// test('named', () => {
//     expect(g.parse(id('ho'), g.named('hi', g.id))?.data).toEqual({ hi: 'ho' });
// });

// test('id', () => {
//     expect(g.parse(id('ho'), g.id)?.data).toEqual('ho');
//     expect(g.parse(round([]), g.id)).toEqual(null);
// });

// test('matches', () => {
//     expect(g.matches([g.named('one', g.id), g.id, g.list('round', g.id)])([id('a'), id('b'), round([])], 0)).toEqual({
//         consume: 3,
//         data: { one: 'a' },
//         error: [],
//     });
//     expect(g.matches([g.named('one', g.id), g.id, g.list('round', g.id)])([id('a'), id('b')], 0)).toEqual(null);
// });

// test('multi', () => {
//     expect(g.multi(g.id)([id('a'), id('b'), round([])], 0)).toEqual({
//         consume: 2,
//         data: ['a', 'b'],
//         error: [],
//     });
//     // expect(g.matches([g.named('one', g.id), g.id, g.list('round', g.id)])([id('a'), id('b')], 0)).toEqual(null);
// });

// test('lets do some smooshes?', () => {
//     expect(g.parse(smoosh([id('+'), id('hello'), round([id('123'), id('yes')]), id('.'), id('please')]), g.expr)).toEqual({
//         data: { kind: 'id', value: 'yolo' },
//         error: [],
//     });
// });
