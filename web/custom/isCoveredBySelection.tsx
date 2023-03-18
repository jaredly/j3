import { CoverageLevel, selectionStatus } from '../mods/clipboard';
import { State } from '../mods/getKeyUpdate';
import { Path, PathChild } from '../store';

export const isCoveredBySelection = (
    at: State['at'],
    path: Path[],
    // requireFull = true,
) => {
    // let best: CoverageLevel | null = null
    for (let sel of at) {
        if (!sel.end) {
            continue;
        }
        const coverage = selectionStatus(path, sel.start, sel.end);
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

export const cmpPath = (one: PathChild, two: PathChild): number => {
    if (one.type === two.type) {
        switch (one.type) {
            case 'start':
            case 'end':
            case 'inside':
            case 'annot-target':
            case 'annot-annot':
            case 'record-target':
            case 'spread-contents':
                return 0;
            case 'subtext':
            case 'attribute':
            case 'child':
            case 'expr':
            case 'text':
                return one.at - (two as { at: number }).at;
            default:
                let _: never = one;
        }
    }
    if (one.type === 'end') {
        return 1;
    }
    if (two.type === 'end') {
        return -1;
    }
    if (one.type === 'start') {
        return -1;
    }
    if (two.type === 'start') {
        return 1;
    }
    if (one.type === 'expr' && two.type === 'text') {
        return one.at <= two.at ? -1 : 1;
    }
    if (one.type === 'text' && two.type === 'expr') {
        return two.at <= one.at ? 1 : -1;
    }

    if (one.type === 'annot-target' && two.type === 'annot-annot') {
        return -1;
    }
    if (two.type === 'annot-target' && one.type === 'annot-annot') {
        return 1;
    }

    if (one.type === 'record-target' && two.type === 'attribute') {
        return -1;
    }
    if (two.type === 'record-target' && one.type === 'attribute') {
        return 1;
    }
    throw new Error(`Comparing ${one.type} to ${two.type}, unexpected`);
};
// If `one` has a *longer* length than two, it will be considered
// greater. Otherwise, it'll be considered equal

export const cmpFullPath = (one: Path[], two: Path[]) => {
    for (let i = 0; i < one.length && i < two.length; i++) {
        const o = one[i];
        const t = two[i];
        if (o.idx !== t.idx) {
            throw new Error(
                `Comparing full paths, different idx for same position?`,
            );
        }
        const cmp = cmpPath(o.child, t.child);
        if (cmp !== 0) {
            return cmp;
        }
    }
    return 0;
};
