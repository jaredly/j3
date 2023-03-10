// What peggy gives me, and what the structured editor thinks about

export type Loc = {
    start: number;
    end: number;
    idx: number;
};

export type NodeList = { type: 'list'; values: Node[] };

export type Identifier = {
    type: 'identifier'; // likeThis
    text: string;
    hash?: string;
};

export type NodeArray = {
    type: 'array';
    values: Node[];
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
    lexicalJSON: any;
};

export type NodeContents =
    // identifier-like
    | Identifier
    | { type: 'tag'; text: string }
    | { type: 'number'; raw: string }

    // list-like
    | NodeList
    | { type: 'record'; values: Node[] }
    | NodeArray
    | { type: 'comment'; text: string }

    // special
    | CString
    | stringText
    | recordAccess
    | accessText
    | spread
    | RichText
    | Attachment
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

export type recordAccess = {
    type: 'recordAccess';
    target: (Identifier | { type: 'blank' }) & NodeExtra;
    items: (accessText & NodeExtra)[];
};

export type stringText = { type: 'stringText'; text: string };
export type CString = {
    type: 'string';
    first: stringText & NodeExtra;
    templates: { expr: Node; suffix: stringText & NodeExtra }[];
};

export type NodeExtra = {
    tannot?: Node;
    tapply?: Node;
    // decorators: { [key: string]: Node[] };
    loc: Loc;
};
export type Node = NodeContents & NodeExtra;
