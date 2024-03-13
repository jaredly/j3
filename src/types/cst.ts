// What peggy gives me, and what the structured editor thinks about

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

export type RichText = {
    type: 'rich-text';
    contents: any;
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

    // special
    | { type: 'annot'; target: Node; annot: Node }
    | CString
    | stringText
    | recordAccess
    | accessText
    | spread
    | RichText
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
