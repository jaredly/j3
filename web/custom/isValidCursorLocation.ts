import { Path } from '../../src/state/path';
import { RegMap } from './UIState';

export const isValidCursorLocation = (
    fullPath: Path[],
    regs: RegMap,
): boolean => {
    const last = fullPath[fullPath.length - 1];
    if (last.type === 'rich-text') return true;
    // const loc = pathPos(fullPath)
    const idx = last.idx;
    // const { idx, loc } = sel;
    const nodes = regs[idx];
    if (!nodes) {
        return false;
    }
    switch (last.type) {
        case 'start':
        case 'end':
        case 'inside':
            const blinker = nodes[last.type];
            if (blinker) {
                return true;
            }
        case 'subtext':
            if (nodes.main) {
                return true;
            } else {
                return false;
            }
    }
    return false;
};
