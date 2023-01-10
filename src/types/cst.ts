// What peggy gives me, and what the structured editor thinks about

export type Loc = {
    start: number;
    end: number;
    idx: number;
};

export type Node = {
    contents: NodeContents;
    // decorators: { [key: string]: Node[] };
    loc: Loc;
};
export type NodeList = { type: 'list'; values: Node[] };

export type NodeContents =
    // identifier-like
    | {
          type: 'identifier'; // likeThis
          text: string;
          hash?: string;
      }
    // `LikeThis
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
    | {
          type: 'string';
          first: string;
          templates: { expr: Node; suffix: string }[];
      }
    | { type: 'blank' }
    | { type: 'unparsed'; raw: string };
