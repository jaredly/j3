import { RecNodeT } from '../shared/cnodes';
import { shape } from '../shared/shape';
import { root } from './root';
import { atPath, noText, selPath, selPathN, selPaths, TestState } from './test-utils';
import { Cursor, NodeSelection, selStart, Top } from './utils';
import { expect } from 'bun:test';
import { validate } from './validate';
import { CTop } from './keyActionToCRDTUpdate';
import { pathWith, withLocs } from './ctdt-test-utils';

export type CTState = { ctop: CTop; top: Top; sel: NodeSelection };

export const ticker = () => {
    let i = 0;
    return () => (i++).toString().padStart(3, '0');
};

export const ccheck = (state: CTState, exp: RecNodeT<boolean | number | null>, cursor: Cursor, endCursor?: Cursor) => {
    // const { sels } = withLocs(exp, ticker());
    // if (!sels[1]) throw new Error(`nothing selected?`);

    // const sel: NodeSelection = {
    //     start: selStart(pathWith(sels[1]), cursor),
    //     end: endCursor ? selStart(pathWith(sels[2] ?? sels[1]), endCursor) : undefined,
    // };
    // validate(state);

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

// export const checkm = (state: TestState, exp: RecNodeT<number>, cursor: Cursor) => {
//     expect(shape(root(state))).toEqual(shape(exp));
//     const start = selPathN(exp, 0);
//     if (start == null) throw new Error(`no node marked for selection`);
//     const end = selPathN(exp, 1);
//     const aux = selPathN(exp, 2);
//     expect({
//         sel: state.sel.start.path.children,
//         cursor: noText(state.sel.start.cursor),
//     }).toEqual({
//         sel: atPath(state.top.root, state.top, start),
//         cursor,
//     });
//     // expect(state.sel.multi?.end.path.children ?? null).toEqual(end);
//     // expect(state.sel.multi?.aux?.path.children ?? null).toEqual(aux);
// };
