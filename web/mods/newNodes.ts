import { splitGraphemes } from '../../src/parse/parse';
import { NewThing } from './getKeyUpdate';
import { Path } from './path';

/** Second wins */
export const mergeNew = (first: NewThing, second: NewThing): NewThing => {
    return {
        ...second,
        map: { ...first.map, ...second.map },
    };
};

export const newBlank = (idx: number): NewThing => {
    return {
        map: {
            [idx]: { type: 'blank', loc: { idx, start: 0, end: 0 } },
        },
        idx,
        selection: [{ idx, type: 'start' }],
    };
};

export const newSpread = (iid: number, last: Path[], idx: number): NewThing => {
    return {
        map: {
            [idx]: {
                type: 'spread',
                contents: iid,
                loc: { idx, start: 0, end: 0 },
            },
        },
        idx,
        selection: [{ idx, type: 'spread-contents' }, ...last],
    };
};

export const newRecordAccess = (
    iid: number,
    text: string,
    idx: number,
    aidx: number,
): NewThing => {
    return {
        map: {
            [idx]: {
                type: 'recordAccess',
                target: iid,
                items: [aidx],
                loc: { idx, start: 0, end: 0 },
            },
            [aidx]: {
                type: 'accessText',
                text: text,
                loc: { idx: aidx, start: 0, end: 0 },
            },
        },
        idx,
        selection: [
            { idx, type: 'attribute', at: 1 },
            {
                idx: aidx,
                type: 'subtext',
                at: 0,
            },
        ],
    };
};

export const newAccessText = (text: string[], idx: number): NewThing => {
    return {
        map: {
            [idx]: {
                type: 'accessText',
                text: text.join(''),
                loc: { idx, start: 0, end: 0 },
            },
        },
        idx,
        selection: [{ idx, type: 'subtext', at: text.length }],
    };
};

export const newId = (key: string[], idx: number): NewThing => {
    return {
        map: {
            [idx]: {
                type: 'identifier',
                text: key.join(''),
                loc: { idx, start: 0, end: 0 },
            },
        },
        idx,
        selection: [{ idx, type: 'subtext', at: key.length }],
    };
};

export const newString = (idx: number, nid: number): NewThing => {
    return {
        map: {
            [idx]: {
                type: 'string',
                first: nid,
                templates: [],
                loc: { idx, start: 0, end: 0 },
            },
            [nid]: {
                type: 'stringText',
                loc: { idx: nid, start: 0, end: 0 },
                text: '',
            },
        },
        idx: idx,
        selection: [
            { idx, type: 'text', at: 0 },
            {
                idx: nid,
                type: 'subtext',
                at: 0,
            },
        ],
    };
};

export function newAnnot(
    target: number,
    idx: number,
    child: NewThing,
): NewThing {
    return {
        map: {
            ...child.map,
            [idx]: {
                type: 'annot',
                target,
                annot: child.idx,
                loc: { start: 0, end: 0, idx },
            },
        },
        idx,
        selection: [{ idx, type: 'annot-annot' }, ...child.selection],
    };
}

export function newListLike(
    kind: 'array' | 'list' | 'record',
    idx: number,
    child?: NewThing,
): NewThing {
    return {
        map: {
            ...child?.map,
            [idx]: {
                type: kind,
                values: child != null ? [child.idx] : [],
                loc: { start: 0, end: 0, idx },
            },
        },
        idx,
        selection: child
            ? [{ idx, type: 'child', at: 0 }, ...child.selection]
            : [{ idx, type: 'inside' }],
    };
}
