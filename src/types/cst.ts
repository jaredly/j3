// What peggy gives me, and what the structured editor thinks about

export type Loc = {
    start: number;
    end: number;
    idx: number;
};

export type Node = {
    contents: NodeContents;
    decorators: { [key: string]: Node };
    loc: Loc;
};

export type NodeContents =
    | {
          type: 'identifier'; // likeThis
          text: string;
      }
    | {
          type: 'tag'; // `LikeThis
          text: string;
      }
    | {
          type: 'number'; // 12.32
          raw: string;
      }
    | {
          type: 'list'; // eh this should be cons & nil, right?
          values: Node[];
      }
    | { type: 'record'; items: Node[] }
    | {
          type: 'array';
          values: Node[];
      }
    | { type: 'comment'; text: string }
    | {
          type: 'spread';
          contents: Node;
      }
    | {
          type: 'string';
          first: string;
          templates: { expr: Node; suffix: string }[];
      }
    | {
          type: 'blank';
      };
