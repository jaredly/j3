import { id, idt, match } from './dsl';
import * as t from '../keyboard/test-utils';
import { Loc } from '../shared/cnodes';

test('match id', () => {
    const node = t.id<Loc>('lol');
    expect(match(id(null, idt), { matchers: {}, kwds: [], meta: {} }, { nodes: [node], loc: [] }, 0)).toEqual({
        result: { data: node, consumed: 1 },
        good: [node, []],
        bad: [],
    });
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
