// test stuff

import { splitGraphemes } from '../../src/parse/splitGraphemes';
import { applyUpdate } from '../keyboard/applyUpdate';
import { root } from '../keyboard/root';
import { init, js } from '../keyboard/test-utils';
import { keyUpdate } from '../keyboard/ui/keyUpdate';
import { cread } from '../shared/creader';
import { Ctx, match, rules } from './dsl3';

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

const ctx: Ctx = {
    rules,
    ref(name) {
        if (!this.scope) throw new Error(`no  scope`);
        return this.scope[name];
    },
};

const fixes = {
    // 'pattern var': ['hello', '23'],
    // 'pattern array': ['[]', '[one]', '[...one]', '[one,two,...three]'],
    'pattern default': ['x = 3 + 3', '[] = 3'],
    'pattern typed': ['one:int', '[one]:list'],
    'pattern constructor': ['Some(body)', 'Once([told,me])'],
    'pattern text': ['"Hi"', '"Hello ${name}"'],
    // how to do ... jsx?
    'expr jsx': ['<>Hello\tinner', '<>Hello hi\t\tinner'],
    stmt: ['let x = 2', 'return 12', 'for (let x = 1;x<3;x++) {y}'],
};

const run = (input: string, matcher: string) => {
    const state = cread(splitGraphemes(input), js);
    const rt = root(state, (idx) => [{ id: '', idx }]);
    const res = match({ type: 'ref', name: matcher }, ctx, { nodes: [rt], loc: [] }, 0);
    return res;
};

Object.entries(fixes).forEach(([key, values]) => {
    values.forEach((value) => {
        test(`${key} + ${value}`, () => {
            expect(run(value, key)?.consumed).toEqual(1);
        });
    });
});

test('pattern var', () => {
    expect(run('hello', 'pattern var')?.value).toMatchObject({ type: 'var', name: 'hello' });
    expect(run('23', 'pattern var')?.value).toMatchObject({ type: 'var', name: '23' });
});

test('pattern array', () => {
    expect(run('[]', 'pattern array')?.value).toMatchObject({ type: 'array', values: [] });
    expect(run('[one]', 'pattern array')?.value).toMatchObject({ type: 'array', values: [{ type: 'var', name: 'one' }] });
    expect(run('[...one]', 'pattern array')?.value).toMatchObject({
        type: 'array',
        values: [{ type: 'spread', inner: { type: 'var', name: 'one' } }],
    });
    expect(run('[one,two,...three]', 'pattern array')?.value).toMatchObject({
        type: 'array',
        values: [
            { type: 'var', name: 'one' },
            { type: 'var', name: 'two' },
            { type: 'spread', inner: { type: 'var', name: 'three' } },
        ],
    });
});

test('pattern default', () => {
    expect(run('x = 3 + 4', 'pattern default')?.value).toMatchObject({
        type: 'default',
        inner: { type: 'var', name: 'x' },
        value: {
            type: 'call',
            target: { type: 'var', name: '+' },
            args: [
                { type: 'var', name: '3' },
                { type: 'var', name: '4' },
            ],
        },
    });

    expect(run('[] = 3', 'pattern default')?.value).toMatchObject({
        type: 'default',
        inner: { type: 'array', values: [] },
        value: { type: 'var', name: '3' },
    });
});

test('pattern typed', () => {
    expect(run('one:int', 'pattern typed')?.value).toMatchObject({
        type: 'typed',
        ann: { type: 'ref', name: 'int' },
        inner: { type: 'var', name: 'one' },
    });
});

test('pattern constructor', () => {
    expect(run('Some(body,[once])', 'pattern constructor')?.value).toMatchObject({
        type: 'constr',
        constr: { type: 'id', text: 'Some' },
        args: [
            { type: 'var', name: 'body' },
            { type: 'array', values: [{ type: 'var', name: 'once' }] },
        ],
    });
});

test('pattern text', () => {
    expect(run('"Hello ${name}"', 'pattern text')?.value).toMatchObject({
        type: 'text',
        spans: [
            { type: 'text', text: 'Hello ' },
            { type: 'embed', item: { type: 'var', name: 'name' } },
        ],
    });
});

test.only('expr jsx', () => {
    // expect(run('<>Hello\tinner', 'expr jsx')?.value).toMatchObject({
    //     type: 'jsx',
    //     tag: { type: 'var', name: 'Hello' },
    //     attributes: undefined,
    //     children: [{ type: 'var', name: 'inner' }],
    // });

    expect(run('<>Hello hello:folks\t\tinner', 'expr jsx')?.value).toMatchObject({
        type: 'jsx',
        tag: { type: 'var', name: 'Hello' },
        attributes: [{ type: 'row', name: 'hello', value: { type: 'var', name: 'folks' } }],
        children: [{ type: 'var', name: 'inner' }],
    });
});

// const fixes = {
//     'pattern text': ['"Hi"', '"Hello ${name}"'],
//     // how to do ... jsx?
//     'expr jsx': ['<>Hello\tinner', '<>Hello hi\t\tinner'],
//     stmt: ['let x = 2', 'return 12', 'for (let x = 1;x<3;x++) {y}'],
// };

// Object.entries(exps).forEach(([key, values]) => {
//     values.forEach((value) => {
//         test(`${key} + ${value}`, () => {
//             const state = cread(splitGraphemes(value), js);
//             const rt = root(state, (idx) => [{ id: '', idx }]);
//             const res = match({ type: 'ref', name: key }, ctx, { nodes: [rt], loc: [] }, 0);
//             expect(res?.consumed).toEqual(1);
//         });
//     });
// });
