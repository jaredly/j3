// let's test some operations

import { RecNodeT } from '../shared/cnodes';
import { applyUpdate } from './applyUpdate';
import { check } from './check.test';
import { handleNav, selectEnd, selectStart } from './handleNav';
import { asTop, asTopAndPath, id, idc, list, listc, round, smoosh, spaced, table, text, textc } from './test-utils';
import { Cursor, Path, pathWithChildren, selStart } from './utils';

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
        smoosh([id('one'), id('+', true)]),
        idc(0),
        //
        'ArrowLeft',
        smoosh([id('one', true), id('+')]),
        idc(2),
    );

    run(
        smoosh([id('one', true), id('+')]),
        idc(3),
        //
        'ArrowRight',
        smoosh([id('one'), id('+', true)]),
        idc(1),
    );
});

test('left/right at a list', () => {
    run(
        smoosh([id('one'), id('+')], true),
        listc('start'),
        //
        'ArrowLeft',
        smoosh([id('one'), id('+')], true),
        listc('before'),
    );
    run(
        smoosh([id('one'), id('+')], true),
        listc('end'),
        //
        'ArrowRight',
        smoosh([id('one'), id('+')], true),
        listc('after'),
    );
});

test('left/right into a list', () => {
    run(
        round([id('one'), id('+')], true),
        listc('before'),
        //
        'ArrowRight',
        round([id('one', true), id('+')]),
        idc(0),
    );
    run(
        round([id('one'), id('+')], true),
        listc('after'),
        //
        'ArrowLeft',
        round([id('one'), id('+', true)]),
        idc(1),
    );
});

test('left/right into empty', () => {
    run(
        round([], true),
        listc('before'),
        //
        'ArrowRight',
        round([], true),
        listc('inside'),
    );
    run(
        round([], true),
        listc('after'),
        //
        'ArrowLeft',
        round([], true),
        listc('inside'),
    );
});

test('left/right out of empty', () => {
    run(
        round([], true),
        listc('inside'),
        //
        'ArrowRight',
        round([], true),
        listc('after'),
    );
    run(
        round([], true),
        listc('inside'),
        //
        'ArrowLeft',
        round([], true),
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

test('back into list', () => {
    let state = asTop(smoosh([round([]), id('a', true)]), idc(0));
    state = applyUpdate(state, handleNav('ArrowLeft', state)!);
    check(state, smoosh([round([], true), id('a')]), listc('inside'));
});

test('back into list w/ id', () => {
    let state = asTop(smoosh([round([id('b')]), id('a', true)]), idc(0));
    state = applyUpdate(state, handleNav('ArrowLeft', state)!);
    check(state, smoosh([round([id('b', true)]), id('a')]), idc(1));
});

test('over into text - empty', () => {
    let state = asTop(smoosh([id('b', true), text([])]), idc(1));
    state = applyUpdate(state, handleNav('ArrowRight', state)!);
    check(state, smoosh([id('b'), text([], true)]), listc('inside'));
});

test('over into text', () => {
    let state = asTop(smoosh([id('b', true), text([{ type: 'text', text: 'hi' }])]), idc(1));
    state = applyUpdate(state, handleNav('ArrowRight', state)!);
    check(state, smoosh([id('b'), text([{ type: 'text', text: 'hi' }], true)]), textc(0, 0));
});
