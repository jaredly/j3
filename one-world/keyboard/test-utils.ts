import { NodeSelection, selStart, Top } from './lisp';

export type TestState = { top: Top; sel: NodeSelection };

export const initTop: Top = {
    nextLoc: 1,
    nodes: { [0]: { type: 'id', text: '', loc: 0 } },
    root: 0,
};
export const init: TestState = {
    top: initTop,
    sel: {
        start: selStart({ root: { ids: [], top: '' }, children: [0] }, { type: 'id', end: 0 }),
    },
};
