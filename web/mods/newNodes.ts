import { nidx } from '../../src/grammar';
import { splitGraphemes } from '../../src/parse/parse';
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
        selection: { idx, loc: 'start' },
        path: [],
    };
};

export const newSpread = (iid: number, idx = nidx()): NewThing => {
    return {
        map: {
            [idx]: {
                type: 'spread',
                contents: iid,
                loc: { idx, start: 0, end: 0 },
            },
        },
        idx,
        selection: { idx: iid, loc: 0 },
        path: [{ idx, child: { type: 'spread-contents' } }],
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
        selection: { idx: aidx, loc: 0 },
        path: [{ idx, child: { type: 'attribute', at: 0 } }],
    };
};

export const newAccessText = (text: string, idx = nidx()): NewThing => {
    return {
        map: {
            [idx]: {
                type: 'accessText',
                text: text,
                loc: { idx, start: 0, end: 0 },
            },
        },
        idx,
        selection: { idx, loc: text.length },
        path: [],
    };
};

export const newId = (key: string, idx = nidx()): NewThing => {
    return {
        map: {
            [idx]: {
                type: 'identifier',
                text: key,
                loc: { idx, start: 0, end: 0 },
            },
        },
        idx,
        selection: { idx, loc: splitGraphemes(key).length },
        path: [],
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
        selection: { idx: nid, loc: 0 },
        path: [{ idx, child: { type: 'text', at: 0 } }],
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
        path: child
            ? [{ idx, child: { type: 'child', at: 0 } }, ...child.path]
            : [{ idx, child: { type: 'inside' } }],
        selection: child?.selection ?? {
            idx,
            loc: 'inside',
        },
    };
}
