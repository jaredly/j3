// test stuff

import { splitGraphemes } from '../../src/parse/splitGraphemes';
import { applyUpdate } from '../keyboard/applyUpdate';
import { init } from '../keyboard/test-utils';
import { keyUpdate } from '../keyboard/ui/keyUpdate';

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

const parse = (text: string) => {
    let state = init;
    splitGraphemes(text).forEach((key) => {
        state = applyUpdate(state, keyUpdate(state, key, {}));
    });
    return state;
};

const pats = {
    'pattern var': ['hello', '23'],
    'pattern array': ['[]', '[one]', '[...one]', '[one,two,...three]'],
    'pattern default': ['x = 3 + 3', '[] = 3'],
    'pattern typed': ['one:int', '[one]:list'],
    'pattern constructor': ['Some(body)', 'Once([told,me])'],
    'pattern text': ['"Hi"', '"Hello ${name}"'],
};
