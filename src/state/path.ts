// Um the path

export type PathChild =
    | { type: 'card'; card: number }
    | { type: 'ns'; at: number }
    | { type: 'ns-top' }
    | { type: 'child'; at: number }
    | { type: 'subtext'; at: number }
    | { type: 'rich-text'; sel: any }
    | { type: 'expr' | 'text' | 'attribute'; at: number }
    | { type: 'annot-target' | 'annot-annot' }
    | { type: 'tapply-target' }
    | { type: 'inside' | 'start' | 'end' }
    | { type: 'record-target' | 'spread-contents' };

export type Path = PathChild & { idx: number };
export type NsPath = Extract<Path, { type: 'ns' }>;

// Soooo what if I just ran `getNestedNodes` on the shared parent,
// and then compare positions there?
// That would be much nicer.
export const cmpPath = (one: Path, two: Path): number => {
    if (one.type === two.type) {
        switch (one.type) {
            case 'start':
            case 'end':
            case 'inside':
            case 'annot-target':
            case 'annot-annot':
            case 'record-target':
            case 'spread-contents':
            case 'tapply-target':
            case 'ns-top':
            case 'rich-text':
                return 0;
            case 'subtext':
            case 'attribute':
            case 'child':
            case 'expr':
            case 'text':
                return one.at - (two as { at: number }).at;
            case 'ns':
                // THIS IS WRONG because they might be from different cards?
                // but actually maybe it's fine... because if we get this far,
                // it's because the paths match?
                return one.at - (two as Extract<Path, { type: 'ns' }>).at;
            case 'card':
                return one.card - (two as Extract<Path, { type: 'card' }>).card;
            default:
                let _: never = one;
        }
    }
    if (one.type === 'ns-top') {
        return -1;
    }
    if (two.type === 'ns-top') {
        return 1;
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

    if (one.type === 'tapply-target' && two.type === 'child') {
        return -1;
    }
    if (two.type === 'tapply-target' && one.type === 'child') {
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

export const cmpFullPath = (one: Path[], two: Path[]) => {
    for (let i = 0; i < one.length && i < two.length; i++) {
        const o = one[i];
        const t = two[i];
        if (o.idx !== t.idx) {
            console.log(one, two);
            console.log(o.idx, t.idx);
            console.warn(
                `Comparing full paths, different idx for same position?`,
                o,
                t,
            );
            debugger;
            return 0;
        }
        const cmp = cmpPath(o, t);
        if (cmp !== 0) {
            return cmp;
        }
    }
    return 0;
};
