// test stuff

import { splitGraphemes } from '../../src/parse/splitGraphemes';
import { applyUpdate } from '../keyboard/applyUpdate';
import { root } from '../keyboard/root';
import { init, js } from '../keyboard/test-utils';
import { keyUpdate } from '../keyboard/ui/keyUpdate';
import { cread } from '../shared/creader';
import { ctx, Ctx, match, rules } from './dsl3';
import { Expr, Stmt } from './ts-types';

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

const fixes = {
    // 'pattern var': ['hello', '23'],
    // 'pattern array': ['[]', '[one]', '[...one]', '[one,two,...three]'],
    'pattern default': ['x = 3 + 3', '[] = 3'],
    'pattern typed': ['one:int', '[one]:list'],
    'pattern constructor': ['Some(body)', 'Once([told,me])'],
    'pattern text': ['"Hi"', '"Hello ${name}"'],
    // how to do ... jsx?
    'expr jsx': ['</Hello\tinner', '</Hello hi\t\tinner'],
    // stmt: ['let x = 2', 'return 12', 'for (let x = 1;x<3;x++) {y}'],
};

const run = (input: string, matcher: string, mctx = ctx) => {
    const state = cread(splitGraphemes(input), js);
    const rt = root(state, (idx) => [{ id: '', idx }]);
    const res = match({ type: 'ref', name: matcher }, mctx, { nodes: [rt], loc: [] }, 0);
    return res;
};

Object.entries(fixes).forEach(([key, values]) => {
    values.forEach((value) => {
        test(`${key} + ${value}`, () => {
            expect(run(value, key)?.consumed).toEqual(1);
        });
    });
});

test('extra unparsed', () => {
    const mctx: Ctx = { ...ctx, meta: {} };
    run('hello folks', 'stmt', mctx)?.value;
    console.log(mctx.meta);
    expect(mctx.meta[1]).toMatchObject({ kind: 'unparsed' });
});

test.only('fn args not unparsed', () => {
    const mctx: Ctx = { ...ctx, meta: {} };
    run('let x = (a,1) => 12', 'stmt', mctx);
    console.log(mctx.meta);
    expect(mctx.meta[3]).toMatchObject({ kind: 'punct' });
    expect(mctx.meta[5]).toMatchObject({ kind: 'number' });
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
                { type: 'number', value: 3 },
                { type: 'number', value: 4 },
            ],
        },
    });

    expect(run('[] = 3', 'pattern default')?.value).toMatchObject({
        type: 'default',
        inner: { type: 'array', values: [] },
        value: { type: 'number', value: 3 },
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

test('expr jsx', () => {
    expect(run('</Hello\tinner', 'expr jsx')?.value).toMatchObject({
        type: 'jsx',
        tag: { type: 'var', name: 'Hello' },
        attributes: undefined,
        children: [{ type: 'var', name: 'inner' }],
    });

    expect(run('</Hello hello:folks\t\tinner', 'expr jsx')?.value).toMatchObject({
        type: 'jsx',
        tag: { type: 'var', name: 'Hello' },
        attributes: [{ type: 'row', name: 'hello', value: { type: 'var', name: 'folks' } }],
        children: [{ type: 'var', name: 'inner' }],
    });
});

const supermap = (v: any, f: (n: any) => any): any => {
    v = f(v);
    if (v == null) return v;
    if (Array.isArray(v)) return v.map((s) => supermap(s, f));
    if (typeof v === 'object') {
        const res: Record<string, any> = {};
        Object.entries(v).forEach(([key, v]) => {
            res[key] = supermap(v, f);
        });
        return res;
    }
    return v;
};

const nosrc = (v: any) =>
    supermap(v, (o) => {
        if (o && typeof o === 'object' && 'src' in o) {
            const { src, ...rest } = o;
            return rest;
        }
        return o;
    });

test('expr smoosh', () => {
    expect(nosrc(run('-a.b.c(d)[2]++', 'expr')?.value)).toMatchObject<DeepPartial<Expr>>({
        type: 'uop',
        target: {
            type: 'uop',
            op: { type: 'id', text: '++' },
            target: {
                type: 'index',
                items: [{ type: 'number', value: 2 }],
                target: {
                    type: 'call',
                    args: [{ type: 'var', name: 'd' }],
                    target: {
                        type: 'attribute',
                        attribute: { type: 'id', text: 'c' },
                        target: {
                            type: 'attribute',
                            attribute: { type: 'id', text: 'b' },
                            target: { type: 'var', name: 'a' },
                        },
                    },
                },
            },
        },
        op: { type: 'id', text: '-' },
    });

    expect(run('b', '...expr')?.value).toMatchObject({
        type: 'var',
        name: 'b',
    });

    expect(run('a(b)', 'expr')?.value).toMatchObject({
        type: 'call',
        target: { type: 'var', name: 'a' },
        args: [{ type: 'var', name: 'b' }],
    });

    expect(run('a.b', 'expr')?.value).toMatchObject({
        type: 'attribute',
        target: { type: 'var', name: 'a' },
        attribute: { type: 'id', text: 'b' },
    });

    expect(run('x++', 'expr')?.value).toMatchObject<DeepPartial<Expr>>({
        type: 'uop',
        target: { type: 'var', name: 'x' },
        op: { type: 'id', text: '++' },
    });
});

test('stmt', () => {
    expect(run('let x = 2', 'stmt')?.value).toMatchObject({
        type: 'let',
        pat: { type: 'var', name: 'x' },
        value: { type: 'number', value: 2 },
    });
    expect(run('return 1', 'stmt')?.value).toMatchObject({
        type: 'return',
        value: { type: 'number', value: 1 },
    });
    expect(run('throw 1', 'stmt')?.value).toMatchObject({
        type: 'throw',
        target: { type: 'number', value: 1 },
    });
    expect(run('for (let x = 1;x < 3;x++) {y}', 'stmt')?.value).toMatchObject<DeepPartial<Stmt>>({
        type: 'for',
        init: { type: 'let', pat: { type: 'var', name: 'x' }, value: { type: 'number', value: 1 } },
        cond: {
            type: 'call',
            target: { type: 'var', name: '<' },
            args: [
                { type: 'var', name: 'x' },
                { type: 'number', value: 3 },
            ],
        },
        update: { type: 'uop', op: { type: 'id', text: '++' }, target: { type: 'var', name: 'x' } },
        body: [{ type: 'expr', expr: { type: 'var', name: 'y' } }],
    });
});

// const fixes = {
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

type DeepPartial<Thing> = Thing extends Function
    ? Thing
    : Thing extends Array<infer InferredArrayMember>
    ? DeepPartialArray<InferredArrayMember>
    : Thing extends object
    ? DeepPartialObject<Thing>
    : Thing | undefined;

interface DeepPartialArray<Thing> extends Array<DeepPartial<Thing>> {}

type DeepPartialObject<Thing> = {
    [Key in keyof Thing]?: DeepPartial<Thing[Key]>;
};
