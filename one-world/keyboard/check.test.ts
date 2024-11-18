import { RecNodeT } from '../shared/cnodes';
import { shape } from '../shared/shape';
import { root } from './root';
import { atPath, noText, selPath, TestState } from './test-utils';
import { Cursor } from './utils';
import { expect } from 'bun:test';

export const check = (state: TestState, exp: RecNodeT<boolean>, cursor: Cursor) => {
    expect(shape(root(state))).toEqual(shape(exp));
    expect({
        sel: state.sel.start.path.children,
        cursor: noText(state.sel.start.cursor),
    }).toEqual({
        sel: atPath(state.top.root, state.top, selPath(exp)),
        cursor,
    });
};
