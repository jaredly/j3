// let's test some operations

import { RecNodeT } from '../shared/cnodes';
import { shape } from '../shared/shape';
import { applyUpdate } from './applyUpdate';
import { handleNav } from './handleNav';
import { root } from './root';
import { asTop, atPath, id, idc, noText, round, selPath, smoosh, spaced, TestState } from './test-utils';
import { Cursor } from './utils';

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
