// test stuff

import { splitGraphemes } from '../../src/parse/splitGraphemes';
import { applyUpdate } from '../keyboard/applyUpdate';
import { root } from '../keyboard/root';
import { init, js } from '../keyboard/test-utils';
import { keyUpdate } from '../keyboard/ui/keyUpdate';
import { cread } from '../shared/creader';
import { match, rules } from './dsl3';

/*

Kinds of errors:
- "this is an extra node at the end of a ~list"
- "this is an extra thing at the end of a star that we couldn't handle" (WAIT I think this is already covered)
  - if we're in a star, and the inner thing is a "single", then we can just skip one.
    otherwise, maybe we bail? yeah that sounds cool. means we can have an invalid item in like an array, and keep going past it
- "this node didn't match (rule or rules) at path... (maybe show just the last ~few rules of traceback?)"

BTW at certain points, like `expr` and `stmt`, I want to have a "bail" case,
where parsing "continues successfully" and just reports that the expr was an error.

*/

const pats = {
    'pattern var': ['hello', '23'],
    'pattern array': ['[]', '[one]', '[...one]', '[one,two,...three]'],
    'pattern default': ['x = 3 + 3', '[] = 3'],
    'pattern typed': ['one:int', '[one]:list'],
    'pattern constructor': ['Some(body)', 'Once([told,me])'],
    'pattern text': ['"Hi"', '"Hello ${name}"'],
};

// hm
// so, Type<constructors> vs <jsx>.
// currently I'm doing <> to jsx, but maybe I want </ ?
// and then <> would be for the list?

Object.entries(pats).forEach(([key, values]) => {
    values.forEach((value) => {
        test(`${key} + ${value}`, () => {
            const state = cread(splitGraphemes(value), js);
            const rt = root(state, (idx) => [{ id: '', idx }]);
            const res = match(
                { type: 'ref', name: key },
                {
                    rules,
                    ref(name) {
                        // throw new Error('reff toplevel ' + name);
                        if (!this.scope) throw new Error(`no  scope`);
                        return this.scope[name];
                    },
                },
                { nodes: [rt], loc: [] },
                0,
            );
            expect(res?.consumed).toEqual(1);
        });
    });
});
