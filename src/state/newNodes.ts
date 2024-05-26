import { splitGraphemes } from '../parse/splitGraphemes';
import { MCString, MNode, Map } from '../types/mcst';
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

export const newId = (key: string[], idx: number, at?: number): NewThing => {
    return {
        map: {
            [idx]: {
                type: 'identifier',
                text: key.join(''),
                loc: idx,
            },
        },
        idx,
        selection: [{ idx, type: 'subtext', at: at ?? key.length }],
    };
};

export const newString = (
    idx: number,
    nidx: () => number,
    first?: string,
    expr?: NewThing,
): NewThing => {
    const nid = nidx();
    const map: Map = {
        [idx]: {
            type: 'string',
            first: nid,
            templates: [],
            loc: idx,
        },
        [nid]: {
            type: 'stringText',
            loc: nid,
            text: first ?? '',
        },
    };
    let selection: Path[] = [
        { idx, type: 'text', at: 0 },
        { idx: nid, type: 'subtext', at: 0 },
    ];
    if (expr != null) {
        Object.assign(map, expr.map);
        const sid = nidx();
        map[sid] = {
            type: 'stringText',
            loc: sid,
            text: '',
        };
        (map[idx] as MCString).templates!.push({ expr: expr.idx, suffix: sid });
        selection = [{ idx, type: 'expr', at: 1 }, ...expr.selection];
    }
    return { map, idx: idx, selection };
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
    children?: NewThing[],
    selected: number = children ? children.length - 1 : 0,
): NewThing {
    const map = {
        // ...child?.map,
        [idx]: {
            type: kind,
            values: children?.map((c) => c.idx) ?? [],
            loc: idx,
        },
    };
    children?.forEach((child) => Object.assign(map, child.map));
    return {
        map,
        idx,
        selection: children?.length
            ? [
                  { idx, type: 'child', at: selected },
                  ...children[selected].selection,
              ]
            : [{ idx, type: 'inside' }],
    };
}
