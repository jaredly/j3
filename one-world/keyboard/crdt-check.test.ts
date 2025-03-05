import { RecNodeT } from '../shared/cnodes';
import { shape } from '../shared/shape';
import { root } from './root';
import { atPath, noText, selPath, selPathN, selPaths, TestState } from './test-utils';
import { Cursor, selStart } from './utils';
import { expect } from 'bun:test';
import { validate } from './validate';
import { pathWith, withLocs } from './ctdt-test-utils';
import { CTState } from './CTState';

export const ccheck = (state: CTState, exp: RecNodeT<boolean | number | null>, cursor: Cursor, endCursor?: Cursor) => {
    const { main, paths } = selPaths(exp);
    expect(shape(root(state))).toEqual(shape(exp));
    expect({
        sel: state.sel.start.path.children,
        cursor: noText(state.sel.start.cursor),
        endCursor: state.sel.end ? noText(state.sel.end.cursor) : undefined,
        endPath: state.sel.end?.path.children ?? state.sel.start.path.children,
    }).toEqual({
        sel: fixTID(atPath(state.top.root, state.top, main), cursor),
        endPath: fixTID(paths[2] ? atPath(state.top.root, state.top, paths[2]) : atPath(state.top.root, state.top, main), endCursor ?? cursor),
        cursor,
        endCursor,
    });
};

const fixTID = (ids: string[], cursor: Cursor) => {
    if (cursor && cursor.type === 'text' && (cursor.end.index === '' || cursor.end.index === ids[ids.length - 1])) {
        cursor.end.index = ids.pop()!;
    }
    return ids;
};
