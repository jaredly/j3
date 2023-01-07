import { Loc, Node, NodeContents } from './cst';

export type MNode = {
    contents: MNodeContents;
    // decorators: { [key: string]: number[] };
    loc: Loc;
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

    // list-like
    | { type: 'comment'; text: string }

    // random stuff
    | { type: 'spread'; contents: number }
    | {
          type: 'string';
          first: string;
          templates: { expr: number; suffix: string }[];
      }
    | { type: 'blank' };

export type Map = {
    [key: number]: {
        node: MNode;
        layout?:
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
    };
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
                templates: node.templates.map(({ expr, suffix }) => ({
                    expr: fromMCST(expr, map),
                    suffix,
                })),
            };
        case 'spread':
            return { ...node, contents: fromMCST(node.contents, map) };
        default:
            return node;
    }
};

export const fromMCST = (idx: number, map: Map): Node => {
    const { node } = map[idx];
    return {
        ...node,
        contents: fromMNode(node.contents, map),
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
                templates: node.templates.map(({ expr, suffix }) => ({
                    expr: toMCST(expr, map),
                    suffix,
                })),
            };
        case 'spread':
            return { ...node, contents: toMCST(node.contents, map) };
        default:
            return node;
    }
};

export const toMCST = (node: Node, map: Map): number => {
    if (map[node.loc.idx]) {
        console.error(`Duplicate node in map??`, node.loc.idx, map);
    }
    map[node.loc.idx] = {
        node: { ...node, contents: toMNode(node.contents, map) },
    };
    return node.loc.idx;
};

const tightFirsts: { [key: string]: number } = { fn: 2, def: 2, defn: 3 };
