import * as d from './dsl';
import { Loc } from '../shared/cnodes';
import { asTop, id, idc, spaced } from '../keyboard/test-utils';
import { root } from '../keyboard/root';
import { lastChild } from '../keyboard/utils';

// test('match id', () => {
//     const node = id<Loc>('lol');
//     expect(d.match(d.id(null, d.idt), { matchers: {}, kwds: [], meta: {} }, { nodes: [node], loc: [] }, 0)).toEqual({
//         result: { data: node, consumed: 1 },
//         good: [node, []],
//         bad: [],
//     });
// });

test('lol', () => {
    const state = asTop(spaced([id('let'), id('x'), id('='), id('', true)]), idc(0));
    const rootNode = root(state, (idx) => [{ id: '', idx }]);
    const c: d.Ctx = {
        matchers: {
            stmt: d.list(
                'spaced',
                d.sequence(
                    [
                        d.kwd('let', () => null),
                        d.id(null, () => null),
                        d.kwd('=', () => null),
                        d.named(
                            'value',
                            d.id(null, () => null),
                        ),
                    ],
                    false,
                    () => null,
                ),
                () => null,
            ),
        },
        kwds: [],
        meta: {},
    };
    const parsed = d.parse(c.matchers.stmt, rootNode, c);
    expect(c.meta[lastChild(state.sel.start.path)]).toEqual({ placeholder: 'value' });
});

/*

things I want to test...

autocomplete, honestly.
and like, errors?
the 'endOfExhaustive' too probably

erhgm

So, what's the angle?

Also, should I ...

OH WAIT let's make sure comments are making sense. pleeeease.

anddd for fun lets do macros too.

does ... the AST need to know anything about comments? I don't think so? because formatting happens to the CST.
hmmm.
So, it's a smooshed, right? and we need to account for there already being a smooshed here. Yeah.


*/
