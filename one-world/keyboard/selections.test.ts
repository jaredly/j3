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

test.only('list into', () => {
    let state = asTop(round([id('hi', 1), round([id('ha'), id('ho', 2)])]), idc(1), idc(1));
    const statuses = getSelectionStatuses(state.sel, state.top);
    expect(statuses).toEqual({
        ';;0,1': {
            cursors: [idc(1)],
            highlight: { type: 'id', start: 1 },
        },
        ';;0,2,3': { cursors: [], highlight: { type: 'full' } },
        ';;0,2,4': {
            cursors: [idc(1)],
            highlight: { type: 'id', end: 1 },
        },
    });
});
