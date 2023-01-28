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

export type NodeContents =
    // identifier-like
    | Identifier
    | { type: 'tag'; text: string }
    | { type: 'number'; raw: string }

    // list-like
    | NodeList
    | { type: 'record'; values: Node[] }
    | { type: 'array'; values: Node[] }

    // Ok so the plan is to convert comments to
    // decorators, post-hoc.
    // filling either the `comment:before` or
    // `comment:after` decorators, as arrays.
    // I think comment:after is usually going to be
    // an EOL thing?
    // idk
    // now, there are some places, where it's ok
    // for comments just to be standalone c/ast nodes.
    //
    | { type: 'comment'; text: string }

    // random stuff
    // | { type: 'spread'; contents: Node }
    | CString
    | stringText
    | { type: 'blank' }
    | { type: 'unparsed'; raw: string };
export type stringText = { type: 'stringText'; text: string; loc: Loc };
export type CString = {
    type: 'string';
    first: stringText;
    templates: { expr: Node; suffix: stringText }[];
};

export type Node = NodeContents & {
    // decorators: { [key: string]: Node[] };
    loc: Loc;
};
