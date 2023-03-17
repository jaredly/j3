import { nidx } from '../../src/grammar';
import { splitGraphemes } from '../../src/parse/parse';
import { Path } from '../store';
import { NewThing } from './getKeyUpdate';

/** Second wins */
export const mergeNew = (first: NewThing, second: NewThing): NewThing => {
    return {
        ...second,
        map: { ...first.map, ...second.map },
    };
};

export const newBlank = (idx = nidx()): NewThing => {
    return {
        map: {
            [idx]: { type: 'blank', loc: { idx, start: 0, end: 0 } },
        },
        idx,
        selection: [{ idx, child: { type: 'start' } }],
    };
};

export const newSpread = (
    iid: number,
    last: Path[],
    idx = nidx(),
): NewThing => {
    return {
        map: {
            [idx]: {
                type: 'spread',
                contents: iid,
                loc: { idx, start: 0, end: 0 },
            },
        },
        idx,
        selection: [{ idx, child: { type: 'spread-contents' } }, ...last],
    };
};

export const newRecordAccess = (
    iid: number,
    text: string,
    idx = nidx(),
    aidx = nidx(),
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
            { idx, child: { type: 'attribute', at: 1 } },
            {
                idx: aidx,
                child: { type: 'subtext', at: 0 },
            },
        ],
    };
};

export const newAccessText = (text: string[], idx = nidx()): NewThing => {
    return {
        map: {
            [idx]: {
                type: 'accessText',
                text: text.join(''),
                loc: { idx, start: 0, end: 0 },
            },
        },
        idx,
        selection: [{ idx, child: { type: 'subtext', at: text.length } }],
    };
};

export const newId = (key: string[], idx = nidx()): NewThing => {
    return {
        map: {
            [idx]: {
                type: 'identifier',
                text: key.join(''),
                loc: { idx, start: 0, end: 0 },
            },
        },
        idx,
        selection: [{ idx, child: { type: 'subtext', at: key.length } }],
    };
};

export const newString = (idx = nidx()): NewThing => {
    const nid = nidx();
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
            { idx, child: { type: 'text', at: 0 } },
            {
                idx: nid,
                child: { type: 'subtext', at: 0 },
            },
        ],
    };
};

export function newListLike(
    kind: 'array' | 'list' | 'record',
    idx = nidx(),
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
            ? [{ idx, child: { type: 'child', at: 0 } }, ...child.selection]
            : [{ idx, child: { type: 'inside' } }],
    };
}
