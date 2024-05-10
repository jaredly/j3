// What peggy gives me, and what the structured editor thinks about

import equal from 'fast-deep-equal';

export type Loc = number;

export type NodeList = { type: 'list'; values: Node[] };

export type Identifier = {
    type: 'identifier'; // likeThis
    text: string;
};

export type NodeArray = {
    type: 'array';
    values: Node[];
    hash?: string;
};

export type AttachedFile = {
    handle: string;
    meta:
        | {
              type: 'image';
              width: number;
              mime: string;
              height: number;
          }
        | {
              type: 'generic';
              mime: string;
          };
};

export type Attachment = {
    type: 'attachment';
    name: string;
    file: AttachedFile | null;
};

export type RawCode = {
    type: 'raw-code';
    lang: string;
    raw: string;
};

export type RichText = {
    type: 'rich-text';
    contents: any;
};

const arrEq = <T>(one: T[], two: T[], eq: (a: T, b: T) => boolean) => {
    return one.length === two.length && one.every((one, i) => eq(one, two[i]));
};

export const nodesEqual = (one: NodeContents, two: NodeContents): boolean => {
    if (one.type !== two.type) return false;
    if (one.type === 'identifier' && two.type === 'identifier') {
        return one.text === two.text;
    }
    if (one.type === 'hash' && two.type === 'hash') {
        return one.hash === two.hash;
    }
    if (
        (one.type === 'list' && two.type === 'list') ||
        (one.type === 'record' && two.type === 'record') ||
        (one.type === 'array' && two.type === 'array')
    ) {
        return arrEq(one.values, two.values, nodesEqual);
        // return one.values.length === two.values.length && one.values.every((one, i) => nodesEqual(one, two.values[i]))
    }
    if (one.type === 'comment' && two.type === 'comment') {
        return one.text === two.text;
    }
    if (one.type === 'comment-node' && two.type === 'comment-node') {
        return nodesEqual(one.contents, two.contents);
    }
    if (one.type === 'annot' && two.type === 'annot') {
        return (
            nodesEqual(one.annot, two.annot) &&
            nodesEqual(one.target, two.target)
        );
    }
    if (one.type === 'string' && two.type === 'string') {
        return (
            one.first.text === two.first.text &&
            arrEq(
                one.templates,
                two.templates,
                (one, two) =>
                    one.suffix.text === two.suffix.text &&
                    nodesEqual(one.expr, two.expr),
            )
        );
    }
    if (one.type === 'stringText' && two.type === 'stringText') {
        return one.text === two.text;
    }
    if (one.type === 'recordAccess' && two.type === 'recordAccess') {
        return (
            nodesEqual(one.target, two.target) &&
            arrEq(one.items, two.items, nodesEqual)
        );
    }
    if (one.type === 'accessText' && two.type === 'accessText') {
        return one.text === two.text;
    }
    if (one.type === 'spread' && two.type === 'spread') {
        return nodesEqual(one.contents, two.contents);
    }
    if (one.type === 'rich-text' && two.type === 'rich-text') {
        return equal(one.contents, two.contents);
    }
    if (one.type === 'attachment' && two.type === 'attachment') {
        return false;
    }
    if (one.type === 'tapply' && two.type === 'tapply') {
        return (
            equal(one.target, two.target) &&
            arrEq(one.values, two.values, nodesEqual)
        );
    }
    if (one.type === 'unparsed' && two.type === 'unparsed') {
        return one.raw === two.raw;
    }
    return false;
};

export type NodeContents =
    // identifier-like
    | Identifier
    | { type: 'hash'; hash: string | number }

    // list-like
    | NodeList
    | { type: 'record'; values: Node[] }
    | NodeArray
    | { type: 'comment'; text: string }
    | { type: 'comment-node'; contents: Node }

    // special
    | { type: 'annot'; target: Node; annot: Node }
    | CString
    | stringText
    | recordAccess
    | accessText
    | spread
    | RichText
    | RawCode
    | Attachment
    | tapply
    | { type: 'blank' }
    | { type: 'unparsed'; raw: string };

export type spread = {
    type: 'spread';
    contents: Node;
};
export type accessText = {
    type: 'accessText';
    text: string;
};

export type tapply = {
    type: 'tapply';
    target: Node;
    values: Node[];
};

export type recordAccess = {
    type: 'recordAccess';
    target: (
        | Identifier
        | { type: 'blank' }
        | { type: 'hash'; hash: string | number }
    ) &
        NodeExtra;
    items: (accessText & NodeExtra)[];
};

export type stringText = { type: 'stringText'; text: string };
export type CString = {
    type: 'string';
    first: stringText & NodeExtra;
    templates: { expr: Node; suffix: stringText & NodeExtra }[];
};

export type NodeExtra = {
    loc: Loc;
};
export type Node = NodeContents & NodeExtra;
