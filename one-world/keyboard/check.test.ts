import { RecNodeT } from '../shared/cnodes';
import { shape } from '../shared/shape';
import { root } from './root';
import { atPath, noText, selPath, selPathN, selPaths, TestState } from './test-utils';
import { Cursor } from './utils';
import { expect } from 'bun:test';
import { validate } from './validate';
import { fixTextSel } from './ctdt-test-utils';
import { TESTING_CTREE } from './applyUpdate';

export const check = (state: TestState, exp: RecNodeT<boolean | number>, cursor: Cursor, endCursor?: Cursor) => {
    const { main, paths } = selPaths(exp);
    expect(shape(root(state))).toEqual(shape(exp));
    const sel = atPath(state.top.root, state.top, main);
    const endSel = paths[2] ? atPath(state.top.root, state.top, paths[2]) : sel;
    if (cursor.type === 'text') {
        if (TESTING_CTREE) {
            cursor.end.index = sel.pop()!;
            if (endCursor !== cursor && endCursor?.type === 'text') {
                if (paths[2]) {
                    throw new Error('not handling yet');
                } else {
                    endCursor.end.index = cursor.end.index;
                }
            }
        } else if (sel[sel.length - 1] === '' || typeof cursor.end.index === 'string') {
            if (!state.top.nodes[sel[sel.length - 1]]) {
                sel.pop();
            }
            if (endSel !== sel) {
                if (!state.top.nodes[endSel[endSel.length - 1]]) {
                    endSel.pop();
                }
            }
        }
    }
    expect({
        sel: state.sel.start.path.children,
        cursor: state.sel.start.cursor,
        endCursor: state.sel.end?.cursor,
        endPath: state.sel.end?.path.children ?? state.sel.start.path.children,
    }).toEqual({
        sel,
        endPath: endSel,
        cursor,
        endCursor,
    });
    validate(state);
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
    // expect(state.sel.multi?.end.path.children ?? null).toEqual(end);
    // expect(state.sel.multi?.aux?.path.children ?? null).toEqual(aux);
};
