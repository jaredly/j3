import { RecNodeT } from '../shared/cnodes';
import { shape } from '../shared/shape';
import { root } from './root';
import { atPath, noText, selPath, selPathN, selPaths, TestState } from './test-utils';
import { Cursor } from './utils';
import { expect } from 'bun:test';

export const check = (state: TestState, exp: RecNodeT<boolean | number>, cursor: Cursor, endCursor?: Cursor) => {
    const { main, paths } = selPaths(exp);
    expect(shape(root(state))).toEqual(shape(exp));
    expect({
        sel: state.sel.start.path.children,
        cursor: noText(state.sel.start.cursor),
        endCursor: state.sel.end ? noText(state.sel.end.cursor) : undefined,
        endPath: state.sel.end?.path.children ?? state.sel.start.path.children,
    }).toEqual({
        sel: atPath(state.top.root, state.top, main),
        endPath: paths[2] ? atPath(state.top.root, state.top, paths[2]) : atPath(state.top.root, state.top, main),
        cursor,
        endCursor,
    });
};

export const checkm = (state: TestState, exp: RecNodeT<number>, cursor: Cursor) => {
    expect(shape(root(state))).toEqual(shape(exp));
    const start = selPathN(exp, 0);
    if (start == null) throw new Error(`no node marked for selection`);
    const end = selPathN(exp, 1);
    const aux = selPathN(exp, 2);
    expect({
        sel: state.sel.start.path.children,
        cursor: noText(state.sel.start.cursor),
    }).toEqual({
        sel: atPath(state.top.root, state.top, start),
        cursor,
    });
    expect(state.sel.multi?.end.path.children ?? null).toEqual(end);
    expect(state.sel.multi?.aux?.path.children ?? null).toEqual(aux);
};
