import { Map } from '../../src/types/mcst';
import { CoverageLevel, selectionStatus } from '../../src/state/clipboard';
import { State } from '../../src/state/getKeyUpdate';
import { Path } from '../../src/state/path';
import { NsMap } from './UIState';

export const isCoveredBySelection = (
    at: State['at'],
    path: Path[],
    map: Map,
    nsMap: NsMap,
) => {
    // let best: CoverageLevel | null = null
    for (let sel of at) {
        if (!sel.end) {
            continue;
        }
        const coverage = selectionStatus(path, sel.start, sel.end, map, nsMap);
        if (coverage) {
            return coverage;
        }
        // if (coverage === 'full') {
        //     return true;
        // }
        // if (!requireFull && coverage === 'partial') {
        //     return true;
        // }
    }
    return null;
};
// If `one` has a *longer* length than two, it will be considered
// greater. Otherwise, it'll be considered equal
