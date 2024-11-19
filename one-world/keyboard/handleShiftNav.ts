import { splitGraphemes } from '../../src/parse/splitGraphemes';
import { Id } from '../shared/cnodes';
import { cursorSides } from './cursorSides';
import { justSel } from './handleNav';
import { TestState } from './test-utils';
import { getCurrent, IdCursor, Path, Top, Update } from './utils';

export const handleShiftNav = (state: TestState, key: string): Update | void => {
    const current = getCurrent(state.sel, state.top);
    switch (current.type) {
        case 'id':
            return handleShiftId(current, state.top, key === 'ArrowLeft');
    }
};

export const handleShiftId = ({ node, path, cursor }: { node: Id<number>; path: Path; cursor: IdCursor }, top: Top, left: boolean) => {
    // let {left, right} = cursorSides(cursor)
    if (left && cursor.end === 0) throw new Error('nt not');
    const text = cursor.text ?? splitGraphemes(node.text);
    if (!left && cursor.end === text.length) throw new Error('rt not');
    // left--
    return justSel(path, { ...cursor, start: cursor.start ?? cursor.end, end: cursor.end + (left ? -1 : 1) });
};
