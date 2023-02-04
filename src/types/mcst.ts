import { Loc, Node, NodeContents, NodeExtra, stringText } from './cst';

export type MNode = MNodeContents & MNodeExtra;
export type MNodeExtra = {
    loc: Loc;
    tannot?: number;
    tapply?: number;
};

export type Atom =
    // identifier-like
    | {
          type: 'identifier'; // likeThis
          text: string;
          hash?: string;
      }
    | { type: 'unparsed'; raw: string }
    // `LikeThis
    | { type: 'tag'; text: string }
    | { type: 'number'; raw: string };

export type ListLikeContents =
    | { type: 'list'; values: number[] }
    | { type: 'record'; values: number[] }
    | { type: 'array'; values: number[] };

export type MNodeContents =
    | Atom
    | ListLikeContents
    | stringText

    // list-like
    | { type: 'comment'; text: string }

    // random stuff
    // | { type: 'spread'; contents: number }
    | MCString
    | { type: 'blank' };
export type MCString = {
    type: 'string';
    first: number;
    templates: { expr: number; suffix: number }[];
};
export type WithLoc<T> = T & { loc: Loc };

export type Map = {
    [key: number]: {
        node: MNode;
    };
};
export type Layout =
    | {
          type: 'flat';
          width: number;
          pos: number;
      }
    | {
          type: 'multiline';
          pairs?: boolean;
          tightFirst: number;
          pos: number;
          // umm I can't remember. do we need something here?
      };

export const fromMNode = (node: MNodeContents, map: Map): NodeContents => {
    switch (node.type) {
        case 'list':
        case 'array':
        case 'record':
            return {
                ...node,
                values: node.values.map((child) => fromMCST(child, map)),
            };
        case 'string':
            return {
                ...node,
                first: fromMCST(node.first, map) as stringText & NodeExtra,
                templates: node.templates.map(({ expr, suffix }) => ({
                    expr: fromMCST(expr, map),
                    suffix: fromMCST(suffix, map) as stringText & NodeExtra,
                })),
            };
        // case 'spread':
        //     return { ...node, contents: fromMCST(node.contents, map) };
        default:
            return node;
    }
};

export const fromMCST = (idx: number, map: Map): Node => {
    const { node } = map[idx];
    return {
        ...node,
        tannot: node.tannot ? fromMCST(node.tannot, map) : undefined,
        tapply: node.tapply ? fromMCST(node.tapply, map) : undefined,
        ...fromMNode(node, map),
    };
};

export const toMNode = (node: NodeContents, map: Map): MNodeContents => {
    switch (node.type) {
        case 'list':
        case 'array':
        case 'record':
            return {
                ...node,
                values: node.values.map((child) => toMCST(child, map)),
            };
        case 'string':
            return {
                ...node,
                first: toMCST(node.first, map),
                templates: node.templates.map(({ expr, suffix }) => ({
                    expr: toMCST(expr, map),
                    suffix: toMCST(suffix, map),
                })),
            };
        // case 'spread':
        //     return { ...node, contents: toMCST(node.contents, map) };
        default:
            return node;
    }
};

export const toMCST = (node: Node, map: Map): number => {
    if (map[node.loc.idx]) {
        console.error(`Duplicate node in map??`, node.loc.idx, map);
    }
    map[node.loc.idx] = {
        node: {
            ...toMNode(node, map),
            loc: node.loc,
            tannot: node.tannot ? toMCST(node.tannot, map) : undefined,
            tapply: node.tapply ? toMCST(node.tapply, map) : undefined,
        },
    };
    return node.loc.idx;
};

const tightFirsts: { [key: string]: number } = { fn: 2, def: 2, defn: 3 };
