// let's test some operations

import { RecNodeT } from '../shared/cnodes';
import { shape } from '../shared/shape';
import { applyUpdate } from './applyUpdate';
import { handleNav, selectEnd, selectStart } from './handleNav';
import { root } from './root';
import { asTop, asTopAndPath, atPath, id, idc, list, listc, noText, round, selPath, smoosh, spaced, table, TestState, text } from './test-utils';
import { Cursor, Path, pathWithChildren, selStart } from './utils';

const check = (state: TestState, exp: RecNodeT<boolean>, cursor: Cursor) => {
    expect(shape(root(state))).toEqual(shape(exp));
    expect(state.sel.start.path.children).toEqual(atPath(state.top.root, state.top, selPath(exp)));
    expect(noText(state.sel.start.cursor)).toEqual(cursor);
};

const run = (node: RecNodeT<boolean>, cursor: Cursor, key: string, exp: RecNodeT<boolean>, ecursor: Cursor) => {
    let state = asTop(node, cursor);
    state = applyUpdate(state, handleNav(key, state)!);
    check(state, exp, ecursor);
};

// MARK: IDs

test('left in an id', () => {
    run(
        id('abc', true),
        idc(0),
        //
        'ArrowLeft',
        id('abc', true),
        idc(0),
    );

    run(
        id('abc', true),
        idc(1),
        //
        'ArrowLeft',
        id('abc', true),
        idc(0),
    );
});

test('right in an id', () => {
    run(
        id('abc', true),
        idc(0),
        //
        'ArrowRight',
        id('abc', true),
        idc(1),
    );

    run(
        id('abc', true),
        idc(3),
        //
        'ArrowRight',
        id('abc', true),
        idc(3),
    );
});

test('left/right in a round or spaced', () => {
    run(
        round([id('one'), id('two', true)]),
        idc(0),
        //
        'ArrowLeft',
        round([id('one', true), id('two')]),
        idc(3),
    );

    run(
        spaced([id('one'), id('two', true)]),
        idc(0),
        //
        'ArrowLeft',
        spaced([id('one', true), id('two')]),
        idc(3),
    );

    run(
        round([id('one', true), id('two')]),
        idc(3),
        //
        'ArrowRight',
        round([id('one'), id('two', true)]),
        idc(0),
    );

    run(
        spaced([id('one', true), id('two')]),
        idc(3),
        //
        'ArrowRight',
        spaced([id('one'), id('two', true)]),
        idc(0),
    );
});

test('left/right in a smoosh, jumps over', () => {
    run(
        smoosh([id('one'), id('two', true)]),
        idc(0),
        //
        'ArrowLeft',
        smoosh([id('one', true), id('two')]),
        idc(2),
    );

    run(
        smoosh([id('one', true), id('two')]),
        idc(3),
        //
        'ArrowRight',
        smoosh([id('one'), id('two', true)]),
        idc(1),
    );
});

test('left/right at a list', () => {
    run(
        smoosh([id('one'), id('two')], true),
        listc('start'),
        //
        'ArrowLeft',
        smoosh([id('one'), id('two')], true),
        listc('before'),
    );
    run(
        smoosh([id('one'), id('two')], true),
        listc('end'),
        //
        'ArrowRight',
        smoosh([id('one'), id('two')], true),
        listc('after'),
    );
});

test('left/right into a list', () => {
    run(
        smoosh([id('one'), id('two')], true),
        listc('before'),
        //
        'ArrowRight',
        smoosh([id('one', true), id('two')]),
        idc(0),
    );
    run(
        smoosh([id('one'), id('two')], true),
        listc('after'),
        //
        'ArrowLeft',
        smoosh([id('one'), id('two', true)]),
        idc(3),
    );
});

test('left/right into empty', () => {
    run(
        smoosh([], true),
        listc('before'),
        //
        'ArrowRight',
        smoosh([], true),
        listc('inside'),
    );
    run(
        smoosh([], true),
        listc('after'),
        //
        'ArrowLeft',
        smoosh([], true),
        listc('inside'),
    );
});

test('left/right out of empty', () => {
    run(
        smoosh([], true),
        listc('inside'),
        //
        'ArrowRight',
        smoosh([], true),
        listc('after'),
    );
    run(
        smoosh([], true),
        listc('inside'),
        //
        'ArrowLeft',
        smoosh([], true),
        listc('before'),
    );
});

test('left/right between smooshes', () => {
    run(
        round([smoosh([id('a'), id('.', true)]), id('b')]),
        idc(1),
        //
        'ArrowRight',
        round([smoosh([id('a'), id('.')]), id('b', true)]),
        idc(0),
    );
    run(
        round([id('b'), smoosh([id('a', true), id('.')])]),
        idc(0),
        //
        'ArrowLeft',
        round([id('b', true), smoosh([id('a'), id('.')])]),
        idc(1),
    );
});

test('left/right out of list', () => {
    run(
        round([id('a', true)]),
        idc(1),
        //
        'ArrowRight',
        round([id('a')], true),
        listc('after'),
    );
    run(
        round([id('a', true)]),
        idc(0),
        //
        'ArrowLeft',
        round([id('a')], true),
        listc('before'),
    );
});

// MARK: Select Start
const pc = (children: number[]): Path => ({ root: { ids: [], top: '' }, children });

test('select start, id', () => {
    const { top, sel } = asTopAndPath(id('hello', true));
    expect(selectStart(pc(sel), top)).toEqual(selStart(pc(sel), { type: 'id', end: 0 }));
});

test('select start, id + 1', () => {
    const { top, sel } = asTopAndPath(id('hello', true));
    expect(selectStart(pc(sel), top, true)).toEqual(selStart(pc(sel), { type: 'id', end: 1 }));
});

test('select end, id', () => {
    const { top, sel } = asTopAndPath(id('hello', true));
    expect(selectEnd(pc(sel), top)).toEqual(selStart(pc(sel), { type: 'id', end: 5 }));
});

test('select end, id + 1', () => {
    const { top, sel } = asTopAndPath(id('hello', true));
    expect(selectEnd(pc(sel), top, true)).toEqual(selStart(pc(sel), { type: 'id', end: 4 }));
});

test('round start/end', () => {
    const { top, sel } = asTopAndPath(round([id('hello')], true));
    expect(selectEnd(pc(sel), top)).toEqual(selStart(pc(sel), { type: 'list', where: 'after' }));
    expect(selectStart(pc(sel), top)).toEqual(selStart(pc(sel), { type: 'list', where: 'before' }));
});

test('spaced start/end', () => {
    const { top, sel } = asTopAndPath(spaced([id('hello')], true));
    expect(selectEnd(pc(sel), top)).toEqual(selStart(pathWithChildren(pc(sel), 1), { type: 'id', end: 5 }));
    expect(selectStart(pc(sel), top)).toEqual(selStart(pathWithChildren(pc(sel), 1), { type: 'id', end: 0 }));
    expect(selectEnd(pc(sel), top, true)).toEqual(selStart(pathWithChildren(pc(sel), 1), { type: 'id', end: 4 }));
    expect(selectStart(pc(sel), top, true)).toEqual(selStart(pathWithChildren(pc(sel), 1), { type: 'id', end: 1 }));
});

test('tablee', () => {
    const { top, sel } = asTopAndPath(table('round', [], true));
    expect(selectEnd(pc(sel), top)).toEqual(selStart(pc(sel), { type: 'list', where: 'after' }));
    expect(selectStart(pc(sel), top)).toEqual(selStart(pc(sel), { type: 'list', where: 'before' }));
});

test('text', () => {
    const { top, sel } = asTopAndPath(round([text([], true)]));
    expect(selectEnd(pc(sel), top)).toEqual(selStart(pc(sel), { type: 'list', where: 'after' }));
    expect(selectStart(pc(sel), top)).toEqual(selStart(pc(sel), { type: 'list', where: 'before' }));
});

test('text in rich', () => {
    const { top, sel } = asTopAndPath(list({ type: 'plain' })([text([{ type: 'text', text: 'hi' }], true)]));
    expect(selectEnd(pc(sel), top)).toEqual(selStart(pc(sel), { type: 'text', end: { index: 0, cursor: 2 } }));
    expect(selectStart(pc(sel), top)).toEqual(selStart(pc(sel), { type: 'text', end: { index: 0, cursor: 0 } }));
});

test('text empty in rich', () => {
    const { top, sel } = asTopAndPath(list({ type: 'plain' })([text([], true)]));
    expect(selectEnd(pc(sel), top)).toEqual(selStart(pc(sel), { type: 'list', where: 'inside' }));
    expect(selectStart(pc(sel), top)).toEqual(selStart(pc(sel), { type: 'list', where: 'inside' }));
});

test('text embed in rich', () => {
    const { top, sel } = asTopAndPath(list({ type: 'plain' })([text([{ type: 'embed', item: id('hi') }], true)]));
    const path = pathWithChildren(pc(sel), 2);
    expect(selectEnd(pc(sel), top)).toEqual(selStart(path, { type: 'id', end: 2 }));
    expect(selectStart(pc(sel), top)).toEqual(selStart(path, { type: 'id', end: 0 }));
});

test('text control in rich', () => {
    const { top, sel } = asTopAndPath(list({ type: 'plain' })([text([{ type: 'include', hash: '', id: '' }], true)]));
    expect(selectEnd(pc(sel), top)).toEqual(selStart(pc(sel), { type: 'control', index: 0 }));
    expect(selectStart(pc(sel), top)).toEqual(selStart(pc(sel), { type: 'control', index: 0 }));
});
