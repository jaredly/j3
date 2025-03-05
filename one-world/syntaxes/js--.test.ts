import { splitGraphemes } from '../../src/parse/splitGraphemes';
import { root } from '../keyboard/root';
import { js } from '../keyboard/test-utils';
import { cread } from '../shared/creader';
import { ctx } from './dsl3';
import { parser } from './js--';
import { stmtToString } from './js--types';

const fixes = {
    // 'pattern var': ['hello', '23'],
    // 'pattern array': ['[]', '[one]', '[...one]', '[one,two,...three]'],
    'x = (3 + 3)': 'x = 3 + 3;',
    '[1,2,3]': '[1, 2, 3];',
    'if (x > 2) {true} else {false}': 'if (x > 2) { true; } else { false; }',
    '[...a]': '[...a];',
    'let quicksort = (a) => {[...a]}': 'let quicksort = (a) => { [...a]; };',
    // 'pattern typed': ['one:int', '[one]:list'],
    // 'pattern constructor': ['Some(body)', 'Once([told,me])'],
    // 'pattern text': ['"Hi"', '"Hello ${name}"'],
    // // how to do ... jsx?
    // 'expr jsx': ['</Hello\tinner', '</Hello hi\t\tinner'],
    // stmt: ['let x = 2', 'return 12', 'for (let x = 1;x<3;x++) {y}'],
};

const run = (input: string) => {
    const state = cread(splitGraphemes(input), js);
    const rt = root(state, (idx) => [{ id: '', idx }]);
    const res = parser.parse(rt);
    return res;
};

Object.entries(fixes).forEach(([input, output]) => {
    test(input, () => {
        expect(stmtToString(run(input)!.result!)).toEqual(output);
    });
});
