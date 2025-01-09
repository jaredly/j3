import { RecNodeT } from '../shared/cnodes';
import { ctx, matchers, stmtSpans } from '../syntaxes/gleam2';
import { parse } from '../syntaxes/dsl';
import { applyUpdate } from './applyUpdate';
import { check } from './check.test';
import { handleKey } from './handleKey';
import { handleShiftNav, handleSpecial, handleTab, nextLargerSpan, selEnd, shiftExpand, Src } from './handleShiftNav';
import { root } from './root';
import {
    asTop,
    asTopAndLocs,
    asTopAndPaths,
    curly,
    id,
    idc,
    lisp,
    listc,
    round,
    Sels,
    smoosh,
    spaced,
    square,
    TestState,
    text,
    textc,
    tspan,
} from './test-utils';
import { NodeSelection, Path, selStart, Top } from './utils';
import { selUpdate } from './handleNav';

const applySelection = (state: TestState, sel: NodeSelection | void) => (sel ? applyUpdate(state, { nodes: {}, selection: sel }) : state);

test('id shift-left', () => {
    let state = asTop(id('hi', true), idc(0));
    state = applySelection(state, handleShiftNav(state, 'ArrowRight'));
    check(state, id('hi', true), idc(0), idc(1));
});

test('id shift-left and write', () => {
    let state = asTop(id('hillo', true), idc(2));
    state = applySelection(state, handleShiftNav(state, 'ArrowRight'));
    state = applySelection(state, handleShiftNav(state, 'ArrowRight'));
    state = applyUpdate(state, handleKey(state, 'M', lisp));
    check(state, id('hiMo', true), idc(3));
});

test('id at smoosh boundary', () => {
    let state = asTop(smoosh([id('ab', true), id('+')]), idc(2));
    state = applySelection(state, handleShiftNav(state, 'ArrowRight'));
    check(state, smoosh([id('ab', 1), id('+', 2)]), idc(2), idc(1));
});

test('id at smoosh boundary left', () => {
    let state = asTop(smoosh([id('ab'), id('+', true)]), idc(0));
    state = applySelection(state, handleShiftNav(state, 'ArrowLeft'));
    check(state, smoosh([id('ab', 2), id('+', 1)]), idc(0), idc(1));
});

test('bold no shift', () => {
    let state = asTop(text([tspan('hello')], true), textc(0, 2));
    state = applyUpdate(state, handleSpecial(state, 'b', { meta: true }));
    check(state, text([tspan('he'), tspan('', { fontWeight: 'bold' }), tspan('llo')], true), textc(1, 0), textc(1, 0));
});

test('bold no shift at end', () => {
    let state = asTop(text([tspan('hello')], true), textc(0, 5));
    state = applyUpdate(state, handleSpecial(state, 'b', { meta: true }));
    check(state, text([tspan('hello'), tspan('', { fontWeight: 'bold' })], true), textc(1, 0), textc(1, 0));
});

test('a little bold/underline', () => {
    let state = asTop(text([tspan('hello')], true), textc(0, 2));
    state = applySelection(state, handleShiftNav(state, 'ArrowRight'));
    state = applySelection(state, handleShiftNav(state, 'ArrowRight'));
    state = applyUpdate(state, handleSpecial(state, 'b', { meta: true }));
    state = applyUpdate(state, handleSpecial(state, 'u', { meta: true }));
    state = applyUpdate(state, handleSpecial(state, 'i', { meta: true }));
    check(
        state,
        text([tspan('he'), tspan('ll', { fontStyle: 'italic', fontWeight: 'bold', textDecoration: 'underline' }), tspan('o')], true),
        textc(1, 2),
        textc(1, 0),
    );
});

test('undooo the boldliness', () => {
    let state = asTop(text([tspan('hello')], true), textc(0, 2));
    state = applySelection(state, handleShiftNav(state, 'ArrowRight'));
    state = applySelection(state, handleShiftNav(state, 'ArrowRight'));
    state = applyUpdate(state, handleSpecial(state, 'b', { meta: true }));
    state = applyUpdate(state, handleSpecial(state, 'u', { meta: true }));
    state = applyUpdate(state, handleSpecial(state, 'b', { meta: true }));
    state = applyUpdate(state, handleSpecial(state, 'u', { meta: true }));
    state = applyUpdate(state, handleSpecial(state, 'i', { meta: true }));
    state = applyUpdate(state, handleSpecial(state, 'i', { meta: true }));
    check(state, text([tspan('hello')], true), textc(0, 4), textc(0, 2));
});

test('join stuffs', () => {
    let state = asTop(text([tspan('hello folks')], true), textc(0, 6), textc(0, 11));
    state = applyUpdate(state, handleSpecial(state, 'b', { meta: true }));
    check(state, text([tspan('hello '), tspan('folks', { fontWeight: 'bold' })], true), textc(1, 5), textc(1, 0));
});

test('style across spans kinda', () => {
    let state = asTop(text([tspan('ab'), tspan('cd', { fontWeight: 'bold' })], true), textc(0, 2), textc(1, 2));
    state = applyUpdate(state, handleSpecial(state, 'i', { meta: true }));
    check(state, text([tspan('ab'), tspan('cd', { fontWeight: 'bold', fontStyle: 'italic' })], true), textc(1, 2), textc(1, 0));
});

// TODO: fix the empty styled span that gets added.
test('style across spans kinda', () => {
    let state = asTop(text([tspan('ab', { fontWeight: 'bold' }), tspan('cd')], true), textc(1, 0), textc(0, 0));
    state = applyUpdate(state, handleSpecial(state, 'i', { meta: true }));
    check(state, text([tspan('ab', { fontWeight: 'bold', fontStyle: 'italic' }), tspan('cd')], true), textc(0, 2), textc(0, 0));
});

test('style across spans', () => {
    let state = asTop(text([tspan('ab'), tspan('cd', { fontWeight: 'bold' })], true), textc(0, 1), textc(1, 1));
    state = applyUpdate(state, handleSpecial(state, 'i', { meta: true }));
    check(
        state,
        text(
            [
                tspan('a'),
                tspan('b', { fontStyle: 'italic' }),
                tspan('c', { fontWeight: 'bold', fontStyle: 'italic' }),
                tspan('d', { fontWeight: 'bold' }),
            ],
            true,
        ),
        textc(2, 1),
        textc(1, 0),
    );
});

// MARK: text shift

test('right across span', () => {
    let state = asTop(text([tspan('ab'), tspan('cd')], true), textc(0, 2));
    state = applySelection(state, handleShiftNav(state, 'ArrowRight'));
    check(state, text([tspan('ab'), tspan('cd')], true), textc(0, 2), textc(1, 1));
});

test('left across span', () => {
    let state = asTop(text([tspan('ab'), tspan('cd')], true), textc(1, 0));
    state = applySelection(state, handleShiftNav(state, 'ArrowLeft'));
    check(state, text([tspan('ab'), tspan('cd')], true), textc(1, 0), textc(0, 1));
});

// MARK: tabs

function checkTabs(
    top: Top,
    sels: Record<number, import('/Users/jared/clone/exploration/j3/one-world/keyboard/utils').NodeSelection>,
    shift = false,
) {
    let state: TestState = { top, sel: sels[0] };
    for (let i = 1; sels[i]; i++) {
        state = applyUpdate(state, selUpdate(handleTab(state, shift)));
        expect(state.sel).toEqual(sels[i]);
    }
}

test('goTabLateral', () => {
    let { top, sels } = asTopAndPaths(
        round<Sels>(
            [
                //
                id('hi', [1, idc(0)]),
                id('ho', [2, idc(0)]),
                smoosh([id('+', [3, idc(0)]), id('yes', [4, idc(0)])]),
                spaced([id('one', [5, idc(0)]), id('two', [6, idc(0)])]),
                square<Sels>(
                    [id('in', [8, idc(0)])],
                    [
                        [7, listc('before')],
                        [9, listc('after')],
                    ],
                ),
                round(
                    [],
                    [
                        [10, listc('before')],
                        [11, listc('inside')],
                    ],
                ),
                smoosh([
                    id('pre', [12, idc(0)]),
                    round<Sels>(
                        [],
                        [
                            [13, listc('before')],
                            [14, listc('inside')],
                        ],
                    ),
                    id('post', [15, idc(0)]),
                    id('+', [16, idc(0)]),
                ]),
            ],
            [0, listc('before')],
        ),
        { ids: [], top: '' },
    );
    checkTabs(top, sels);
});

test('smoosh tab', () => {
    let { top, sels } = asTopAndPaths(smoosh<Sels>([id('hi', [0, idc(0)]), round([], [1, listc('before')])]), { ids: [], top: '' });
    checkTabs(top, sels);
});

test('smoosh tab next', () => {
    let { top, sels } = asTopAndPaths(smoosh<Sels>([id('hi', [0, idc(2)]), round([], [1, listc('inside')])]), { ids: [], top: '' });
    checkTabs(top, sels);
});

test('smoosh tab round next', () => {
    let { top, sels } = asTopAndPaths(smoosh<Sels>([id('+', [1, idc(1)]), id('hi'), round([], [0, listc('before')])]), { ids: [], top: '' });
    checkTabs(top, sels, true);
});

test('largerrrr', () => {
    let { top, locs } = asTopAndLocs(
        spaced([
            id('if', 5),
            id('2'),
            //
            curly([spaced([id('2', 2), id('-'), id('3', 0), id('*'), id('5', 1)], 3)], 4),
        ]),
    );
    const rootNode = root({ top }, (idx) => [{ id: '', idx }]);
    const c = ctx();
    const gleam = parse(matchers.stmt, rootNode, c);
    const spans: Src[] = gleam.result ? stmtSpans(gleam.result) : [];

    const p = (children: number[]): Path => ({ root: { ids: [], top: '' }, children });
    const start = selStart(p(locs[0]), idc(0));
    const sels: NodeSelection[] = [
        //
        { start },
        { start, multi: { end: start } },
        { start, multi: { end: selEnd(p(locs[0])), aux: selEnd(p(locs[1])) } },
        { start, multi: { end: selEnd(p(locs[2])), aux: selEnd(p(locs[1])) } },
        { start, multi: { end: selEnd(p(locs[3])) } },
        { start, multi: { end: selEnd(p(locs[4])) } },
        { start, multi: { end: selEnd(p(locs[5])), aux: selEnd(p(locs[4])) } },
    ];

    let state: TestState = { top, sel: sels[0] };
    for (let i = 1; sels[i]; i++) {
        state = applySelection(state, shiftExpand(state, spans));
        expect(state.sel).toEqual(sels[i]);
    }
});

// MARK: shfit left/right

test('single id', () => {
    let state = asTop(id('hi', true), idc(0));
    state = applySelection(state, handleShiftNav(state, 'ArrowRight'));
    check(state, id('hi', true), idc(0), idc(1));
});

test('multi id', () => {
    let state = asTop(spaced([id('hi', 1), id('ho', 2)]), idc(0), idc(0));
    state = applySelection(state, handleShiftNav(state, 'ArrowRight'));
    check(state, spaced([id('hi', 1), id('ho', 2)]), idc(0), idc(1));
});
