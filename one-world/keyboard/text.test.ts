// let's test some operations

import { fromMap, RecNodeT } from '../shared/cnodes';
import { shape } from '../shared/shape';
import { applyUpdate } from './applyUpdate';
import { handleKey } from './handleKey';
import { root } from './root';
import { asTop, atPath, id, idc, lisp, listc, noText, round, selPath, smoosh, TestState, text } from './test-utils';
import { Cursor, IdCursor, TextCursor } from './utils';

const check = (state: TestState, exp: RecNodeT<boolean>, cursor: Cursor) => {
    expect(shape(root(state))).toEqual(shape(exp));
    expect(state.sel.start.path.children).toEqual(atPath(state.top.root, state.top, selPath(exp)));
    expect(noText(state.sel.start.cursor)).toEqual(cursor);
};

test('text before', () => {
    let state = asTop(text([], true), listc('before'));
    state = applyUpdate(state, handleKey(state, 'A', lisp)!);
    check(state, smoosh([id('A', true), text([])]), idc(1));
});

test('text after', () => {
    let state = asTop(text([], true), listc('after'));
    state = applyUpdate(state, handleKey(state, 'A', lisp)!);
    check(state, smoosh([text([]), id('A', true)]), idc(1));
});

test('text inside type', () => {
    let state = asTop(text([], true), listc('inside'));
    state = applyUpdate(state, handleKey(state, 'A', lisp)!);
    check(state, text([{ type: 'text', text: 'A' }], true), {
        type: 'text',
        end: { index: 0, cursor: 1 },
    });
});

test('text inside leavee', () => {
    let state = asTop(text([], true), listc('inside'));
    state = applyUpdate(state, handleKey(state, '"', lisp)!);
    check(state, text([], true), listc('after'));
});

test('text inside list', () => {
    let state = asTop(round([], true), listc('inside'));
    state = applyUpdate(state, handleKey(state, '"', lisp)!);
    check(state, round([text([], true)]), listc('inside'));
});

test('text after id', () => {
    let state = asTop(id('hi', true), idc(2));
    state = applyUpdate(state, handleKey(state, '"', lisp)!);
    check(state, smoosh([id('hi'), text([], true)]), listc('inside'));
});

const textc = (index: number, cursor: number): TextCursor => ({
    type: 'text',
    end: { index, cursor },
});

test('text insert', () => {
    let state = asTop(text([{ type: 'text', text: 'hi' }], true), textc(0, 2));
    state = applyUpdate(state, handleKey(state, 'l', lisp)!);
    check(state, text([{ type: 'text', text: 'hil' }], true), textc(0, 3));
});
