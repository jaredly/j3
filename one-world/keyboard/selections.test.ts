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
    table,
    TestState,
    text,
    textc,
    tspan,
} from './test-utils';
import { NodeSelection, Path, selStart, Top } from './utils';
import { getSelectionStatuses } from './selections';

test('id single', () => {
    let state = asTop(id('hi', true), idc(1));
    const statuses = getSelectionStatuses(state.sel, state.top);
    expect(statuses).toEqual({ ';;0': { cursors: [idc(1)] } });
});

test('id sel', () => {
    let state = asTop(id('hi', true), idc(0), idc(1));
    const statuses = getSelectionStatuses(state.sel, state.top);
    expect(statuses).toEqual({
        ';;0': {
            cursors: [idc(0), idc(1)],
            highlight: { type: 'id', start: 0, end: 1 },
        },
    });
});

test('list multi', () => {
    let state = asTop(round([id('hi', 1), id('ha'), id('ho', 2)]), idc(1), idc(1));
    const statuses = getSelectionStatuses(state.sel, state.top);
    expect(statuses).toEqual({
        ';;0,1': {
            cursors: [idc(1)],
            highlight: { type: 'id', start: 1 },
        },
        ';;0,2': { cursors: [], highlight: { type: 'full' } },
        ';;0,3': {
            cursors: [idc(1)],
            highlight: { type: 'id', end: 1 },
        },
    });
});

test('list into', () => {
    let state = asTop(round([id('hi', 1), round([id('ha'), id('ho', 2)])]), idc(1), idc(1));
    const statuses = getSelectionStatuses(state.sel, state.top);
    expect(statuses).toEqual({
        ';;0,1': {
            cursors: [idc(1)],
            highlight: { type: 'id', start: 1 },
        },
        ';;0,2': { cursors: [], highlight: { type: 'list', opener: true, closer: false } },
        ';;0,2,3': { cursors: [], highlight: { type: 'full' } },
        ';;0,2,4': {
            cursors: [idc(1)],
            highlight: { type: 'id', end: 1 },
        },
    });
});

test('text simple', () => {
    let state = asTop(text([tspan('before'), tspan('after')], 1), textc(0, 2), textc(0, 4));
    const statuses = getSelectionStatuses(state.sel, state.top);
    expect(statuses).toEqual({
        ';;0': {
            cursors: [textc(0, 2), textc(0, 4)],
            highlight: { type: 'text', spans: [{ start: 2, end: 4 }, false], opener: false, closer: false },
        },
    });
});

test('text simple across spans', () => {
    let state = asTop(text([tspan('before'), tspan('cover'), tspan('after')], 1), textc(0, 2), textc(2, 2));
    const statuses = getSelectionStatuses(state.sel, state.top);
    expect(statuses).toEqual({
        ';;0': {
            cursors: [textc(0, 2), textc(2, 2)],
            highlight: { type: 'text', spans: [{ start: 2 }, true, { end: 2 }], opener: false, closer: false },
        },
    });
});

test('text into', () => {
    let state = asTop(
        text([tspan('before'), { type: 'embed', item: round([id('over'), id('inner', 2), id('yall')]) }, tspan('after')], 1),
        textc(0, 2),
        idc(2),
    );
    const statuses = getSelectionStatuses(state.sel, state.top);
    expect(statuses).toEqual({
        ';;0': {
            cursors: [textc(0, 2)],
            highlight: {
                type: 'text',
                spans: [{ start: 2 }, false, false],
                opener: false,
                closer: false,
            },
        },
        ';;0,1': {
            cursors: [],
            highlight: { type: 'list', opener: true, closer: false },
        },
        ';;0,1,2': { cursors: [], highlight: { type: 'full' } },
        ';;0,1,3': { cursors: [idc(2)], highlight: { type: 'id', end: 2 } },
    });
});

test('text into more', () => {
    let state = asTop(
        round([id('abcd', 1), text([tspan('before'), { type: 'embed', item: round([id('over'), id('inner', 2), id('yall')]) }, tspan('after')])]),
        idc(3),
        idc(2),
    );
    const statuses = getSelectionStatuses(state.sel, state.top);
    expect(statuses).toEqual({
        ';;0,1': {
            cursors: [idc(3)],
            highlight: { type: 'id', start: 3 },
        },
        ';;0,2': {
            cursors: [],
            highlight: { type: 'text', spans: [true, false, false], opener: true, closer: false },
        },
        ';;0,2,3': {
            cursors: [],
            highlight: { type: 'list', opener: true, closer: false },
        },
        ';;0,2,3,4': { cursors: [], highlight: { type: 'full' } },
        ';;0,2,3,5': { cursors: [idc(2)], highlight: { type: 'id', end: 2 } },
    });
});

test('text into start', () => {
    let state = asTop(round([id('one', 1), text([tspan('two'), tspan('three')], 2)]), idc(1), listc('before'));
    const statuses = getSelectionStatuses(state.sel, state.top);
    expect(statuses).toEqual({
        ';;0,1': {
            cursors: [idc(1)],
            highlight: { type: 'id', start: 1 },
        },
        ';;0,2': {
            cursors: [{ type: 'list', where: 'before' }],
            highlight: { type: 'text', spans: [false, false], opener: false, closer: false },
        },
    });
});

test('side into a table', () => {
    let state = asTop(table('curly', [[id('hi'), id('ho', 2)]], 1), listc('before'), idc(1));
    const statuses = getSelectionStatuses(state.sel, state.top);
    expect(statuses).toEqual({
        ';;0': {
            cursors: [{ type: 'list', where: 'before' }],
            highlight: { type: 'list', opener: true, closer: false },
        },
        ';;0,1': {
            cursors: [],
            highlight: { type: 'full' },
        },
        ';;0,2': {
            cursors: [idc(1)],
            highlight: { type: 'id', end: 1 },
        },
    });
});
