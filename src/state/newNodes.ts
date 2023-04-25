import { splitGraphemes } from '../parse/parse';
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
            [idx]: { type: 'blank', loc: idx },
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
                loc: idx,
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
                loc: idx,
            },
            [aidx]: {
                type: 'accessText',
                text: text,
                loc: aidx,
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

export const newTapply = (
    tid: number,
    text: string,
    idx: number,
    aidx: number,
): NewThing => {
    return {
        map: {
            [idx]: {
                type: 'tapply',
                target: tid,
                values: text ? [aidx] : [],
                loc: idx,
            },
            ...(text
                ? {
                      [aidx]: {
                          type: 'identifier',
                          text,
                          loc: aidx,
                      },
                  }
                : {}),
        },
        idx,
        selection: text
            ? [
                  { idx, type: 'child', at: 0 },
                  { idx: aidx, type: 'start' },
              ]
            : [{ idx, type: 'inside' }],
    };
};

export const newAccessText = (text: string[], idx: number): NewThing => {
    return {
        map: {
            [idx]: {
                type: 'accessText',
                text: text.join(''),
                loc: idx,
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
                loc: idx,
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
                loc: idx,
            },
            [nid]: {
                type: 'stringText',
                loc: nid,
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
                loc: idx,
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
                loc: idx,
            },
        },
        idx,
        selection: child
            ? [{ idx, type: 'child', at: 0 }, ...child.selection]
            : [{ idx, type: 'inside' }],
    };
}
