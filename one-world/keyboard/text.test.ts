// let's test some operations

import { applyUpdate } from './applyUpdate';
import { check } from './check.test';
import { handleKey } from './handleKey';
import { handleNav } from './handleNav';
import { asTop, id, idc, lisp, list, listc, round, smoosh, text, textc } from './test-utils';

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

test('text insert', () => {
    let state = asTop(text([{ type: 'text', text: 'hi' }], true), textc(0, 2));
    state = applyUpdate(state, handleKey(state, 'l', lisp)!);
    check(state, text([{ type: 'text', text: 'hil' }], true), textc(0, 3));
});

test('text insert - commit text changes', () => {
    let state = asTop(text([{ type: 'text', text: 'hi' }], true), textc(0, 2));
    state = applyUpdate(state, handleKey(state, 'l', lisp)!);
    state = applyUpdate(state, handleNav('ArrowRight', state));
    check(state, text([{ type: 'text', text: 'hil' }], true), listc('after'));
});

// MARK: nav text

test('text nav', () => {
    let state = asTop(text([{ type: 'text', text: 'hi' }], true), textc(0, 2));
    state = applyUpdate(state, handleNav('ArrowLeft', state)!);
    check(state, text([{ type: 'text', text: 'hi' }], true), textc(0, 1));
});

test('text nav right', () => {
    let state = asTop(text([{ type: 'text', text: 'hi' }], true), textc(0, 0));
    state = applyUpdate(state, handleNav('ArrowRight', state)!);
    check(state, text([{ type: 'text', text: 'hi' }], true), textc(0, 1));
});

test('text nav past end', () => {
    let state = asTop(text([{ type: 'text', text: 'hi' }], true), textc(0, 2));
    state = applyUpdate(state, handleNav('ArrowRight', state)!);
    check(state, text([{ type: 'text', text: 'hi' }], true), listc('after'));
});

test('text nav past end - rich', () => {
    let state = asTop(
        list({ type: 'plain' })([
            //
            text([{ type: 'text', text: 'hi' }], true),
            text([{ type: 'text', text: 'yo' }]),
        ]),
        textc(0, 2),
    );
    state = applyUpdate(state, handleNav('ArrowRight', state));
    check(
        state,
        list({ type: 'plain' })([
            //
            text([{ type: 'text', text: 'hi' }]),
            text([{ type: 'text', text: 'yo' }], true),
        ]),
        textc(0, 0),
    );
});

test('text nav between spans', () => {
    let state = asTop(
        text(
            [
                { type: 'text', text: 'hi' },
                { type: 'text', text: 'lo' },
            ],
            true,
        ),
        textc(0, 2),
    );
    state = applyUpdate(state, handleNav('ArrowRight', state)!);
    check(
        state,
        text(
            [
                { type: 'text', text: 'hi' },
                { type: 'text', text: 'lo' },
            ],
            true,
        ),
        textc(1, 1),
    );
});

test('text nav between span and embed', () => {
    let state = asTop(
        text(
            [
                { type: 'text', text: 'hi' },
                { type: 'embed', item: id('lo') },
            ],
            true,
        ),
        textc(0, 2),
    );
    state = applyUpdate(state, handleNav('ArrowRight', state)!);
    check(
        state,
        text([
            { type: 'text', text: 'hi' },
            { type: 'embed', item: id('lo', true) },
        ]),
        idc(1),
    );
});

test('back into text', () => {
    let state = asTop(smoosh([text([{ type: 'text', text: 'hi' }]), id('ho', true)]), idc(0));
    state = applyUpdate(state, handleNav('ArrowLeft', state)!);
    check(state, smoosh([text([{ type: 'text', text: 'hi' }], true), id('ho')]), textc(0, 2));
});

test('back into text inside', () => {
    let state = asTop(smoosh([text([]), id('ho', true)]), idc(0));
    state = applyUpdate(state, handleNav('ArrowLeft', state)!);
    check(state, smoosh([text([], true), id('ho')]), listc('inside'));
});

test('back into text embed', () => {
    let state = asTop(smoosh([text([{ type: 'embed', item: id('hi') }]), id('ho', true)]), idc(0));
    state = applyUpdate(state, handleNav('ArrowLeft', state)!);
    check(state, smoosh([text([{ type: 'embed', item: id('hi', true) }]), id('ho')]), idc(2));
});

// MARK: right list

test('nav right text (list) / after', () => {
    let state = asTop(smoosh([text([{ type: 'embed', item: id('hi') }], true), id('ho')]), listc('after'));
    state = applyUpdate(state, handleNav('ArrowRight', state)!);
    check(state, smoosh([text([{ type: 'embed', item: id('hi') }]), id('ho', true)]), idc(1));
});

test('nav right text (list) / before', () => {
    let state = asTop(text([{ type: 'text', text: 'hi' }], true), listc('before'));
    state = applyUpdate(state, handleNav('ArrowRight', state)!);
    check(state, text([{ type: 'text', text: 'hi' }], true), textc(0, 0));
});

test('nav right text (list) / before - embed', () => {
    let state = asTop(text([{ type: 'text', text: 'hi' }], true), listc('before'));
    state = applyUpdate(state, handleNav('ArrowRight', state)!);
    check(state, text([{ type: 'text', text: 'hi' }], true), textc(0, 0));
});

test('nav right text (list) / inside', () => {
    let state = asTop(text([], true), listc('inside'));
    state = applyUpdate(state, handleNav('ArrowRight', state)!);
    check(state, text([], true), listc('after'));
});

test('nav right text (list) / before / empty', () => {
    let state = asTop(text([], true), listc('before'));
    state = applyUpdate(state, handleNav('ArrowRight', state)!);
    check(state, text([], true), listc('inside'));
});

// MARK: left list

test('nav left text (list) / before', () => {
    let state = asTop(smoosh([id('hi'), text([], true)]), listc('before'));
    state = applyUpdate(state, handleNav('ArrowLeft', state)!);
    check(state, smoosh([id('hi', true), text([])]), idc(1));
});

test('nav left text (list) / after - empty', () => {
    let state = asTop(smoosh([id('hi'), text([], true)]), listc('after'));
    state = applyUpdate(state, handleNav('ArrowLeft', state)!);
    check(state, smoosh([id('hi'), text([], true)]), listc('inside'));
});

test('nav left text (list) / after', () => {
    let state = asTop(text([{ type: 'text', text: 'ho' }], true), listc('after'));
    state = applyUpdate(state, handleNav('ArrowLeft', state)!);
    check(state, text([{ type: 'text', text: 'ho' }], true), textc(0, 2));
});

test('nav left text (text) ', () => {
    let state = asTop(
        text(
            [
                { type: 'text', text: 'hi' },
                { type: 'text', text: 'ho' },
            ],
            true,
        ),
        textc(1, 0),
    );
    state = applyUpdate(state, handleNav('ArrowLeft', state)!);
    check(
        state,
        text(
            [
                { type: 'text', text: 'hi' },
                { type: 'text', text: 'ho' },
            ],
            true,
        ),
        textc(0, 1),
    );
});

test('nav left text (text) ', () => {
    let state = asTop(
        text(
            [
                { type: 'embed', item: id('hi') },
                { type: 'text', text: 'ho' },
            ],
            true,
        ),
        textc(1, 0),
    );
    state = applyUpdate(state, handleNav('ArrowLeft', state)!);
    check(
        state,
        text([
            { type: 'embed', item: id('hi', true) },
            { type: 'text', text: 'ho' },
        ]),
        idc(1),
    );
});

test('nav left text (text) first ', () => {
    let state = asTop(text([{ type: 'text', text: 'ho' }], true), textc(0, 0));
    state = applyUpdate(state, handleNav('ArrowLeft', state)!);
    check(state, text([{ type: 'text', text: 'ho' }], true), listc('before'));
});
